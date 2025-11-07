import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CreateRide from "@/components/CreateRide";
import Schedule from "@/components/Schedule";
import RideHistory from "@/components/RideHistory";
import Location from "@/components/Location";
import SocialHub from "@/components/SocialHub";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <CreateRide />
        <Schedule />
        <RideHistory />
        <Location />
        <SocialHub />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
