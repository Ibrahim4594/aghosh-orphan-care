import { Link, useLocation } from "wouter";
import { Home, Info, Heart, Sparkles, Phone } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About", icon: Info },
  { href: "/donate", label: "Donate", icon: Heart },
  { href: "/impact", label: "Impact", icon: Sparkles },
  { href: "/contact", label: "Contact", icon: Phone },
];

export function MobileBottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
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
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              >
                <div className={`${isDonate ? "bg-primary text-primary-foreground rounded-full p-2 -mt-4 shadow-lg" : ""}`}>
                  <Icon className={`${isDonate ? "w-5 h-5" : "w-5 h-5"}`} />
                </div>
                <span className={`text-[10px] mt-1 ${isDonate ? "font-medium" : ""}`}>{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
