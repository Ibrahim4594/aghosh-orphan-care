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
  ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

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
    <main className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`text-center mb-16 ${isRTL ? "direction-rtl" : ""}`}>
          <span className="text-sm font-medium text-primary uppercase tracking-wider">{t("programs.label")}</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6" data-testid="text-programs-title">
            {t("programs.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("programs.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <Card key={program.id} className="group" data-testid={`card-program-${program.id}`}>
                <CardHeader className={`pb-4 ${isRTL ? "text-right" : ""}`}>
                  <div className={`flex items-start justify-between gap-4 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <Badge variant="secondary">{t(program.categoryKey)}</Badge>
                  </div>
                  <CardTitle className="text-xl mt-4">{t(program.titleKey)}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {t(program.descKey)}
                  </CardDescription>
                </CardHeader>
                <CardContent className={isRTL ? "text-right" : ""}>
                  <div className={`flex flex-wrap gap-2 mb-6 ${isRTL ? "justify-end" : ""}`}>
                    {program.features.map((featureKey, index) => (
                      <Badge key={index} variant="outline" className="font-normal">
                        {t(featureKey)}
                      </Badge>
                    ))}
                  </div>
                  <Link href={`/donate?category=${program.id === 'orphan-care' ? 'general' : program.id === 'spiritual' ? 'education' : program.id}`}>
                    <Button variant="outline" className={`gap-2 ${isRTL ? "flex-row-reverse" : ""}`} data-testid={`button-support-${program.id}`}>
                      {t("programs.supportProgram")}
                      <ArrowIcon className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className={`mt-20 bg-primary/5 rounded-lg p-8 md:p-12 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("programs.visitAghosh")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {t("programs.visitDesc")}
          </p>
          <Link href="/contact">
            <Button size="lg" data-testid="button-schedule-visit">
              <Heart className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("programs.scheduleVisit")}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
