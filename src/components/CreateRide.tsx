import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Users, Car } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CreateRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    pickup: "",
    dropoff: "",
    time: "",
    type: "solo",
    rideName: "",
    estimatedFare: "12.50",
  });

  const [offerData, setOfferData] = useState({
    driverName: "",
    vehicle: "",
    seats: "",
    route: "",
    timing: "",
  });

  const handleBookRide = async () => {
    if (!user) {
      toast.error("Please login to book a ride");
      navigate("/auth");
      return;
    }

    if (!bookingData.pickup || !bookingData.dropoff || !bookingData.time || !bookingData.rideName) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const newRide = {
        rideName: bookingData.rideName,
        pickup: bookingData.pickup,
        dropoff: bookingData.dropoff,
        time: bookingData.time,
        type: "request",
        estimatedFare: bookingData.estimatedFare,
        date: bookingData.time,
      };

      const { data, error } = await supabase.functions.invoke('ride-matching', {
        body: {
          action: 'CREATE_RIDE',
          ride: newRide,
          userId: user.id
        }
      });

      if (error) throw error;

      toast.success("Ride created successfully!");
      setBookingData({ pickup: "", dropoff: "", time: "", type: "solo", rideName: "", estimatedFare: "12.50" });
      
      window.dispatchEvent(new Event('ridesUpdated'));
    } catch (error: any) {
      console.error('Error creating ride:', error);
      toast.error(error.message || "Failed to book ride");
    } finally {
      setLoading(false);
    }
  };

  const handleOfferRide = async () => {
    if (!user) {
      toast.error("Please login to offer a ride");
      navigate("/auth");
      return;
    }

    if (!offerData.driverName || !offerData.vehicle || !offerData.seats) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const newRide = {
        rideName: `${offerData.driverName}'s Ride`,
        pickup: offerData.route.split("→")[0]?.trim() || "Starting point",
        dropoff: offerData.route.split("→")[1]?.trim() || "Destination",
        time: offerData.timing,
        type: "offer",
        estimatedFare: "0",
        driverName: offerData.driverName,
        vehicle: offerData.vehicle,
        seats: offerData.seats,
        date: offerData.timing,
      };

      const { data, error } = await supabase.functions.invoke('ride-matching', {
        body: {
          action: 'CREATE_RIDE',
          ride: newRide,
          userId: user.id
        }
      });

      if (error) throw error;

      toast.success("Ride offered successfully!");
      setOfferData({ driverName: "", vehicle: "", seats: "", route: "", timing: "" });
      
      window.dispatchEvent(new Event('ridesUpdated'));
    } catch (error: any) {
      console.error('Error offering ride:', error);
      toast.error(error.message || "Failed to post ride offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="create" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-5xl font-bold mb-4">Create and Join a Ride</h2>
          <p className="text-muted-foreground text-xl">Create your own ride or join available rides</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="book" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="book" className="text-lg py-3">Create a Ride</TabsTrigger>
              <TabsTrigger value="offer" className="text-lg py-3">Join a Ride</TabsTrigger>
            </TabsList>

            <TabsContent value="book">
              <Card className="shadow-card hover:shadow-hover transition-all hover:scale-[1.01] border-2 rounded-3xl animate-fade-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <MapPin className="text-primary" />
                    Book Your Ride
                  </CardTitle>
                  <CardDescription>Enter your trip details to find the perfect ride</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="rideName">Ride Name</Label>
                    <Input
                      id="rideName"
                      placeholder="e.g., Pool to College"
                      value={bookingData.rideName}
                      onChange={(e) => setBookingData({ ...bookingData, rideName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickup">Pickup Location</Label>
                    <Input
                      id="pickup"
                      placeholder="Enter pickup address"
                      value={bookingData.pickup}
                      onChange={(e) => setBookingData({ ...bookingData, pickup: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dropoff">Drop-off Location</Label>
                    <Input
                      id="dropoff"
                      placeholder="Enter destination"
                      value={bookingData.dropoff}
                      onChange={(e) => setBookingData({ ...bookingData, dropoff: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time" className="flex items-center gap-2">
                        <Calendar size={16} />
                        Pickup Time
                      </Label>
                      <Input
                        id="time"
                        type="datetime-local"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users size={16} />
                        Ride Type
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={bookingData.type === "solo" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setBookingData({ ...bookingData, type: "solo" })}
                        >
                          Solo
                        </Button>
                        <Button
                          type="button"
                          variant={bookingData.type === "shared" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setBookingData({ ...bookingData, type: "shared" })}
                        >
                          Shared
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedFare" className="flex items-center gap-2 text-sm font-medium">
                        <DollarSign size={16} />
                        Estimated Fare (Editable)
                      </Label>
                      <Input
                        id="estimatedFare"
                        type="number"
                        step="0.01"
                        min="0"
                        value={bookingData.estimatedFare}
                        onChange={(e) => setBookingData({ ...bookingData, estimatedFare: e.target.value })}
                        className="text-2xl font-bold text-primary bg-background"
                      />
                    </div>
                  </div>

                  <Button onClick={handleBookRide} disabled={loading} className="w-full gradient-primary text-primary-foreground hover:shadow-hover transition-smooth text-lg py-6">
                    {loading ? "Booking..." : "Confirm Booking"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offer">
              <Card className="shadow-card hover:shadow-hover transition-all hover:scale-[1.01] border-2 rounded-3xl animate-fade-right">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Car className="text-primary" />
                    Offer Your Ride
                  </CardTitle>
                  <CardDescription>Share your ride and earn while helping others</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input
                      id="driverName"
                      placeholder="Your full name"
                      value={offerData.driverName}
                      onChange={(e) => setOfferData({ ...offerData, driverName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle">Vehicle Details</Label>
                      <Input
                        id="vehicle"
                        placeholder="e.g., Toyota Camry 2023"
                        value={offerData.vehicle}
                        onChange={(e) => setOfferData({ ...offerData, vehicle: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seats">Available Seats</Label>
                      <Input
                        id="seats"
                        type="number"
                        min="1"
                        max="7"
                        placeholder="Number of seats"
                        value={offerData.seats}
                        onChange={(e) => setOfferData({ ...offerData, seats: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="route">Route</Label>
                    <Input
                      id="route"
                      placeholder="Start → Destination"
                      value={offerData.route}
                      onChange={(e) => setOfferData({ ...offerData, route: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timing">Departure Time</Label>
                    <Input
                      id="timing"
                      type="datetime-local"
                      value={offerData.timing}
                      onChange={(e) => setOfferData({ ...offerData, timing: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleOfferRide} disabled={loading} className="w-full gradient-primary text-primary-foreground hover:shadow-hover transition-smooth text-lg py-6">
                    {loading ? "Posting..." : "Post Ride Offer"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default CreateRide;
