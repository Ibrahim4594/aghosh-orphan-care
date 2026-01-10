import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, BookOpen, Home, Shield, Globe, Utensils, GraduationCap, Laptop, Bed, Info, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { ScrollReveal, StaggerContainer, StaggerItem, HoverLift } from "@/lib/animations";
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
    { icon: Bed, titleKey: "about.individualBeds", descKey: "about.individualBedsDesc", color: "from-blue-500 to-cyan-500" },
    { icon: Laptop, titleKey: "about.personalComputer", descKey: "about.personalComputerDesc", color: "from-purple-500 to-pink-500" },
    { icon: BookOpen, titleKey: "about.studyTableChair", descKey: "about.studyTableChairDesc", color: "from-amber-500 to-orange-500" },
    { icon: Home, titleKey: "about.personalCupboard", descKey: "about.personalCupboardDesc", color: "from-emerald-500 to-green-500" },
    { icon: GraduationCap, titleKey: "about.hifzQuran", descKey: "about.hifzQuranDesc", color: "from-rose-500 to-red-500" },
    { icon: Shield, titleKey: "about.traumaCenter", descKey: "about.traumaCenterDesc", color: "from-indigo-500 to-violet-500" },
  ];

  const educationPrograms = [
    { titleKey: "about.hifzQuranProgram", descKey: "about.hifzQuranProgramDesc", icon: BookOpen },
    { titleKey: "about.minhajModelSchool", descKey: "about.minhajModelSchoolDesc", icon: GraduationCap },
    { titleKey: "about.extraCoaching", descKey: "about.extraCoachingDesc", icon: Sparkles },
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
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">{t("nav.about")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-about-title">
              {t("about.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              {t("about.subtitle")}
            </p>
            <div className="flex justify-center">
              <img
                src={aghoshLogo}
                alt="Aghosh Orphan Care Home Logo"
                className="h-40 md:h-56 w-auto object-contain rounded-2xl shadow-2xl"
                data-testid="img-about-logo"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-20">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <ScrollReveal>
              <Card className="h-full border-none shadow-lg bg-gradient-to-br from-card to-card/50">
                <CardContent className={`p-8 ${isRTL ? "text-right" : ""}`}>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-primary" />
                    {t("about.introduction")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t("about.introText1")}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t("about.introText2")}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("about.introText3")}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal>
              <Card className="h-full border-none shadow-lg bg-gradient-to-br from-card to-card/50">
                <CardContent className={`p-8 ${isRTL ? "text-right" : ""}`}>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    {t("about.aimsObjectives")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t("about.aimsText")}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Home className="w-6 h-6 text-primary" />
                    {t("about.theProject")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("about.projectText")}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Location Card */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <Card className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-secondary/10 border-secondary/20 shadow-lg">
              <CardContent className={`p-8 ${isRTL ? "text-right" : ""}`}>
                <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Globe className="w-7 h-7 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{t("about.location")}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t("about.locationText")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-16 md:py-20 bg-accent/30">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("about.residentialFacilities")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("about.facilitiesSubtitle")}
              </p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {facilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={index}>
                  <HoverLift>
                    <Card className="h-full border-none shadow-lg" data-testid={`card-facility-${index}`}>
                      <CardContent className={`p-6 text-center ${isRTL ? "direction-rtl" : ""}`}>
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-semibold text-base mb-2">{t(item.titleKey)}</h3>
                        <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-16 md:py-20">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("about.education")}</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t("about.educationSubtitle")}
              </p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {educationPrograms.map((program, index) => {
              const Icon = program.icon;
              return (
                <StaggerItem key={index}>
                  <HoverLift>
                    <Card className="h-full border-none shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
                      <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2 text-primary">{t(program.titleKey)}</h3>
                        <p className="text-sm text-muted-foreground">{t(program.descKey)}</p>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Food & Recreation */}
      <section className="py-8">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal>
              <HoverLift>
                <Card className="h-full border-none shadow-lg">
                  <CardContent className={`p-8 ${isRTL ? "text-right" : ""}`}>
                    <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Utensils className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl mb-2">{t("about.foodNutrition")}</h3>
                        <p className="text-muted-foreground">
                          {t("about.foodNutritionDesc")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </HoverLift>
            </ScrollReveal>

            <ScrollReveal>
              <HoverLift>
                <Card className="h-full border-none shadow-lg">
                  <CardContent className={`p-8 ${isRTL ? "text-right" : ""}`}>
                    <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Heart className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl mb-2">{t("about.recreationalActivities")}</h3>
                        <p className="text-muted-foreground">
                          {t("about.recreationalActivitiesDesc")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </HoverLift>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Journey/Timeline */}
      <section className="py-16 md:py-20 bg-accent/30">
        <div className={`max-w-4xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">{t("about.ourJourney")}</h2>
            </div>
          </ScrollReveal>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <ScrollReveal key={index}>
                <Card className="border-none shadow-md hover:shadow-lg transition-shadow" data-testid={`milestone-${index}`}>
                  <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
                    <div className={`flex items-start gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="w-20 flex-shrink-0">
                        <span className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                          {milestone.year}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{t(milestone.titleKey)}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{t(milestone.descKey)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className={`max-w-4xl mx-auto px-4 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("about.sponsorChild")}</h2>
            <p className="text-lg opacity-90 mb-2">
              <span className="text-2xl font-bold">Rs. 6,500</span> {t("about.sponsorChildDesc")}
            </p>
            <div className={`text-sm opacity-80 mb-8 max-w-xl mx-auto space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
              <p className="font-medium">{t("about.whatYouGet")}</p>
              <ul className={`list-disc ${isRTL ? "list-inside mr-4" : "list-inside"} space-y-1`}>
                <li>{t("about.photoOfChild")}</li>
                <li>{t("about.regularUpdates")}</li>
                <li>{t("about.meetChild")}</li>
                <li>{t("about.annualReport")}</li>
                <li>{t("about.supportUniversity")}</li>
              </ul>
            </div>
            <p className="text-xs opacity-70 italic mb-8">
              {t("about.safetyNote")}
            </p>
            <Link href="/donate">
              <Button size="lg" variant="secondary" data-testid="button-sponsor-child">
                <Heart className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("about.sponsorToday")}
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
