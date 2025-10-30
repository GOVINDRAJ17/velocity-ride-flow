import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CreateRide from "@/components/CreateRide";
import SocialHub from "@/components/SocialHub";
import Schedule from "@/components/Schedule";
import Weather from "@/components/Weather";
import Location from "@/components/Location";
import Split from "@/components/Split";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-background text-foreground pb-20">
      <Navbar />
      <main className="max-w-md mx-auto">
        <Hero />
        <CreateRide />
        <SocialHub />
        <Schedule />
        <Weather />
        <Location />
        <Split />
        <About />
        <Contact />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur border-t flex items-center justify-around">
        <a href="/"><span>Home</span></a>
        <a href="/profile"><span>Profile</span></a>
        <a href="/checkout"><span>Payments</span></a>
        <a href="/settings"><span>Settings</span></a>
      </nav>
    </div>
  );
};

export default Index;
