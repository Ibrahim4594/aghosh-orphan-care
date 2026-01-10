import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, GraduationCap, Stethoscope, Home, Sparkles, Shield, Users, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export default function WelcomePage() {
  const { t, isRTL } = useLanguage();

  const stats = [
    { title: t("welcome.stat1Title"), value: t("welcome.stat1Value"), icon: Users },
    { title: t("welcome.stat2Title"), value: t("welcome.stat2Value"), icon: Heart },
    { title: t("welcome.stat3Title"), value: t("welcome.stat3Value"), icon: Shield },
    { title: t("welcome.stat4Title"), value: t("welcome.stat4Value"), icon: Sparkles },
  ];

  const features = [
    { title: t("welcome.feature1Title"), desc: t("welcome.feature1Desc"), icon: GraduationCap, color: "from-blue-500 to-cyan-500" },
    { title: t("welcome.feature2Title"), desc: t("welcome.feature2Desc"), icon: Stethoscope, color: "from-rose-500 to-pink-500" },
    { title: t("welcome.feature3Title"), desc: t("welcome.feature3Desc"), icon: Home, color: "from-amber-500 to-orange-500" },
    { title: t("welcome.feature4Title"), desc: t("welcome.feature4Desc"), icon: Sparkles, color: "from-emerald-500 to-green-500" },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-primary/5 ${isRTL ? "direction-rtl" : ""}`}>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Aghosh</h1>
              <p className="text-xs text-muted-foreground">Minhaj Welfare</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Content */}
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center py-12">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Main Logo */}
            <div className="relative mb-8">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30 animate-pulse">
                <Heart className="w-12 h-12 md:w-16 md:h-16 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
              {t("welcome.title")}
            </h1>
            <p className="text-xl md:text-2xl text-primary font-medium mb-4">
              {t("welcome.subtitle")}
            </p>
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
              {t("welcome.tagline")}
            </p>

            {/* Description */}
            <p className="max-w-2xl text-muted-foreground mb-8 text-base md:text-lg leading-relaxed">
              {t("welcome.description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/donor/signup">
                <Button size="lg" className="h-14 px-8 text-lg font-medium shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                  <UserPlus className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("welcome.createAccount")}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`} />
                </Button>
              </Link>
              <Link href="/donor/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium border-2 hover:bg-primary/5 transition-all">
                  <LogIn className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("welcome.signIn")}
                </Button>
              </Link>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              <span>{t("welcome.trustBadge")}</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-card border rounded-2xl p-6 text-center hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {isRTL ? "ہم کیا فراہم کرتے ہیں" : "What We Provide"}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="group bg-card border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 text-center border border-primary/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {isRTL ? "آج ہی اپنا سفر شروع کریں" : "Start Your Journey Today"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              {t("welcome.secureNote")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donor/signup">
                <Button size="lg" className="h-12 px-6">
                  <UserPlus className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("welcome.createAccount")}
                </Button>
              </Link>
              <Link href="/donor/login">
                <Button size="lg" variant="ghost">
                  {t("welcome.alreadyMember")} <span className="text-primary font-medium ml-1">{t("welcome.signIn")}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Aghosh Orphan Care Home. Minhaj Welfare Foundation.</p>
      </footer>
    </div>
  );
}
