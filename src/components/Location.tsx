import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import mumbaiMap from "@/assets/mumbai-map.jpg";
import { supabase } from "@/integrations/supabase/client";

interface Ride {
  id: string;
  rideName: string;
  pickup: string;
  dropoff: string;
  time: string;
  type: string;
  estimatedFare: string;
  driverName?: string;
  vehicle?: string;
  seats?: string;
}

const Location = () => {
  const [location, setLocation] = useState<string>("Getting location...");
  const [nearbyRides, setNearbyRides] = useState<Ride[]>([]);
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    loadRides();
    
    // Listen for ride updates
    const handleRidesUpdated = () => loadRides();
    window.addEventListener('ridesUpdated', handleRidesUpdated);
    
    return () => window.removeEventListener('ridesUpdated', handleRidesUpdated);
  }, [location]);

  const loadRides = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ride-matching', {
        body: {
          action: 'GET_MATCHED_RIDES',
          ride: {
            pickup: '',
            dropoff: '',
            location: location
          }
        }
      });

      if (error) throw error;
      
      if (data?.rides) {
        setNearbyRides(data.rides);
      }
    } catch (error) {
      console.error('Error loading rides:', error);
    }
  };

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)} - Mumbai, India`);
          setLocationEnabled(true);
          toast.success("Location enabled!");
          loadRides();
        },
        (error) => {
          toast.error("Location access denied");
          setLocation("123 Market Street, Mumbai, India");
          setLocationEnabled(true);
        }
      );
    } else {
      toast.error("Geolocation not supported");
      setLocation("123 Market Street, Mumbai, India");
      setLocationEnabled(true);
    }
  };

  return (
    <section id="location" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Find Nearby Rides</h2>
          <p className="text-muted-foreground text-lg">Discover rides around you</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Preview */}
          <Card className="shadow-soft border-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="text-primary" />
                Your Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mumbai Map */}
              <div className="relative h-96 overflow-hidden">
                <img 
                  src={mumbaiMap} 
                  alt="Mumbai Map" 
                  className="w-full h-full object-cover"
                />
                
                {/* Animated location marker */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-hover">
                    <MapPin className="text-white" size={32} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full animate-ping"></div>
                </div>
              </div>
              
              <div className="p-4 bg-card">
                {!locationEnabled ? (
                  <Button 
                    onClick={requestLocation}
                    className="w-full gradient-primary text-primary-foreground"
                  >
                    <Navigation className="mr-2" size={16} />
                    Enable Location
                  </Button>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation size={16} className="text-primary" />
                      <span className="text-sm font-medium">Current Location</span>
                    </div>
                    <p className="text-muted-foreground">{location}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search & Nearby Rides */}
          <div className="space-y-6">
            <Card className="shadow-soft border-2">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    placeholder="Search destination..."
                    className="pl-10 h-12 text-lg"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="text-primary" />
                  Nearby Available Rides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {nearbyRides.length > 0 ? (
                  nearbyRides.map((ride) => (
                    <div
                      key={ride.id}
                      className="border border-border rounded-lg p-4 hover:shadow-soft transition-smooth bg-card"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {ride.rideName?.charAt(0) || 'R'}
                          </div>
                          <div>
                            <div className="font-semibold">{ride.rideName || 'Ride'}</div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <span>{ride.pickup}</span>
                              <span>→</span>
                              <span>{ride.dropoff}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">₹{ride.estimatedFare}</div>
                          <div className="text-sm text-muted-foreground">{ride.type}</div>
                        </div>
                      </div>
                      
                      <Button className="w-full gradient-primary text-primary-foreground hover:shadow-hover transition-smooth">
                        Request Ride
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="mx-auto mb-2 opacity-50" size={48} />
                    <p>No rides available nearby</p>
                    <p className="text-sm">Create a ride to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
