import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatisticsBar } from "@/components/sections/statistics";
import { Heart, TrendingUp, Users, Target } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { Statistics } from "@shared/schema";

export default function ImpactPage() {
  const { t, isRTL } = useLanguage();
  
  const fundingGoals = [
    { categoryKey: "categories.healthcare", current: 75000, goal: 100000 },
    { categoryKey: "categories.education", current: 45000, goal: 80000 },
    { categoryKey: "categories.food", current: 60000, goal: 70000 },
    { categoryKey: "categories.clothing", current: 15000, goal: 25000 },
  ];

  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  return (
    <main>
      <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-16 ${isRTL ? "direction-rtl" : ""}`}>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{t("impact.label")}</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6" data-testid="text-impact-title">
              {t("impact.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("impact.subtitle")}
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 ${isRTL ? "direction-rtl" : ""}`}>
            <Card data-testid="card-total-raised">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">$125,000+</p>
                <p className="text-muted-foreground mt-1">{t("impact.totalRaised")}</p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-donors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">2,500+</p>
                <p className="text-muted-foreground mt-1">{t("impact.generousDonors")}</p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-programs">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">6</p>
                <p className="text-muted-foreground mt-1">{t("impact.activePrograms")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <StatisticsBar statistics={statistics} />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-12 ${isRTL ? "direction-rtl" : ""}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("impact.fundingGoals")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("impact.fundingGoalsSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {fundingGoals.map((goal, index) => {
              const percentage = Math.round((goal.current / goal.goal) * 100);
              return (
                <Card key={index} data-testid={`card-goal-${index}`}>
                  <CardContent className={`p-6 ${isRTL ? "text-right direction-rtl" : ""}`}>
                    <div className={`flex items-center justify-between gap-4 mb-3 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                      <h3 className="font-semibold">{t(goal.categoryKey)}</h3>
                      <span className="text-sm text-muted-foreground">
                        {percentage}% {t("impact.complete")}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-3 mb-3" />
                    <div className={`flex items-center justify-between gap-4 text-sm flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span className="text-primary font-medium">
                        ${goal.current.toLocaleString()} {t("impact.raised")}
                      </span>
                      <span className="text-muted-foreground">
                        {t("impact.goal")}: ${goal.goal.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/donate">
              <Button size="lg" data-testid="button-contribute">
                <Heart className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("impact.contributeNow")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      
      <section className="py-16 md:py-24 bg-accent/30">
        <div className={`max-w-4xl mx-auto px-4 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("impact.everyRupeeCounts")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <Card data-testid="card-impact-1000">
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-primary mb-2">Rs 1,000</p>
                <p className="text-muted-foreground">{t("impact.1000impact")}</p>
              </CardContent>
            </Card>
            <Card data-testid="card-impact-2500">
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-primary mb-2">Rs 2,500</p>
                <p className="text-muted-foreground">{t("impact.2500impact")}</p>
              </CardContent>
            </Card>
            <Card data-testid="card-impact-5000">
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-primary mb-2">Rs 5,000</p>
                <p className="text-muted-foreground">{t("impact.5000impact")}</p>
              </CardContent>
            </Card>
          </div>
          <Link href="/donate">
            <Button size="lg" data-testid="button-make-donation">
              {t("impact.makeDonationToday")}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
