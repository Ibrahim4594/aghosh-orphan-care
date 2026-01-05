import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/lib/i18n";
import aghoshLogo from "@assets/Aghosh-Karachi-Minhaj-Welfare-Foundation-Pakistan_05_1767633857577.jpg";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { t, isRTL } = useLanguage();

  const navLinks = [
    { href: "/", labelKey: "nav.home" },
    { href: "/about", labelKey: "nav.about" },
    { href: "/programs", labelKey: "nav.programs" },
    { href: "/donate", labelKey: "nav.donate" },
    { href: "/impact", labelKey: "nav.impact" },
    { href: "/contact", labelKey: "nav.contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`flex h-16 items-center justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Link href="/" className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <img 
              src={aghoshLogo} 
              alt="Aghosh Orphan Care Home Logo" 
              className="h-12 w-12 object-contain rounded-md"
              data-testid="img-logo"
            />
            <div className={`flex flex-col ${isRTL ? "items-end" : ""}`}>
              <span className="font-semibold text-lg leading-tight text-primary" data-testid="text-logo">Aghosh</span>
              <span className="text-xs text-muted-foreground leading-tight">Minhaj Welfare Foundation</span>
            </div>
          </Link>

          <nav className={`hidden md:flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={location === link.href ? "bg-accent" : ""}
                  data-testid={`link-nav-${link.labelKey.split('.')[1]}`}
                >
                  {t(link.labelKey)}
                </Button>
              </Link>
            ))}
          </nav>

          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/donate" className="hidden sm:block">
              <Button data-testid="button-donate-header">
                <Heart className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("nav.donateNow")}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={`w-full ${isRTL ? "justify-end" : "justify-start"} ${location === link.href ? "bg-accent" : ""}`}
                    onClick={() => setIsMenuOpen(false)}
                    data-testid={`link-mobile-nav-${link.labelKey.split('.')[1]}`}
                  >
                    {t(link.labelKey)}
                  </Button>
                </Link>
              ))}
              <Link href="/donate">
                <Button className="w-full mt-2" onClick={() => setIsMenuOpen(false)}>
                  <Heart className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("nav.donateNow")}
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
