import { Link } from "wouter";
import { Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import aghoshLogo from "@assets/Aghosh-Karachi-Minhaj-Welfare-Foundation-Pakistan_05_1767633857577.jpg";

export function HeroSection() {
  const { t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/10 to-background"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b91c1c' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-32 text-center">
        <div className="flex justify-center items-center mb-8">
          <img 
            src={aghoshLogo} 
            alt="Aghosh Orphan Care Home" 
            className="h-80 w-80 sm:h-96 sm:w-96 md:h-[512px] md:w-[512px] object-contain rounded-lg"
            data-testid="img-hero-logo"
          />
        </div>
        
        <div className="mb-6 text-center">
          <p className="font-arabic text-xl sm:text-2xl md:text-3xl mb-3">السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ</p>
          <p className="font-arabic text-xl sm:text-2xl md:text-3xl text-primary px-4 mb-2">
            فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ
          </p>
          <p className="text-sm text-muted-foreground">{t("hero.quranRef")}</p>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 max-w-4xl mx-auto px-2" data-testid="text-hero-title">
          {t("hero.title1")}{" "}
          <span className="text-primary">{t("hero.love")}</span>,{" "}
          <span className="text-secondary">{t("hero.care")}</span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl font-medium text-primary/80 mb-6" data-testid="text-hero-tagline">
          {t("hero.tagline")}
        </p>
        
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2" data-testid="text-hero-description">
          {t("hero.description")}
        </p>
        
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
          <Link href="/donate">
            <Button size="lg" className="w-full sm:w-auto min-w-[160px]" data-testid="button-hero-donate">
              <Heart className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("nav.donateNow")}
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[160px]" data-testid="button-hero-learn-more">
              {t("hero.learnStory")}
              <ArrowIcon className={`w-5 h-5 ${isRTL ? "mr-2" : "ml-2"}`} />
            </Button>
          </Link>
        </div>
        
        <div className={`mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto ${isRTL ? "direction-rtl" : ""}`}>
          {[
            { number: "500+", labelKey: "hero.orphansSupported" },
            { number: "34", labelKey: "hero.residentialBlocks" },
            { number: "Rs.6,500", labelKey: "hero.monthlySponsorship" },
            { number: "100%", labelKey: "hero.transparency" },
          ].map((stat, index) => (
            <div key={index} className="text-center p-3 md:p-0" data-testid={`stat-${index}`}>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stat.number}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t(stat.labelKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
