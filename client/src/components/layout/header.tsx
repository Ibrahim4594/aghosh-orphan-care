import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/donate", label: "Donate" },
  { href: "/impact", label: "Impact" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg leading-tight" data-testid="text-logo">Aghosh</span>
              <span className="text-xs text-muted-foreground leading-tight">Orphan Care</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={location === link.href ? "bg-accent" : ""}
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/donate" className="hidden sm:block">
              <Button data-testid="button-donate-header">
                <Heart className="w-4 h-4 mr-2" />
                Donate Now
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
                    className={`w-full justify-start ${location === link.href ? "bg-accent" : ""}`}
                    onClick={() => setIsMenuOpen(false)}
                    data-testid={`link-mobile-nav-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <Link href="/donate">
                <Button className="w-full mt-2" onClick={() => setIsMenuOpen(false)}>
                  <Heart className="w-4 h-4 mr-2" />
                  Donate Now
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
