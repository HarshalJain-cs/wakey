import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Testimonials from "@/components/sections/Testimonials";
import Comparison from "@/components/sections/Comparison";
import ROICalculator from "@/components/sections/ROICalculator";
import Pricing from "@/components/sections/Pricing";
import Newsletter from "@/components/sections/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <Comparison />
      <ROICalculator />
      <Pricing />
      <Newsletter />
    </>
  );
}