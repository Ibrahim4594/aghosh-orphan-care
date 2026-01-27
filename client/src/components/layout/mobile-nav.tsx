import { Link, useLocation } from "wouter";
import { Home, Heart, Sparkles, HandHeart, Info, Settings } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

export function MobileBottomNav() {
  const [location] = useLocation();
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", labelKey: "nav.home", icon: Home },
    { href: "/donate", labelKey: "nav.donate", icon: Heart },
    { href: "/impact", labelKey: "nav.impact", icon: Sparkles },
    { href: "/sponsorship", labelKey: "nav.sponsor", icon: HandHeart },
    { href: "/about", labelKey: "nav.about", icon: Info },
    { href: isAuthenticated ? "/donor/settings" : "/donor/login", labelKey: "nav.settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden safe-area-bottom">
      <div className={`flex items-center justify-around h-16 ${isRTL ? "flex-row-reverse" : ""}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          const isDonate = item.href === "/donate";
          
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`flex flex-col items-center justify-center w-full h-full px-2 py-1 transition-colors ${
                  isDonate 
                    ? "text-primary" 
                    : isActive 
                      ? "text-primary" 
                      : "text-muted-foreground"
                }`}
                data-testid={`mobile-nav-${item.labelKey.split('.')[1]}`}
              >
                <div className={`${isDonate ? "bg-primary text-primary-foreground rounded-full p-1.5 -mt-3 shadow-lg" : ""}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[9px] mt-0.5 ${isDonate ? "font-medium" : ""}`}>{t(item.labelKey)}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
