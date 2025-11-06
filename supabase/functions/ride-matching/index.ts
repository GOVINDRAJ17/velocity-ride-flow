import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient, ObjectId } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MONGODB_URI = Deno.env.get('MONGODB_CONNECTION_URL');

let client: MongoClient | null = null;

async function getMongoClient() {
  if (!client) {
    client = new MongoClient();
    await client.connect(MONGODB_URI!);
  }
  return client;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ride, userId } = await req.json();
    const mongoClient = await getMongoClient();
    const db = mongoClient.database("riderapp");
    const ridesCollection = db.collection("rides");

    console.log('Action:', action, 'User:', userId);

    switch (action) {
      case 'CREATE_RIDE': {
        const rideDoc = {
          ...ride,
          userId: userId || 'anonymous',
          createdAt: new Date(),
          status: 'active'
        };
        
        const result = await ridesCollection.insertOne(rideDoc);
        console.log('Ride created:', result);
        
        return new Response(
          JSON.stringify({ success: true, id: result.toString() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'GET_MATCHED_RIDES': {
        const { pickup, dropoff, location } = ride || {};
        
        // Find all active rides
        const allRides = await ridesCollection.find({ status: 'active' }).toArray();
        
        // Matching algorithm: Calculate similarity score
        const matchedRides = allRides
          .map((r: any) => {
            let score = 0;
            
            // Match pickup location (fuzzy)
            if (pickup && r.pickup) {
              const pickupMatch = calculateLocationMatch(pickup.toLowerCase(), r.pickup.toLowerCase());
              score += pickupMatch * 40; // 40% weight
            }
            
            // Match dropoff location (fuzzy)
            if (dropoff && r.dropoff) {
              const dropoffMatch = calculateLocationMatch(dropoff.toLowerCase(), r.dropoff.toLowerCase());
              score += dropoffMatch * 40; // 40% weight
            }
            
            // Match by location proximity (if GPS coordinates provided)
            if (location && r.location) {
              const distanceMatch = calculateDistanceMatch(location, r.location);
              score += distanceMatch * 20; // 20% weight
            }
            
            return {
              ...r,
              id: r._id.toString(),
              matchScore: score
            };
          })
          .filter((r: any) => r.matchScore > 30) // Only return rides with >30% match
          .sort((a: any, b: any) => b.matchScore - a.matchScore);
        
        console.log('Matched rides:', matchedRides.length);
        
        return new Response(
          JSON.stringify({ rides: matchedRides }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'GET_USER_RIDES': {
        const userRides = await ridesCollection
          .find({ userId, status: 'active' })
          .sort({ createdAt: -1 })
          .toArray();
        
        const formattedRides = userRides.map((r: any) => ({
          ...r,
          id: r._id.toString()
        }));
        
        console.log('User rides:', formattedRides.length);
        
        return new Response(
          JSON.stringify({ rides: formattedRides }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'DELETE_RIDE': {
        const { rideId } = ride;
        await ridesCollection.updateOne(
          { _id: new ObjectId(rideId) },
          { $set: { status: 'deleted' } }
        );
        
        console.log('Ride deleted:', rideId);
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in ride-matching function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to calculate location match (fuzzy string matching)
function calculateLocationMatch(str1: string, str2: string): number {
  // Simple word-based matching
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  
  let matchCount = 0;
  words1.forEach(word1 => {
    if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      matchCount++;
    }
  });
  
  return matchCount / Math.max(words1.length, words2.length);
}

// Helper function to calculate distance-based match
function calculateDistanceMatch(loc1: string, loc2: string): number {
  // Parse coordinates if provided as "lat,lng"
  const coords1 = loc1.split(',').map(c => parseFloat(c.trim()));
  const coords2 = loc2.split(',').map(c => parseFloat(c.trim()));
  
  if (coords1.length !== 2 || coords2.length !== 2) {
    return 0;
  }
  
  // Haversine formula for distance
  const R = 6371; // Earth's radius in km
  const dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
  const dLon = (coords2[1] - coords1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Return match score: 1.0 if within 2km, decreasing to 0 at 10km
  if (distance < 2) return 1.0;
  if (distance > 10) return 0;
  return 1 - ((distance - 2) / 8);
}
