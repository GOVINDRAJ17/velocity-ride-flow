import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Users, Car } from "lucide-react";
import { toast } from "sonner";

const CreateRide = () => {
  const [bookingData, setBookingData] = useState({
    pickup: "",
    dropoff: "",
    time: "",
    type: "solo",
  });

  const [offerData, setOfferData] = useState({
    driverName: "",
    vehicle: "",
    seats: "",
    route: "",
    timing: "",
  });

  const handleBookRide = () => {
    if (!bookingData.pickup || !bookingData.dropoff || !bookingData.time) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Ride booked successfully! Finding nearby drivers...");
  };

  const handleOfferRide = () => {
    if (!offerData.driverName || !offerData.vehicle || !offerData.seats) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Ride offer posted! Passengers will be notified.");
  };

  return (
    <section id="create" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Create Your Ride</h2>
          <p className="text-muted-foreground text-lg">Book a ride or offer one to fellow travelers</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="book" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="book" className="text-lg py-3">Book a Ride</TabsTrigger>
              <TabsTrigger value="offer" className="text-lg py-3">Offer a Ride</TabsTrigger>
            </TabsList>

            <TabsContent value="book">
              <Card className="shadow-soft border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="text-primary" />
                    Book Your Ride
                  </CardTitle>
                  <CardDescription>Enter your trip details to find the perfect ride</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <DollarSign size={16} />
                        Estimated Fare
                      </span>
                      <span className="text-2xl font-bold text-primary">$12.50</span>
                    </div>
                  </div>

                  <Button onClick={handleBookRide} className="w-full gradient-primary text-primary-foreground hover:shadow-hover transition-smooth text-lg py-6">
                    Confirm Booking
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offer">
              <Card className="shadow-soft border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
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

                  <Button onClick={handleOfferRide} className="w-full gradient-primary text-primary-foreground hover:shadow-hover transition-smooth text-lg py-6">
                    Post Ride Offer
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
