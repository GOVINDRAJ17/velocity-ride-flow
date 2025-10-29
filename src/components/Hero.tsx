import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('home');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

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

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Animated background with particles */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-1/4 right-1/2 w-2 h-2 bg-violet-400 rounded-full animate-ping" style={{ animationDelay: '4s' }} />

        {/* Geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-500/20 rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-purple-500/20 rotate-12 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 right-10 w-16 h-16 border border-indigo-500/20 rounded-full animate-pulse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-20">
        <div className="text-center max-w-6xl mx-auto">
          {/* Premium badge */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 text-blue-300 text-sm mb-8 backdrop-blur-xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
            Premium Campus Ride Sharing
          </div>

          {/* Main heading with futuristic styling */}
          <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight text-white mb-6 leading-none transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Velocity
            </span>
            <br />
            <span className="text-white/90 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light">
              Ride Sharing
            </span>
          </h1>

          {/* Subheading */}
          <p className={`text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Experience the future of campus transportation with seamless connectivity,
            real-time synchronization, and premium ride experiences.
          </p>

          {/* CTA Buttons with glassmorphism */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group border border-blue-400/20 backdrop-blur-sm"
            >
              <Zap className="mr-2 w-5 h-5" />
              Launch Experience
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/5 text-lg px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 border border-white/10 backdrop-blur-sm"
            >
              <Shield className="mr-2 w-5 h-5" />
              Learn More
            </Button>
          </div>

          {/* Feature highlights */}
          <div className={`mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Active Riders</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">2K+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Daily Rides</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">5K+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Happy Students</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
