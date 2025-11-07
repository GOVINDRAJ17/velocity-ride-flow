import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import mumbaiMap from "@/assets/mumbai-map.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StripeCheckout from "./StripeCheckout";

interface Ride {
  id: string;
  ride_name: string;
  pickup_location: string;
  dropoff_location: string;
  seats_available: number;
  fare_estimate: number;
  profiles?: { full_name: string };
  matchScore?: number;
}

const Location = () => {
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("Getting location...");
  const [nearbyRides, setNearbyRides] = useState<Ride[]>([]);
  const [selectedRideForPayment, setSelectedRideForPayment] = useState<Ride | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyRides();
    }
  }, [userLocation]);

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setHasLocationPermission(true);
          setLocationName("Mumbai, Maharashtra, India");
          
          if (user) {
            saveUserLocation(lat, lng);
          }
        },
        () => {
          setHasLocationPermission(false);
          setLocationName("Location access denied");
          toast.error("Location access denied. Please enable location services.");
        }
      );
    }
  };

  const saveUserLocation = async (lat: number, lng: number) => {
    try {
      await supabase.from("profiles").update({ location_lat: lat, location_lng: lng, location_consent: true }).eq("id", user?.id);
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const fetchNearbyRides = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ride-matching', {
        body: { action: 'GET_MATCHED_RIDES', ride: { pickup: "Mumbai", dropoff: "Mumbai" }, userId: user?.id }
      });
      if (error) throw error;
      setNearbyRides(data.rides || []);
    } catch (error: any) {
      console.error("Error fetching nearby rides:", error);
    }
  };

  const joinRide = async (rideId: string) => {
    if (!user) {
      toast.error("Please login to join rides");
      return;
    }
    try {
      const { error } = await supabase.from("ride_participants").insert({ ride_id: rideId, user_id: user.id });
      if (error) throw error;
      toast.success("Successfully joined the ride!");
      fetchNearbyRides();
    } catch (error: any) {
      toast.error(error.message || "Failed to join ride");
    }
  };

  return (
    <section id="location" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-card border-2">
          <CardHeader className="gradient-primary text-white">
            <CardTitle className="flex items-center gap-2 text-white"><MapPin />Find Nearby Rides</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {hasLocationPermission === false ? (
              <div className="text-center py-12">
                <Navigation className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="font-semibold mb-2">Location Access Required</p>
                <Button onClick={requestLocationPermission}>Enable Location</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Current Location</h4>
                  </div>
                  <p className="text-sm">{locationName}</p>
                </div>
                <div className="rounded-lg overflow-hidden border-2">
                  <img src={mumbaiMap} alt="Mumbai Map" className="w-full h-64 object-cover" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Available Rides Nearby</h4>
                  {nearbyRides.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No rides available nearby</p>
                  ) : (
                    nearbyRides.map((ride) => (
                      <Card key={ride.id} className="bg-muted/50 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="font-semibold">{ride.ride_name}</p>
                              <p className="text-xs text-muted-foreground mt-1">Driver: {ride.profiles?.full_name || "Rahul Mehta"}</p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                                <MapPin className="h-3 w-3" />
                                <span className="text-xs">{ride.pickup_location} → {ride.dropoff_location}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-sm">
                                <span>{ride.seats_available} seats</span>
                                <span className="font-semibold text-primary flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />₹{ride.fare_estimate}
                                </span>
                              </div>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setSelectedRideForPayment(ride)}>Book Now</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>Complete Booking</DialogTitle></DialogHeader>
                                {selectedRideForPayment && (
                                  <StripeCheckout
                                    rideId={selectedRideForPayment.id}
                                    amount={selectedRideForPayment.fare_estimate}
                                    rideName={selectedRideForPayment.ride_name}
                                    onSuccess={() => { joinRide(selectedRideForPayment.id); setSelectedRideForPayment(null); }}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Location;
