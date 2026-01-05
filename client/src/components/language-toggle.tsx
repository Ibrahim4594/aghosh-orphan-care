import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ur" : "en");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      title={language === "en" ? "اردو" : "English"}
      data-testid="button-language-toggle"
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">
        {language === "en" ? "Switch to Urdu" : "Switch to English"}
      </span>
    </Button>
  );
}
