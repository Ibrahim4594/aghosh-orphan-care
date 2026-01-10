import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  GraduationCap,
  Utensils,
  Shirt,
  Home,
  BookOpen,
  Stethoscope,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { ScrollReveal, StaggerContainer, StaggerItem, HoverLift } from "@/lib/animations";

export default function ProgramsPage() {
  const { t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const programs = [
    {
      id: "orphan-care",
      titleKey: "programs.orphanCare",
      descKey: "programs.orphanCareFullDesc",
      icon: Home,
      features: ["programs.24hourCare", "programs.nutritiousMeals", "programs.safeLiving", "programs.emotionalSupport"],
      categoryKey: "programs.coreProgram",
    },
    {
      id: "education",
      titleKey: "programs.educationQuran",
      descKey: "programs.educationQuranFullDesc",
      icon: GraduationCap,
      features: ["programs.formalSchooling", "programs.quranMemorization", "programs.tutoringSupport", "programs.extracurricular"],
      categoryKey: "categories.education",
    },
    {
      id: "healthcare",
      titleKey: "programs.healthcareMedical",
      descKey: "programs.healthcareMedicalFullDesc",
      icon: Stethoscope,
      features: ["programs.regularCheckups", "programs.vaccinations", "programs.dentalCare", "programs.mentalHealth"],
      categoryKey: "categories.healthcare",
    },
    {
      id: "food",
      titleKey: "programs.foodNutritionProgram",
      descKey: "programs.foodNutritionProgramFullDesc",
      icon: Utensils,
      features: ["programs.threeDailyMeals", "programs.balancedDiet", "programs.specialDiets", "programs.cleanWater"],
      categoryKey: "categories.food",
    },
    {
      id: "clothing",
      titleKey: "programs.clothingDaily",
      descKey: "programs.clothingDailyFullDesc",
      icon: Shirt,
      features: ["programs.seasonalClothing", "programs.schoolUniforms", "programs.personalCareItems", "programs.eidGifts"],
      categoryKey: "categories.clothing",
    },
    {
      id: "spiritual",
      titleKey: "programs.spiritualDev",
      descKey: "programs.spiritualDevFullDesc",
      icon: BookOpen,
      features: ["programs.quranClasses", "programs.islamicStudies", "programs.characterBuilding", "programs.prayerGuidance"],
      categoryKey: "categories.education",
    },
  ];

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
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{t("programs.label")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-programs-title">
              {t("programs.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("programs.subtitle")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 md:py-20">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <StaggerItem key={program.id}>
                <HoverLift>
                  <Card className="group elevated-card h-full" data-testid={`card-program-${program.id}`}>
                    <CardHeader className={`pb-4 ${isRTL ? "text-right" : ""}`}>
                      <div className={`flex items-start justify-between gap-4 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all shadow-lg">
                          <Icon className="w-7 h-7 text-primary" />
                        </div>
                        <Badge variant="secondary" className="font-medium">{t(program.categoryKey)}</Badge>
                      </div>
                      <CardTitle className="text-xl mt-4">{t(program.titleKey)}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {t(program.descKey)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className={isRTL ? "text-right" : ""}>
                      <div className={`flex flex-wrap gap-2 mb-6 ${isRTL ? "justify-end" : ""}`}>
                        {program.features.map((featureKey, index) => (
                          <Badge key={index} variant="outline" className="font-normal bg-background/50">
                            {t(featureKey)}
                          </Badge>
                        ))}
                      </div>
                      <Link href={`/donate?category=${program.id === 'orphan-care' ? 'general' : program.id === 'spiritual' ? 'education' : program.id}`}>
                        <Button variant="outline" className={`gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors ${isRTL ? "flex-row-reverse" : ""}`} data-testid={`button-support-${program.id}`}>
                          {t("programs.supportProgram")}
                          <ArrowIcon className="w-4 h-4" />
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

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className={`max-w-4xl mx-auto px-4 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("programs.visitAghosh")}</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              {t("programs.visitDesc")}
            </p>
            <Link href="/contact">
              <Button size="lg" variant="secondary" data-testid="button-schedule-visit">
                <Heart className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("programs.scheduleVisit")}
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
