import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Ride {
  id: string;
  ride_name: string;
  pickup_location: string;
  dropoff_location: string;
  seats_available: number;
  fare_estimate: number;
}

const NearbyRidesMap = () => {
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyRides, setNearbyRides] = useState<Ride[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      initGoogleMap();
      fetchNearbyRides();
    }
  }, [userLocation]);

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setHasLocationPermission(true);
          
          // Save location to profile
          if (user) {
            saveUserLocation(position.coords.latitude, position.coords.longitude);
          }
        },
        (error) => {
          setHasLocationPermission(false);
          toast.error("Location access denied. Please enable location services.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const saveUserLocation = async (lat: number, lng: number) => {
    try {
      await supabase
        .from("profiles")
        .update({
          location_lat: lat,
          location_lng: lng,
          location_consent: true,
        })
        .eq("id", user?.id);
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const fetchNearbyRides = async () => {
    try {
      const { data, error } = await supabase
        .from("rides")
        .select(`
          id, ride_name, pickup_location, dropoff_location, seats_available, fare_estimate,
          profiles:user_id (is_verified, location_lat, location_lng)
        `)
        .eq("ride_type", "offer")
        .eq("status", "pending")
        .limit(50);

      if (error) throw error;

      const verifiedRides = (data || []).filter((ride: any) => ride.profiles?.is_verified);
      setNearbyRides(verifiedRides);
      renderMarkers(verifiedRides);
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
      const { error } = await supabase
        .from("ride_participants")
        .insert({
          ride_id: rideId,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success("Successfully joined the ride!");
      fetchNearbyRides();
    } catch (error: any) {
      toast.error(error.message || "Failed to join ride");
    }
  };

  const loadGoogleMaps = () => {
    if ((window as any).google?.maps) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn("Missing VITE_GOOGLE_MAPS_API_KEY");
        resolve();
        return;
      }
      const scriptId = "google-maps-script";
      if (document.getElementById(scriptId)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.body.appendChild(script);
    });
  };

  const initGoogleMap = async () => {
    await loadGoogleMaps();
    if (!mapRef.current || !(window as any).google?.maps || !userLocation) return;
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 13,
      disableDefaultUI: true,
    });
    new google.maps.Marker({
      position: userLocation,
      map: mapInstance.current,
      title: "You",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: "#2563eb",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "white",
      },
    });
  };

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  const renderMarkers = (rides: any[]) => {
    if (!mapInstance.current || !(window as any).google?.maps) return;
    clearMarkers();
    const info = new google.maps.InfoWindow();

    rides.forEach((ride) => {
      const lat = ride.profiles?.location_lat;
      const lng = ride.profiles?.location_lng;
      if (typeof lat !== "number" || typeof lng !== "number") return;
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current!,
        title: ride.ride_name,
      });
      marker.addListener("click", () => {
        const content = `<div style="font-family: ui-sans-serif, system-ui; min-width: 220px">\n          <div style=\"font-weight:600; margin-bottom:4px\">${ride.ride_name || "Ride"}</div>\n          <div style=\"font-size:12px; color:#475569\">${ride.pickup_location} → ${ride.dropoff_location}</div>\n          <div style=\"font-size:12px; margin-top:6px\">Seats: ${ride.seats_available ?? "-"} • ${ride.fare_estimate ?? "-"}</div>\n          <button id=\"join-ride-${ride.id}\" style=\"margin-top:8px; width:100%; padding:8px 10px; border-radius:10px; background:#0f172a; color:white; border:none; cursor:pointer\">Join Ride</button>\n        </div>`;
        info.setContent(content);
        info.open({ map: mapInstance.current!, anchor: marker });
        setTimeout(() => {
          const btn = document.getElementById(`join-ride-${ride.id}`);
          btn?.addEventListener("click", () => joinRide(ride.id));
        }, 0);
      });
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    const channel = supabase
      .channel("rides_nearby_updates")
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rides' },
        () => fetchNearbyRides()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <Card className="shadow-soft border-2">
      <CardHeader className="gradient-primary text-white">
        <CardTitle className="flex items-center gap-2 text-white">
          <MapPin />
          Find Nearby Rides
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {hasLocationPermission === false ? (
          <div className="text-center py-12">
            <Navigation className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="font-semibold mb-2">Location Access Required</p>
            <p className="text-sm text-muted-foreground mb-4">
              Please enable location services to see nearby rides
            </p>
            <Button onClick={requestLocationPermission}>
              Enable Location
            </Button>
          </div>
        ) : hasLocationPermission === null ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Requesting location access...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Map placeholder - In production, integrate Google Maps */}
            <div className="bg-muted/30 rounded-lg h-64 flex items-center justify-center border-2 border-dashed">
              <div className="text-center">
                <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Google Maps integration
                  <br />
                  (Add GOOGLE_MAPS_API_KEY)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Available Rides Nearby</h4>
              {nearbyRides.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No verified rides available nearby
                </p>
              ) : (
                nearbyRides.map((ride) => (
                  <Card key={ride.id} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{ride.ride_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {ride.pickup_location} → {ride.dropoff_location}
                          </p>
                          <p className="text-sm mt-1">
                            {ride.seats_available} seats • ${ride.fare_estimate}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => joinRide(ride.id)}>
                          Join Ride
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <p>🔒 Privacy Note: Your location is only shared with verified ride participants</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyRidesMap;
