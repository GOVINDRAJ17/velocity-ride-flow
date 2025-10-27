import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Clock, MapPin, Plus } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Schedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  const fetchSchedules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true })
        .limit(5);

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      console.error("Error fetching schedules:", error);
    }
  };

  const handleAddSchedule = () => {
    if (!user) {
      toast.error("Please login to schedule rides");
      navigate("/auth");
      return;
    }
    toast.info("Schedule feature coming soon!");
  };

  const handleModify = (id: string) => {
    toast.info("Modify feature coming soon!");
  };

  const handleCancel = async (id: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("schedules")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      toast.success("Schedule cancelled");
      fetchSchedules();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="schedule" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Schedule Your Rides</h2>
          <p className="text-muted-foreground text-lg">Plan ahead for a seamless journey</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <Card className="shadow-soft border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="text-primary" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-lg border p-3 pointer-events-auto"
              />
              
              <div className="mt-6">
                {date && (
                  <div className="bg-gradient-primary text-white p-4 rounded-lg">
                    <div className="text-sm opacity-90">Selected Date</div>
                    <div className="text-xl font-bold">{format(date, "PPP")}</div>
                  </div>
                )}
                
                <Button className="w-full mt-4 gradient-primary text-primary-foreground hover:shadow-hover transition-smooth" onClick={handleAddSchedule}>
                  <Plus className="mr-2" size={20} />
                  Schedule New Ride
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Rides */}
          <Card className="shadow-soft border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="text-primary" />
                Upcoming Rides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedules.length > 0 ? (
                schedules.map((ride) => (
                  <div
                    key={ride.id}
                    className="border border-border rounded-lg p-4 hover:shadow-soft transition-smooth bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <div>
                          <div className="font-semibold">{ride.from_location} → {ride.to_location}</div>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          ride.status === "confirmed"
                            ? "bg-green-500/10 text-green-600"
                            : ride.status === "cancelled"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-yellow-500/10 text-yellow-600"
                        }`}
                      >
                        {ride.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {format(new Date(ride.scheduled_date), "MMM d")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {format(new Date(ride.scheduled_date), "h:mm a")}
                      </div>
                    </div>
                    
                    {ride.status !== "cancelled" && (
                      <div className="mt-3 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleModify(ride.id)}
                        >
                          Modify
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleCancel(ride.id)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarDays size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No upcoming rides scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
