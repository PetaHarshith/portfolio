import { Hero } from "@/components/hero/Hero";
import { SideQuests } from "@/components/widgets/SideQuests";
import { FeaturedDrops } from "@/components/work/FeaturedDrops";
import { Career } from "@/components/career/Career";
import { CompanyShooter } from "@/components/game/CompanyShooter";
import { Connect } from "@/components/connect/Connect";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <SideQuests />
      <FeaturedDrops />
      <Career />
      <CompanyShooter />
      <Connect />
      <Footer />
    </main>
  );
}
