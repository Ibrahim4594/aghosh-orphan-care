import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, BookOpen, Home, Shield, Globe, Utensils, GraduationCap, Laptop, Bed } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import aghoshLogo from "@assets/Aghosh-Karachi-Minhaj-Welfare-Foundation-Pakistan_05_1767633857577.jpg";

export default function AboutPage() {
  const { t, isRTL } = useLanguage();

  const milestones = [
    { year: "2008", titleKey: "about.milestone1Title", descKey: "about.milestone1Desc" },
    { year: "2008", titleKey: "about.milestone2Title", descKey: "about.milestone2Desc" },
    { year: "2010", titleKey: "about.milestone3Title", descKey: "about.milestone3Desc" },
    { year: "2015", titleKey: "about.milestone4Title", descKey: "about.milestone4Desc" },
    { year: "2020", titleKey: "about.milestone5Title", descKey: "about.milestone5Desc" },
    { year: "2024", titleKey: "about.milestone6Title", descKey: "about.milestone6Desc" },
  ];

  const facilities = [
    { icon: Bed, titleKey: "about.individualBeds", descKey: "about.individualBedsDesc" },
    { icon: Laptop, titleKey: "about.personalComputer", descKey: "about.personalComputerDesc" },
    { icon: BookOpen, titleKey: "about.studyTableChair", descKey: "about.studyTableChairDesc" },
    { icon: Home, titleKey: "about.personalCupboard", descKey: "about.personalCupboardDesc" },
    { icon: GraduationCap, titleKey: "about.hifzQuran", descKey: "about.hifzQuranDesc" },
    { icon: Shield, titleKey: "about.traumaCenter", descKey: "about.traumaCenterDesc" },
  ];

  const educationPrograms = [
    { titleKey: "about.hifzQuranProgram", descKey: "about.hifzQuranProgramDesc" },
    { titleKey: "about.minhajModelSchool", descKey: "about.minhajModelSchoolDesc" },
    { titleKey: "about.extraCoaching", descKey: "about.extraCoachingDesc" },
  ];

  return (
    <main className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`text-center mb-12 ${isRTL ? "direction-rtl" : ""}`}>
          <span className="text-sm font-medium text-primary uppercase tracking-wider">{t("nav.about")}</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2 mb-6" data-testid="text-about-title">
            {t("about.title")}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("about.subtitle")}
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <img 
            src={aghoshLogo} 
            alt="Aghosh Orphan Care Home Logo" 
            className="h-32 sm:h-40 w-auto object-contain"
            data-testid="img-about-logo"
          />
        </div>

        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16 ${isRTL ? "direction-rtl" : ""}`}>
          <div className={isRTL ? "text-right" : ""}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("about.introduction")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("about.introText1")}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("about.introText2")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.introText3")}
            </p>
          </div>
          
          <div className={isRTL ? "text-right" : ""}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("about.aimsObjectives")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("about.aimsText")}
            </p>
            
            <h2 className="text-xl sm:text-2xl font-bold mb-4 mt-6">{t("about.theProject")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.projectText")}
            </p>
          </div>
        </div>

        <Card className="mb-16 bg-secondary/10 border-secondary/20">
          <CardContent className={`p-6 sm:p-8 ${isRTL ? "text-right" : ""}`}>
            <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Globe className="w-8 h-8 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">{t("about.location")}</h3>
                <p className="text-muted-foreground">
                  {t("about.locationText")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={`mb-16 ${isRTL ? "direction-rtl" : ""}`}>
          <h2 className="text-2xl font-bold text-center mb-4">{t("about.residentialFacilities")}</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("about.facilitiesSubtitle")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {facilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} data-testid={`card-facility-${index}`}>
                  <CardContent className={`p-4 sm:p-6 text-center ${isRTL ? "direction-rtl" : ""}`}>
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base mb-1">{t(item.titleKey)}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t(item.descKey)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className={`mb-16 ${isRTL ? "direction-rtl" : ""}`}>
          <h2 className="text-2xl font-bold text-center mb-8">{t("about.education")}</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t("about.educationSubtitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {educationPrograms.map((program, index) => (
              <Card key={index}>
                <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
                  <h3 className="font-semibold text-lg mb-2 text-primary">{t(program.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(program.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className={`grid md:grid-cols-2 gap-6 mb-16 ${isRTL ? "direction-rtl" : ""}`}>
          <Card>
            <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
              <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Utensils className="w-8 h-8 text-secondary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("about.foodNutrition")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("about.foodNutritionDesc")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
              <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Heart className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("about.recreationalActivities")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("about.recreationalActivitiesDesc")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={`mb-16 ${isRTL ? "direction-rtl" : ""}`}>
          <h2 className="text-2xl font-bold text-center mb-8">{t("about.ourJourney")}</h2>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <Card key={index} data-testid={`milestone-${index}`}>
                <CardContent className={`p-4 sm:p-6 ${isRTL ? "text-right" : ""}`}>
                  <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="w-16 sm:w-20 flex-shrink-0">
                      <span className="text-primary font-bold text-lg">{milestone.year}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{t(milestone.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{t(milestone.descKey)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className={`p-6 sm:p-8 text-center ${isRTL ? "direction-rtl" : ""}`}>
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("about.sponsorChild")}</h2>
            <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
              <strong className="text-primary text-lg">Rs. 6,500</strong> {t("about.sponsorChildDesc")}
            </p>
            <div className={`text-sm text-muted-foreground mb-6 max-w-xl mx-auto space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
              <p>{t("about.whatYouGet")}</p>
              <ul className={`list-disc ${isRTL ? "list-inside mr-4" : "list-inside"}`}>
                <li>{t("about.photoOfChild")}</li>
                <li>{t("about.regularUpdates")}</li>
                <li>{t("about.meetChild")}</li>
                <li>{t("about.annualReport")}</li>
                <li>{t("about.supportUniversity")}</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground italic mb-6">
              {t("about.safetyNote")}
            </p>
            <Link href="/donate">
              <Button size="lg" data-testid="button-sponsor-child">
                <Heart className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("about.sponsorToday")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
