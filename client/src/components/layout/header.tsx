import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Heart, User, LogIn, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/lib/i18n";
import { getDonorToken } from "@/lib/queryClient";
import aghoshLogo from "@assets/Aghosh-Karachi-Minhaj-Welfare-Foundation-Pakistan_05_1767633857577.jpg";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDonorLoggedIn, setIsDonorLoggedIn] = useState(false);
  const [location] = useLocation();
  const { t, isRTL } = useLanguage();

  // Check if donor is logged in
  useEffect(() => {
    const token = getDonorToken();
    setIsDonorLoggedIn(!!token);
  }, [location]); // Re-check when location changes

  const navLinks = [
    { href: "/", labelKey: "nav.home" },
    { href: "/about", labelKey: "nav.about" },
    { href: "/programs", labelKey: "nav.programs" },
    { href: "/sponsorship", labelKey: "nav.sponsor" },
    { href: "/events", labelKey: "nav.events" },
    { href: "/volunteer", labelKey: "nav.volunteer" },
    { href: "/donate", labelKey: "nav.donate" },
    { href: "/impact", labelKey: "nav.impact" },
    { href: "/contact", labelKey: "nav.contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`flex h-16 items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          <Link href="/" className={`flex items-center gap-2 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}>
            <img
              src={aghoshLogo}
              alt="Aghosh Orphan Care Home Logo"
              className="h-10 w-10 object-contain rounded-md"
              data-testid="img-logo"
            />
            <div className={`flex flex-col ${isRTL ? "items-end" : ""}`}>
              <span className="font-bold text-primary leading-none" data-testid="text-logo">Aghosh</span>
              <span className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap">Minhaj Welfare Foundation</span>
            </div>
          </Link>

          <nav className={`hidden lg:flex items-center ${isRTL ? "flex-row-reverse" : ""}`}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === link.href
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground"
                  }`}
                  data-testid={`link-nav-${link.labelKey.split('.')[1]}`}
                >
                  {t(link.labelKey)}
                </span>
              </Link>
            ))}
          </nav>

          <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
            <LanguageToggle />
            <ThemeToggle />
            {isDonorLoggedIn ? (
              <Link href="/donor/dashboard" className="hidden md:block">
                <Button variant="ghost" size="sm" data-testid="button-donor-account">
                  <User className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                  <span className="hidden xl:inline">{t("donor.dashboard")}</span>
                </Button>
              </Link>
            ) : (
              <Link href="/donor/login" className="hidden md:block">
                <Button variant="ghost" size="sm" data-testid="button-donor-login">
                  <User className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                  <span className="hidden xl:inline">{t("donor.login")}</span>
                </Button>
              </Link>
            )}
            <Link href="/donate" className="hidden sm:block">
              <Button size="sm" data-testid="button-donate-header">
                <Heart className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                {t("nav.donateNow")}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t">
            <div className={`flex flex-col gap-1 ${isRTL ? "items-end" : ""}`}>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`block px-3 py-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                      location === link.href ? "text-primary bg-primary/5" : "text-muted-foreground"
                    } ${isRTL ? "text-right" : "text-left"}`}
                    onClick={() => setIsMenuOpen(false)}
                    data-testid={`link-mobile-nav-${link.labelKey.split('.')[1]}`}
                  >
                    {t(link.labelKey)}
                  </span>
                </Link>
              ))}
              <div className="border-t mt-2 pt-3 flex flex-col gap-2">
                {isDonorLoggedIn ? (
                  <Link href="/donor/dashboard">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <User className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("donor.dashboard")}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/donor/login">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("donor.login")}
                    </Button>
                  </Link>
                )}
                <Link href="/donate">
                  <Button size="sm" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Heart className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("nav.donateNow")}
                  </Button>
                </Link>
                <Link href="/donate-test">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Receipt className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    Receipt Testing
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
