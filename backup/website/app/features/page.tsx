import { Metadata } from "next";
import Features from "@/components/sections/Features";

export const metadata: Metadata = {
  title: "Features - Wakey | 77 Productivity Features",
  description: "Explore all 77 features of Wakey including AI insights, time tracking, focus timer, JARVIS assistant, and more.",
};

export default function FeaturesPage() {
  return (
    <div className="pt-20">
      <Features />
    </div>
  );
}
