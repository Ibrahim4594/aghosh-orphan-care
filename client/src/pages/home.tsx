import { HeroSection } from "@/components/sections/hero";
import { DonationCategoriesSection } from "@/components/sections/donation-categories";
import { MissionSection } from "@/components/sections/mission";
import { StatisticsBar } from "@/components/sections/statistics";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <MissionSection />
      <DonationCategoriesSection />
      <StatisticsBar />
    </main>
  );
}
