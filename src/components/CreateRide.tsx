import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Users, Car, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('create');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

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
      const { data, error } = await supabase.from("rides").insert({
        user_id: user.id,
        ride_type: "book",
        ride_name: bookingData.rideName,
        pickup_location: bookingData.pickup,
        dropoff_location: bookingData.dropoff,
        ride_date: bookingData.time,
        ride_mode: bookingData.type,
        fare_estimate: parseFloat(bookingData.estimatedFare),
        status: "pending",
      }).select().single();

      if (error) throw error;

      toast.success(`Ride created! Your radio code: ${data.radio_code}`, {
        duration: 5000,
        description: "Share this code with your passengers to sync music"
      });
      setBookingData({ pickup: "", dropoff: "", time: "", type: "solo", rideName: "", estimatedFare: "12.50" });
    } catch (error: any) {
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
      const { data, error } = await supabase.from("rides").insert({
        user_id: user.id,
        ride_type: "offer",
        pickup_location: offerData.route.split("→")[0]?.trim() || "Starting point",
        dropoff_location: offerData.route.split("→")[1]?.trim() || "Destination",
        ride_date: offerData.timing,
        seats_available: parseInt(offerData.seats),
        vehicle_details: `${offerData.driverName} - ${offerData.vehicle}`,
        status: "pending",
      }).select().single();

      if (error) throw error;

      toast.success(`Ride offered! Your radio code: ${data.radio_code}`, {
        duration: 5000,
        description: "Share this code with passengers to sync music"
      });
      setOfferData({ driverName: "", vehicle: "", seats: "", route: "", timing: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to post ride offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="create" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-8 sm:mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-4 sm:mb-6 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 sm:mr-3 animate-pulse" />
            Create & Join Rides
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-thin tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-4">Create & Join Rides</h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-light">Find or create the perfect ride for your journey</p>
        </div>

        <div className={`max-w-5xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Tabs defaultValue="book" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 h-12 sm:h-14 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <TabsTrigger value="book" className="text-base sm:text-lg py-3 font-light hover:scale-105 transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg active:scale-95">Book a Ride</TabsTrigger>
              <TabsTrigger value="offer" className="text-base sm:text-lg py-3 font-light hover:scale-105 transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg active:scale-95">Offer a Ride</TabsTrigger>
            </TabsList>

            <TabsContent value="book">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                <CardHeader className="pb-6 sm:pb-8">
                  <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-light text-slate-900 dark:text-white">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <MapPin className="text-blue-500 w-4 h-4" />
                    </div>
                    Book Your Ride
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300 text-base">Find and book rides with other students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="pickup" className="text-slate-700 dark:text-slate-300 text-sm font-medium">Pickup Location</Label>
                      <Input
                        id="pickup"
                        placeholder="e.g., Library"
                        value={bookingData.pickup}
                        onChange={(e) => setBookingData({ ...bookingData, pickup: e.target.value })}
                        className="h-12 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="dropoff" className="text-slate-700 dark:text-slate-300 text-sm font-medium">Drop-off Location</Label>
                      <Input
                        id="dropoff"
                        placeholder="e.g., Dormitory"
                        value={bookingData.dropoff}
                        onChange={(e) => setBookingData({ ...bookingData, dropoff: e.target.value })}
                        className="h-12 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="time" className="text-slate-700 dark:text-slate-300 text-sm font-medium">Pickup Time</Label>
                      <Input
                        id="time"
                        type="datetime-local"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                        className="h-12 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="rideName" className="text-slate-700 dark:text-slate-300 text-sm font-medium">Ride Name</Label>
                      <Input
                        id="rideName"
                        placeholder="e.g., Morning Coffee Run"
                        value={bookingData.rideName}
                        onChange={(e) => setBookingData({ ...bookingData, rideName: e.target.value })}
                        className="h-12 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="type" className="text-slate-700 dark:text-slate-300 text-sm font-medium">Ride Type</Label>
                      <select
                        id="type"
                        className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        value={bookingData.type}
                        onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                      >
                        <option value="solo">Solo Ride</option>
                        <option value="shared">Shared Ride</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="fare" className="text-slate-700 dark:text-slate-300 text-sm font-medium">Estimated Fare</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="fare"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={bookingData.estimatedFare}
                          onChange={(e) => setBookingData({ ...bookingData, estimatedFare: e.target.value })}
                          className="pl-12 h-12 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleBookRide}
                    disabled={loading}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-base sm:text-lg py-3 sm:py-4 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
                  >
                    {loading ? "Booking..." : "Book Ride"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offer">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                <CardHeader className="pb-6 sm:pb-8">
                  <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-light text-slate-900 dark:text-white">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                      <Car className="text-purple-500 w-4 h-4" />
                    </div>
                    Offer a Ride
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300 text-base">Share your ride with other students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-8">
                  <div className="space-y-3">
                    <Label htmlFor="driverName" className="text-slate-700 dark:text-slate-300 text-sm font-medium">Your Name</Label>
                    <Input
                      id="driverName"
                      placeholder="e.g., John Doe"
                      value={offerData.driverName}
                      onChange={(e) => setOfferData({ ...offerData, driverName: e.target.value })}
                      className="h-12 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="vehicle" className="text-slate-700 dark:text-slate-300 text-sm font-medium">Vehicle Details</Label>
                      <Input
                        id="vehicle"
                        placeholder="e.g., Toyota Camry 2023"
                        value={offerData.vehicle}
                        onChange={(e) => setOfferData({ ...offerData, vehicle: e.target.value })}
                        className="h-12 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="seats" className="text-slate-700 dark:text-slate-300 text-sm font-medium">Available Seats</Label>
                      <Input
                        id="seats"
                        type="number"
                        min="1"
                        max="7"
                        placeholder="Number of seats"
                        value={offerData.seats}
                        onChange={(e) => setOfferData({ ...offerData, seats: e.target.value })}
                        className="h-12 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="route" className="text-slate-700 dark:text-slate-300 text-sm font-medium">Route</Label>
                    <Input
                      id="route"
                      placeholder="Start → Destination"
                      value={offerData.route}
                      onChange={(e) => setOfferData({ ...offerData, route: e.target.value })}
                      className="h-12 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="timing" className="text-slate-700 dark:text-slate-300 text-sm font-medium">Departure Time</Label>
                    <Input
                      id="timing"
                      type="datetime-local"
                      value={offerData.timing}
                      onChange={(e) => setOfferData({ ...offerData, timing: e.target.value })}
                      className="h-12 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>

                  <Button
                    onClick={handleOfferRide}
                    disabled={loading}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-base sm:text-lg py-3 sm:py-4 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
                  >
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
