import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { TrustBadges } from "@/components/trust-badges";
import { Bestsellers } from "@/components/bestsellers";
import { QuizBanner } from "@/components/quiz-banner";
import { Newsletter } from "@/components/newsletter";
import { Sparkles, ShoppingBag, User } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      
      <Header />
      <Hero />
      <TrustBadges />
      <Bestsellers />
      <QuizBanner />
      <Newsletter />
      
    </main>
  );
}