import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { TrustBadges } from "@/components/trust-badges";
import { Bestsellers } from "@/components/bestsellers";
import { QuizBanner } from "@/components/quiz-banner";
import { Newsletter } from "@/components/newsletter";
import { Reviews } from "@/components/reviews";
import { RecentlyViewed } from "@/components/recently-viewed";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <TrustBadges />
      <Bestsellers />
      <RecentlyViewed />
      <QuizBanner />
      <Reviews />
      <Newsletter />
    </main>
  );
}