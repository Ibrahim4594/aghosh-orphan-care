import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useState, FormEvent } from "react";
import aghoshLogo from "@assets/Aghosh-Karachi-Minhaj-Welfare-Foundation-Pakistan_05_1767633857577.jpg";

export function Footer() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to subscribe");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("footer.subscriptionSuccess"),
        description: t("footer.subscriptionSuccessMessage"),
      });
      setEmail("");
    },
    onError: (error: Error) => {
      const message = error.message;

      if (message.includes("already subscribed")) {
        toast({
          title: t("footer.alreadySubscribed"),
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("footer.subscriptionError"),
          description: message,
          variant: "destructive",
        });
      }
    },
  });

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast({
        title: t("footer.invalidEmail"),
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    subscribeMutation.mutate(email);
  };

  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 ${isRTL ? "direction-rtl" : ""}`}>
          <div className="space-y-4">
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <img 
                src={aghoshLogo} 
                alt="Aghosh Orphan Care Home Logo" 
                className="h-12 w-12 object-contain rounded-md"
              />
              <div className={`flex flex-col ${isRTL ? "items-end" : ""}`}>
                <span className="font-semibold text-lg leading-tight text-primary">Aghosh</span>
                <span className="text-xs text-muted-foreground leading-tight">Minhaj Welfare Foundation</span>
              </div>
            </div>
            <p className={`text-sm text-muted-foreground leading-relaxed ${isRTL ? "text-right" : ""}`}>
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-arabic text-base">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</span>
            </div>
          </div>

          <div className={`space-y-4 ${isRTL ? "text-right" : ""}`}>
            <h3 className="font-semibold">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-programs">
                  {t("footer.ourPrograms")}
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-donate">
                  {t("footer.makeDonation")}
                </Link>
              </li>
              <li>
                <Link href="/impact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-impact">
                  {t("footer.ourImpact")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">
                  {t("footer.contactUs")}
                </Link>
              </li>
            </ul>
          </div>

          <div className={`space-y-4 ${isRTL ? "text-right" : ""}`}>
            <h3 className="font-semibold">{t("footer.contactInfo")}</h3>
            <ul className="space-y-3 text-sm">
              <li className={`flex items-start gap-3 text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{t("footer.address")}</span>
              </li>
              <li className={`flex items-center gap-3 text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{t("footer.phone")}</span>
              </li>
              <li className={`flex items-center gap-3 text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{t("footer.email")}</span>
              </li>
            </ul>
          </div>

          <div className={`space-y-4 ${isRTL ? "text-right" : ""}`}>
            <h3 className="font-semibold">{t("footer.stayUpdated")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("footer.newsletter")}
            </p>
            <form onSubmit={handleSubscribe} className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribeMutation.isPending}
                data-testid="input-newsletter-email"
              />
              <Button
                type="submit"
                size="default"
                disabled={subscribeMutation.isPending}
                data-testid="button-newsletter-subscribe"
              >
                {subscribeMutation.isPending ? t("footer.subscribing") : t("footer.subscribe")}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground ${isRTL ? "md:flex-row-reverse" : ""}`}>
            <p>&copy; {new Date().getFullYear()} Aghosh Orphan Care Home - Minhaj Welfare Foundation. {t("footer.copyright")}</p>
            <div className={`flex items-center gap-4 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
              <Link href="/admin" className="hover:text-foreground transition-colors" data-testid="link-admin">
                {t("footer.adminLogin")}
              </Link>
              <span>{t("footer.privacyPolicy")}</span>
              <span>{t("footer.termsOfService")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
