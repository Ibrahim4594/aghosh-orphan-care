import { Link } from "wouter";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import aghoshLogo from "@assets/Aghosh-Karachi-Minhaj-Welfare-Foundation-Pakistan_05_1767633857577.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/10 to-background"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b91c1c' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-32 text-center">
        <img 
          src={aghoshLogo} 
          alt="Aghosh Orphan Care Home" 
          className="h-24 w-24 md:h-32 md:w-32 object-contain mx-auto mb-6 rounded-lg"
          data-testid="img-hero-logo"
        />
        
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <span className="font-arabic text-lg">السَّلَامُ عَلَيْكُمْ</span>
          <span className="text-sm text-muted-foreground">Peace be upon you</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto" data-testid="text-hero-title">
          Embrace Orphaned Children with{" "}
          <span className="text-primary">Love</span> &{" "}
          <span className="text-secondary">Care</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed" data-testid="text-hero-description">
          Aghosh Orphan Care Home by Minhaj Welfare Foundation provides shelter, quality education, 
          healthcare, and spiritual guidance. Help us turn orphans into socially productive human beings.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/donate">
            <Button size="lg" className="min-w-[180px]" data-testid="button-hero-donate">
              <Heart className="w-5 h-5 mr-2" />
              Donate Now
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="min-w-[180px]" data-testid="button-hero-learn-more">
              Learn Our Story
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {[
            { number: "500+", label: "Children Supported" },
            { number: "15+", label: "Years of Service" },
            { number: "50K+", label: "Meals Provided" },
            { number: "100%", label: "Transparency" },
          ].map((stat, index) => (
            <div key={index} className="text-center" data-testid={`stat-${index}`}>
              <p className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
