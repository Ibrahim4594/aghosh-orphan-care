import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Home, ArrowLeft, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function NotFound() {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 ${isRTL ? "direction-rtl" : ""}`}>
      <div className="text-center max-w-lg">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[150px] md:text-[200px] font-bold text-primary/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30 animate-pulse">
              <Search className="w-12 h-12 md:w-16 md:h-16 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {t("notFound.title") || "Page Not Found"}
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          {t("notFound.message") || "Oops! The page you're looking for doesn't exist or has been moved."}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("notFound.goHome") || "Go to Homepage"}
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`} />
            {t("notFound.goBack") || "Go Back"}
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 p-6 bg-card rounded-2xl border shadow-lg">
          <p className="text-sm text-muted-foreground mb-4">
            {t("notFound.helpfulLinks") || "You might find these links helpful:"}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/donate">
              <Button variant="ghost" size="sm">
                <Heart className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                {t("nav.donate")}
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm">{t("nav.about")}</Button>
            </Link>
            <Link href="/programs">
              <Button variant="ghost" size="sm">{t("nav.programs")}</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="sm">{t("nav.contact")}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
