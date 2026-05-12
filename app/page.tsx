import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyMonad } from "@/components/landing/WhyMonad";
import { DemoPreview } from "@/components/landing/DemoPreview";
import { CTA, Footer } from "@/components/landing/CTA";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <DemoPreview />
      <WhyMonad />
      <CTA />
      <Footer />
    </main>
  );
}
