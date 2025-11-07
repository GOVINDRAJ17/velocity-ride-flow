import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ride, userId } = await req.json();
    console.log('Action:', action, 'User:', userId);

    switch (action) {
      case 'CREATE_RIDE': {
        const rideData = {
          user_id: userId,
          ride_name: ride.rideName,
          pickup_location: ride.pickup,
          dropoff_location: ride.dropoff,
          ride_date: new Date(ride.time),
          ride_type: ride.type === 'offer' ? 'offer' : 'request',
          seats_available: ride.seats ? parseInt(ride.seats) : 1,
          fare_estimate: parseFloat(ride.estimatedFare || '0'),
          vehicle_details: ride.vehicle || null,
          status: 'pending'
        };
        
        const { data, error } = await supabase
          .from('rides')
          .insert([rideData])
          .select()
          .single();
        
        if (error) throw error;
        console.log('Ride created:', data.id);
        
        return new Response(
          JSON.stringify({ success: true, id: data.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'GET_MATCHED_RIDES': {
        const { pickup, dropoff } = ride || {};
        
        // Get all available rides
        const { data: allRides, error } = await supabase
          .from('rides')
          .select('*, profiles!rides_user_id_fkey(full_name, avatar_url)')
          .eq('ride_type', 'offer')
          .eq('status', 'pending');
        
        if (error) throw error;
        
        // Matching algorithm
        const matchedRides = (allRides || [])
          .map((r: any) => {
            let score = 0;
            
            if (pickup && r.pickup_location) {
              const pickupMatch = calculateLocationMatch(
                pickup.toLowerCase(), 
                r.pickup_location.toLowerCase()
              );
              score += pickupMatch * 50;
            }
            
            if (dropoff && r.dropoff_location) {
              const dropoffMatch = calculateLocationMatch(
                dropoff.toLowerCase(), 
                r.dropoff_location.toLowerCase()
              );
              score += dropoffMatch * 50;
            }
            
            return { ...r, matchScore: score };
          })
          .filter((r: any) => r.matchScore > 30)
          .sort((a: any, b: any) => b.matchScore - a.matchScore);
        
        console.log('Matched rides:', matchedRides.length);
        
        return new Response(
          JSON.stringify({ rides: matchedRides }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'GET_USER_RIDES': {
        const { data: userRides, error } = await supabase
          .from('rides')
          .select('*')
          .eq('user_id', userId)
          .neq('status', 'deleted')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        console.log('User rides:', userRides?.length || 0);
        
        return new Response(
          JSON.stringify({ rides: userRides || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'DELETE_RIDE': {
        const { rideId } = ride;
        const { error } = await supabase
          .from('rides')
          .update({ status: 'deleted' })
          .eq('id', rideId);
        
        if (error) throw error;
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

