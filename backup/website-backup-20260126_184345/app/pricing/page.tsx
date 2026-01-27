import { Metadata } from "next";
import Pricing from "@/components/sections/Pricing";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Pricing - Wakey | Free, Pro, and Enterprise Plans",
  description: "Choose the perfect plan for your productivity needs. Start free, upgrade to Pro for AI insights and JARVIS assistant.",
};

export default function PricingPage() {
  return (
    <div className="pt-20">
      <Pricing />
      <Newsletter />
    </div>
  );
}
