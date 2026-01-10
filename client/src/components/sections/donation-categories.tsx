import { Link } from "wouter";
import { Heart, GraduationCap, Utensils, Shirt, HandHeart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { ScrollReveal, StaggerContainer, StaggerItem, HoverLift } from "@/lib/animations";

const iconMap: Record<string, typeof Heart> = {
  Heart,
  GraduationCap,
  Utensils,
  Shirt,
  HandHeart,
};

const categories = [
  { id: "healthcare", icon: "Heart", titleKey: "categories.healthcare", descKey: "categories.healthcareDesc" },
  { id: "education", icon: "GraduationCap", titleKey: "categories.education", descKey: "categories.educationDesc" },
  { id: "food", icon: "Utensils", titleKey: "categories.food", descKey: "categories.foodDesc" },
  { id: "clothing", icon: "Shirt", titleKey: "categories.clothing", descKey: "categories.clothingDesc" },
  { id: "general", icon: "HandHeart", titleKey: "categories.general", descKey: "categories.generalDesc" },
];

export function DonationCategoriesSection() {
  const { t, isRTL } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className={`text-center mb-12 ${isRTL ? "direction-rtl" : ""}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-categories-title">
              {t("categories.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("categories.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Heart;
            return (
              <StaggerItem key={category.id}>
                <HoverLift>
                  <Card className="group transition-all duration-300 h-full elevated-card" data-testid={`card-category-${category.id}`}>
                    <CardHeader className={`pb-4 ${isRTL ? "text-right" : ""}`}>
                      <div className={`w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors ${isRTL ? "mr-auto" : ""}`}>
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{t(category.titleKey)}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {t(category.descKey)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Link href={`/donate?category=${category.id}`}>
                        <Button variant="outline" className="w-full" data-testid={`button-donate-${category.id}`}>
                          {t("nav.donateNow")}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </HoverLift>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
