import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Clock, MapPin, Plus, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
s
const Schedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [schedules, setSchedules] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSchedules();
      fetchUpcomingRides();
      const unsubscribe = subscribeRidesRealtime();
      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('schedule');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

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

  const fetchUpcomingRides = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("rides")
        .select("id, ride_name, ride_date, ride_type, seats_available")
        .gte("ride_date", new Date().toISOString())
        .order("ride_date", { ascending: true })
        .limit(10);
      if (error) throw error;
      setRides(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const subscribeRidesRealtime = () => {
    const channel = supabase
      .channel("upcoming_rides")
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rides' },
        () => fetchUpcomingRides()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
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
    <section id="schedule" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-8 sm:mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4 sm:mb-6 backdrop-blur hover:bg-primary/15 transition-all duration-300 hover:scale-105">
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            Your Ride Schedule
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Your Ride Schedule</h2>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl">View and manage your rides</p>
        </div>

        <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Calendar */}
          <Card className="shadow-soft border-2 overflow-hidden rounded-3xl hover:shadow-hover transition-all duration-300 hover:scale-[1.02] bg-white/90 dark:bg-slate-800/90">
            <CardHeader className="gradient-primary text-white pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-white text-lg sm:text-xl">
                <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-none pointer-events-auto w-full h-full p-4"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 h-full",
                  month: "space-y-4 w-full h-full",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  table: "w-full border-collapse space-y-1 h-full",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                }}
              />

              <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 border-t-2 border-primary/10">
                {date && (
                  <div className="bg-gradient-primary text-white p-4 sm:p-6 rounded-xl shadow-soft">
                    <div className="text-xs sm:text-sm opacity-90 mb-2">Selected Date</div>
                    <div className="text-lg sm:text-2xl font-bold">{format(date, "EEEE, MMMM d, yyyy")}</div>
                  </div>
                )}

                <Button
                  className="w-full gradient-primary text-primary-foreground hover:shadow-hover transition-all duration-300 text-base sm:text-lg py-4 sm:py-6 h-12 sm:h-14 hover:scale-105"
                  onClick={handleAddSchedule}
                >
                  <Plus className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Schedule New Ride
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Rides */}
          <Card className="shadow-soft border-2 rounded-3xl hover:shadow-hover transition-all duration-300 hover:scale-[1.02] bg-white/90 dark:bg-slate-800/90">
            <CardHeader className="gradient-primary text-white pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-white text-lg sm:text-xl">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                Upcoming Rides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              {rides.length > 0 ? (
                rides.map((ride) => (
                  <Card
                    key={ride.id}
                    className="border-2 hover:shadow-soft transition-all duration-300 hover:scale-[1.02] bg-white/80 dark:bg-slate-700/80 overflow-hidden rounded-xl cursor-pointer"
                  >
                    <div className="bg-gradient-primary/10 p-3 sm:p-4 border-b-2 border-primary/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gradient-primary rounded-lg p-2">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-base sm:text-lg">{ride.ride_name}</div>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold ${
                            ride.ride_type === "offer"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                          }`}
                        >
                          {ride.ride_type}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          <span className="font-medium">{format(new Date(ride.ride_date), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          <span className="font-medium">{format(new Date(ride.ride_date), "h:mm a")}</span>
                        </div>
                      </div>

                      {ride.notes && (
                        <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 p-2 sm:p-3 rounded-lg">
                          <strong>Notes:</strong> {ride.notes}
                        </div>
                      )}

                      {ride.status !== "cancelled" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 font-semibold text-xs sm:text-sm h-8 sm:h-9 hover:scale-105 transition-all duration-300"
                            onClick={() => handleModify(ride.id)}
                          >
                            Modify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold text-xs sm:text-sm h-8 sm:h-9 hover:scale-105 transition-all duration-300"
                            onClick={() => handleCancel(ride.id)}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className={`text-center py-12 sm:py-16 text-muted-foreground transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="bg-muted/50 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-bounce">
                    <CalendarDays className="w-8 h-8 sm:w-12 sm:h-12 opacity-50" />
                  </div>
                  <p className="font-semibold text-base sm:text-lg mb-2">No upcoming rides scheduled</p>
                  <p className="text-xs sm:text-sm">Schedule your first ride to get started!</p>
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
