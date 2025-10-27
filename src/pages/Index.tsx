import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CreateRide from "@/components/CreateRide";
import Radio from "@/components/Radio";
import Schedule from "@/components/Schedule";
import Weather from "@/components/Weather";
import Location from "@/components/Location";
import Split from "@/components/Split";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <CreateRide />
        <Radio />
        <Schedule />
        <Weather />
        <Location />
        <Split />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
