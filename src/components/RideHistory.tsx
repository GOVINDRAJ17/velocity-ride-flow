import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Calendar, DollarSign, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RideWithReview {
  id: string;
  ride_name: string;
  pickup_location: string;
  dropoff_location: string;
  fare_estimate: number;
  ride_date: string;
  status: string;
  completed_at: string;
  user_id: string;
  profiles?: { full_name: string } | { full_name: string }[];
}

const RideHistory = () => {
  const { user } = useAuth();
  const [completedRides, setCompletedRides] = useState<RideWithReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRides: 0,
    totalSpent: 0,
    avgRating: 0,
  });
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (user) {
      loadRideHistory();
    }
  }, [user]);

  const loadRideHistory = async () => {
    try {
      setLoading(true);
      
      // Get completed rides
      const { data: rides, error } = await supabase
        .from("rides")
        .select(`
          *,
          profiles!rides_user_id_fkey(full_name)
        `)
        .or(`user_id.eq.${user?.id},id.in.(SELECT ride_id FROM ride_participants WHERE user_id = '${user?.id}')`)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      if (error) throw error;

      setCompletedRides(rides || []);

      // Calculate stats
      const totalRides = rides?.length || 0;
      const totalSpent = rides?.reduce((sum, ride) => sum + (ride.fare_estimate || 0), 0) || 0;

      // Get user's average rating
      const { data: reviews } = await supabase
        .from("ride_reviews")
        .select("rating")
        .eq("reviewed_user_id", user?.id);

      const avgRating = reviews?.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      setStats({ totalRides, totalSpent, avgRating });
    } catch (error: any) {
      console.error("Error loading ride history:", error);
      toast.error("Failed to load ride history");
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!selectedRide) return;

    try {
      const ride = completedRides.find((r) => r.id === selectedRide);
      if (!ride) return;

      const { error } = await supabase.from("ride_reviews").insert({
        ride_id: selectedRide,
        reviewer_id: user?.id,
        reviewed_user_id: ride.user_id,
        rating,
        review_text: reviewText,
      });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      setSelectedRide(null);
      setRating(5);
      setReviewText("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    }
  };

  const renderStars = (count: number, interactive: boolean = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= count
              ? "fill-yellow-500 text-yellow-500"
              : "text-muted-foreground"
          } ${interactive ? "cursor-pointer" : ""}`}
          onClick={() => interactive && setRating(star)}
        />
      ))}
    </div>
  );

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Ride History & Stats</h2>
          <p className="text-muted-foreground text-xl">
            Your journey analytics and past rides
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-card hover:shadow-hover transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Rides</p>
                  <p className="text-3xl font-bold">{stats.totalRides}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-3xl font-bold">₹{stats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</p>
                    <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ride History */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">Completed Rides</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : completedRides.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No completed rides yet
              </p>
            ) : (
              <div className="space-y-4">
                {completedRides.map((ride) => (
                  <Card key={ride.id} className="bg-muted/30">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <h3 className="font-semibold text-lg">{ride.ride_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {ride.pickup_location} → {ride.dropoff_location}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(ride.ride_date).toLocaleDateString("en-IN")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 font-semibold">
                              <DollarSign className="h-4 w-4" />
                              <span>₹{ride.fare_estimate}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Driver: {Array.isArray(ride.profiles) ? ride.profiles[0]?.full_name : ride.profiles?.full_name || "Priya Sharma"}
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRide(ride.id)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Rate
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rate Your Ride</DialogTitle>
                              <DialogDescription>
                                Share your experience with {ride.ride_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Rating</Label>
                                {renderStars(rating, true)}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="review">Review (Optional)</Label>
                                <Textarea
                                  id="review"
                                  placeholder="Tell us about your experience..."
                                  value={reviewText}
                                  onChange={(e) => setReviewText(e.target.value)}
                                />
                              </div>
                              <Button onClick={submitReview} className="w-full">
                                Submit Review
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RideHistory;
