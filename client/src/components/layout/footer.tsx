import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import aghoshLogo from "@assets/Aghosh-Karachi-Minhaj-Welfare-Foundation-Pakistan_05_1767633857577.jpg";

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={aghoshLogo} 
                alt="Aghosh Orphan Care Home Logo" 
                className="h-12 w-12 object-contain rounded-md"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-lg leading-tight text-primary">Aghosh</span>
                <span className="text-xs text-muted-foreground leading-tight">Minhaj Welfare Foundation</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Founded by Shaykh-ul-Islam Dr. Muhammad Tahir-ul-Qadri to provide shelter, 
              education, and care to orphaned children, turning them into socially productive human beings.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-arabic text-base">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-programs">
                  Our Programs
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-donate">
                  Make a Donation
                </Link>
              </li>
              <li>
                <Link href="/impact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-impact">
                  Our Impact
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Shah Jillani Road, Township, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+92 42 35169111</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@welfare.org.pk</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for updates on our work and impact stories.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button size="default" data-testid="button-newsletter-subscribe">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Aghosh Orphan Care Home - Minhaj Welfare Foundation. All rights reserved.</p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/admin" className="hover:text-foreground transition-colors" data-testid="link-admin">
                Admin Login
              </Link>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
