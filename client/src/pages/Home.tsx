import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarketPulse from "@/components/MarketPulse";
import CardStory from "@/components/CardStory";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

function GradientDivider() {
  return (
    <div className="container">
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.06) 30%, oklch(1 0 0 / 0.06) 70%, transparent)" }} />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <GradientDivider />
      <MarketPulse />
      <GradientDivider />
      <CardStory />
      <GradientDivider />
      <Features />
      <Footer />
    </div>
  );
}
