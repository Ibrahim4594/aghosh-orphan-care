import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatisticsBar } from "@/components/sections/statistics";
import { ImpactStoriesSection } from "@/components/sections/impact-stories";
import { Heart, TrendingUp, Users, Target } from "lucide-react";
import type { Statistics, ImpactStory } from "@shared/schema";

const fundingGoals = [
  { category: "Healthcare", current: 75000, goal: 100000 },
  { category: "Education", current: 45000, goal: 80000 },
  { category: "Food & Nutrition", current: 60000, goal: 70000 },
  { category: "Clothing", current: 15000, goal: 25000 },
];

export default function ImpactPage() {
  const { data: stories } = useQuery<ImpactStory[]>({
    queryKey: ["/api/impact-stories"],
  });

  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  return (
    <main>
      <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Impact</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6" data-testid="text-impact-title">
              Making a Difference Together
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your donations create lasting change in the lives of orphaned children. 
              See the impact of your generosity and how together we're building brighter futures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card data-testid="card-total-raised">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">$125,000+</p>
                <p className="text-muted-foreground mt-1">Total Raised This Year</p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-donors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">2,500+</p>
                <p className="text-muted-foreground mt-1">Generous Donors</p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-programs">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">6</p>
                <p className="text-muted-foreground mt-1">Active Programs</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <StatisticsBar statistics={statistics} />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Funding Goals</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help us reach our annual funding goals for each program area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {fundingGoals.map((goal, index) => {
              const percentage = Math.round((goal.current / goal.goal) * 100);
              return (
                <Card key={index} data-testid={`card-goal-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                      <h3 className="font-semibold">{goal.category}</h3>
                      <span className="text-sm text-muted-foreground">
                        {percentage}% Complete
                      </span>
                    </div>
                    <Progress value={percentage} className="h-3 mb-3" />
                    <div className="flex items-center justify-between gap-4 text-sm flex-wrap">
                      <span className="text-primary font-medium">
                        ${goal.current.toLocaleString()} raised
                      </span>
                      <span className="text-muted-foreground">
                        Goal: ${goal.goal.toLocaleString()}
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
                <Heart className="w-5 h-5 mr-2" />
                Contribute Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ImpactStoriesSection stories={stories} />

      <section className="py-16 md:py-24 bg-accent/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Every Dollar Makes a Difference
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <Card data-testid="card-impact-25">
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-primary mb-2">$25</p>
                <p className="text-muted-foreground">Provides meals for one child for a month</p>
              </CardContent>
            </Card>
            <Card data-testid="card-impact-50">
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-primary mb-2">$50</p>
                <p className="text-muted-foreground">Covers school supplies for a semester</p>
              </CardContent>
            </Card>
            <Card data-testid="card-impact-100">
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-primary mb-2">$100</p>
                <p className="text-muted-foreground">Provides medical checkups for 5 children</p>
              </CardContent>
            </Card>
          </div>
          <Link href="/donate">
            <Button size="lg" data-testid="button-make-donation">
              Make a Donation Today
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
