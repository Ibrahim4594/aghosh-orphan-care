import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatisticsBar } from "@/components/sections/statistics";
import { Heart, TrendingUp, Users, Target, BarChart3, Sparkles, GraduationCap, Home, Stethoscope, Calendar } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { ScrollReveal, StaggerContainer, StaggerItem, HoverLift } from "@/lib/animations";
import type { Statistics } from "@shared/schema";

export default function ImpactPage() {
  const { t, isRTL } = useLanguage();

  const impactStats = [
    { icon: Calendar, value: "2017", label: "impact.servingSince", color: "from-emerald-500 to-green-500" },
    { icon: Users, value: "50+", label: "impact.childrenInCare", color: "from-blue-500 to-cyan-500" },
    { icon: Target, value: "Rs.30K", label: "impact.monthlyPerChild", color: "from-purple-500 to-pink-500" },
  ];

  const programHighlights = [
    { icon: Home, title: "impact.shelter", description: "impact.shelterDesc", color: "from-amber-500 to-orange-500" },
    { icon: GraduationCap, title: "impact.education", description: "impact.educationDesc", color: "from-blue-500 to-cyan-500" },
    { icon: Stethoscope, title: "impact.healthcare", description: "impact.healthcareDesc", color: "from-rose-500 to-red-500" },
    { icon: Heart, title: "impact.emotionalSupport", description: "impact.emotionalSupportDesc", color: "from-purple-500 to-pink-500" },
  ];

  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/5 to-background overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        <div className={`max-w-7xl mx-auto px-4 text-center relative z-10 ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">{t("impact.label")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-impact-title">
              {t("impact.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("impact.subtitle")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 -mt-8 relative z-10">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {impactStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <StaggerItem key={index}>
                  <HoverLift>
                    <Card className="border-none shadow-xl" data-testid={`card-stat-${index}`}>
                      <CardContent className="p-8 text-center">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-4xl font-bold text-foreground mb-2">{stat.value}</p>
                        <p className="text-muted-foreground">{t(stat.label)}</p>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <StatisticsBar statistics={statistics} />

      {/* Our Programs */}
      <section className="py-16 md:py-24">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("impact.ourPrograms")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("impact.ourProgramsSubtitle")}
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {programHighlights.map((program, index) => {
              const Icon = program.icon;
              return (
                <StaggerItem key={index}>
                  <HoverLift>
                    <Card className="border-none shadow-lg h-full" data-testid={`card-program-${index}`}>
                      <CardContent className={`p-6 ${isRTL ? "text-right direction-rtl" : ""}`}>
                        <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{t(program.title)}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{t(program.description)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          <div className="text-center mt-12">
            <Link href="/donate">
              <Button size="lg" className="shadow-lg shadow-primary/25">
                <Heart className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("impact.contributeNow")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Orphan Crisis */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("impact.globalCrisis")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("impact.globalCrisisSubtitle")}
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { value: "140M", label: "impact.globalOrphans", color: "from-rose-500 to-red-500" },
              { value: "61M", label: "impact.asiaOrphans", color: "from-blue-500 to-cyan-500" },
              { value: "4.2M", label: "impact.pakistanOrphans", color: "from-emerald-500 to-green-500" },
            ].map((stat, index) => (
              <StaggerItem key={index}>
                <HoverLift>
                  <Card className="border-none shadow-xl text-center" data-testid={`card-crisis-${index}`}>
                    <CardContent className="p-8">
                      <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                        {stat.value}
                      </p>
                      <p className="text-muted-foreground">{t(stat.label)}</p>
                    </CardContent>
                  </Card>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Impact Amounts */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className={`max-w-4xl mx-auto px-4 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <Sparkles className="w-12 h-12 mx-auto text-primary mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              {t("impact.everyRupeeCounts")}
            </h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { amount: "Rs 1,000", impact: "impact.1000impact", color: "from-blue-500 to-cyan-500" },
              { amount: "Rs 2,500", impact: "impact.2500impact", color: "from-emerald-500 to-green-500" },
              { amount: "Rs 5,000", impact: "impact.5000impact", color: "from-purple-500 to-pink-500" },
            ].map((item, index) => (
              <StaggerItem key={index}>
                <HoverLift>
                  <Card className="border-none shadow-xl h-full" data-testid={`card-impact-${index}`}>
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-3xl font-bold text-primary mb-3">{item.amount}</p>
                      <p className="text-muted-foreground">{t(item.impact)}</p>
                    </CardContent>
                  </Card>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className={`max-w-4xl mx-auto px-4 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <Heart className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("impact.makeDonationToday")}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {t("impact.subtitle")}
            </p>
            <Link href="/donate">
              <Button size="lg" variant="secondary" className="shadow-lg">
                {t("impact.makeDonationToday")}
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
