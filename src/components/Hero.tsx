import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToCreate = () => {
    const element = document.querySelector("#create");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGetStarted = () => {
    if (user) {
      scrollToCreate();
    } else {
      navigate("/auth");
    }
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Subtle modern gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(99,102,241,0.25),transparent),radial-gradient(900px_500px_at_110%_10%,rgba(56,189,248,0.2),transparent),linear-gradient(180deg,rgba(2,6,23,0.7),rgba(2,6,23,0.9))]"></div>

      {/* Soft floating shapes */}
      <div className="absolute -top-10 left-10 w-80 h-80 bg-white/5 rounded-[48px] blur-2xl" />
      <div className="absolute bottom-10 -right-10 w-[26rem] h-[26rem] bg-white/5 rounded-[48px] blur-2xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs mb-6 backdrop-blur">
            Velocity • Seamless campus ride sharing
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white mb-6">
            Move smarter.
            <span className="block text-white/90">Ride faster with Velocity</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Simple, reliable ride-sharing with beautiful design. Create, join and schedule rides in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-slate-900 hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.35)] transition-all duration-300 text-lg px-8 py-6 rounded-2xl group"
            >
              Get Started
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/60 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-2xl"
              onClick={scrollToAbout}
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="text-4xl font-semibold text-white mb-1">50K+</div>
              <div className="text-white/80">Active Riders</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="text-4xl font-semibold text-white mb-1">2K+</div>
              <div className="text-white/80">Rides Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="text-4xl font-semibold text-white mb-1">5K+</div>
              <div className="text-white/80">Trusted by Students</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
