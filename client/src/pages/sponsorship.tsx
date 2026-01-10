import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  User,
  GraduationCap,
  Calendar,
  Loader2,
  CheckCircle2,
  HandHeart,
  Building2,
  Copy,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollReveal, StaggerContainer, StaggerItem, FadeIn, HoverLift, SuccessCheckmark } from "@/lib/animations";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";

interface Child {
  id: string;
  name: string;
  age: number;
  gender: string;
  grade: string | null;
  story: string | null;
  needs: string | null;
  imageUrl: string | null;
  monthlyAmount: number | null;
  isSponsored: boolean;
  isActive: boolean;
}

const sponsorshipSchema = z.object({
  childId: z.string().min(1, "Please select a child"),
  sponsorName: z.string().min(2, "Name must be at least 2 characters"),
  sponsorEmail: z.string().email("Invalid email address"),
  sponsorPhone: z.string().optional(),
  paymentMethod: z.enum(["bank", "card"]).default("bank"),
  notes: z.string().optional(),
});

type SponsorshipFormData = z.infer<typeof sponsorshipSchema>;

export default function SponsorshipPage() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sponsorshipResult, setSponsorshipResult] = useState<any>(null);

  const { data: children, isLoading } = useQuery<Child[]>({
    queryKey: ["/api/children"],
    queryFn: async () => {
      const response = await fetch("/api/children");
      if (!response.ok) throw new Error("Failed to fetch children");
      return response.json();
    },
  });

  const form = useForm<SponsorshipFormData>({
    resolver: zodResolver(sponsorshipSchema),
    defaultValues: {
      childId: "",
      sponsorName: "",
      sponsorEmail: "",
      sponsorPhone: "",
      paymentMethod: "bank",
      notes: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: SponsorshipFormData) => {
      const response = await fetch("/api/sponsorships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit sponsorship");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setSponsorshipResult(data);
      setIsSuccess(true);
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      toast({
        title: t("sponsor.successTitle"),
        description: t("sponsor.successDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("sponsor.errorTitle"),
        description: error.message || t("sponsor.errorDesc"),
        variant: "destructive",
      });
    },
  });

  const handleSponsorClick = (child: Child) => {
    setSelectedChild(child);
    form.setValue("childId", child.id);
    setIsDialogOpen(true);
  };

  const onSubmit = (data: SponsorshipFormData) => {
    submitMutation.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("sponsor.copied"),
      description: text,
    });
  };

  const availableChildren = children?.filter(c => !c.isSponsored) || [];
  const sponsoredChildren = children?.filter(c => c.isSponsored) || [];

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-background">
        <div className={`max-w-2xl mx-auto px-4 py-20 ${isRTL ? "direction-rtl" : ""}`}>
          <FadeIn>
            <Card className="text-center p-12">
              <SuccessCheckmark className="w-24 h-24 mx-auto text-green-500 mb-6" />
              <h1 className="text-3xl font-bold mb-4">{t("sponsor.successTitle")}</h1>
              <p className="text-muted-foreground mb-4">
                {t("sponsor.thankYouMessage")} {sponsorshipResult?.sponsorship?.childName || t("sponsor.aChild")}
              </p>
              <div className="p-4 bg-primary/5 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground">{t("sponsor.monthlyCommitment")}:</p>
                <p className="text-2xl font-bold text-primary">
                  PKR {(sponsorshipResult?.sponsorship?.monthlyAmount || 5000).toLocaleString()}/{t("sponsor.month")}
                </p>
              </div>
              <div className={`p-4 bg-accent/50 rounded-md border mb-6 ${isRTL ? "text-right" : "text-left"}`}>
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Building2 className="w-4 h-4" />
                  {t("sponsor.bankDetails")}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className={`flex justify-between items-center ${isRTL ? "flex-row-reverse" : ""}`}>
                    <span className="text-muted-foreground">{t("sponsor.bank")}:</span>
                    <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span className="font-medium">Meezan Bank Limited</span>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard("Meezan Bank Limited")}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className={`flex justify-between items-center ${isRTL ? "flex-row-reverse" : ""}`}>
                    <span className="text-muted-foreground">{t("sponsor.account")}:</span>
                    <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span className="font-medium font-mono">0101-0105-3297-51</span>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard("0101-0105-3297-51")}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {t("sponsor.transferNote")}
                </p>
              </div>
              <div className={`flex gap-4 justify-center ${isRTL ? "flex-row-reverse" : ""}`}>
                <Link href="/">
                  <Button>{t("sponsor.returnHome")}</Button>
                </Link>
                <Button variant="outline" onClick={() => setIsSuccess(false)}>
                  {t("sponsor.sponsorAnother")}
                </Button>
              </div>
            </Card>
          </FadeIn>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
        <div className={`max-w-7xl mx-auto px-4 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <HandHeart className="w-4 h-4" />
              <span className="text-sm font-medium">{t("sponsor.title")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("sponsor.heroTitle")} <span className="text-primary">{t("sponsor.heroTitleHighlight")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("sponsor.subtitle")}
            </p>
            <div className={`flex flex-wrap gap-4 justify-center ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-2 bg-card px-4 py-2 rounded-lg border ${isRTL ? "flex-row-reverse" : ""}`}>
                <GraduationCap className="w-5 h-5 text-primary" />
                <span>{t("sponsor.education")}</span>
              </div>
              <div className={`flex items-center gap-2 bg-card px-4 py-2 rounded-lg border ${isRTL ? "flex-row-reverse" : ""}`}>
                <Heart className="w-5 h-5 text-primary" />
                <span>{t("sponsor.healthcare")}</span>
              </div>
              <div className={`flex items-center gap-2 bg-card px-4 py-2 rounded-lg border ${isRTL ? "flex-row-reverse" : ""}`}>
                <BookOpen className="w-5 h-5 text-primary" />
                <span>{t("sponsor.quranLearning")}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-accent/30">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-center mb-8">{t("sponsor.howItWorks")}</h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: t("sponsor.step1Title"), desc: t("sponsor.step1Desc") },
              { step: "2", title: t("sponsor.step2Title"), desc: t("sponsor.step2Desc") },
              { step: "3", title: t("sponsor.step3Title"), desc: t("sponsor.step3Desc") },
            ].map((item, index) => (
              <StaggerItem key={index}>
                <div className="text-center p-6 bg-card rounded-lg border">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Available Children */}
      <section className="py-16 md:py-20">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isRTL ? "text-right" : ""}`}>{t("sponsor.childrenWaiting")}</h2>
            <p className={`text-muted-foreground mb-8 ${isRTL ? "text-right" : ""}`}>{t("sponsor.childrenWaitingDesc")}</p>
          </ScrollReveal>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : availableChildren.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableChildren.map((child) => (
                <StaggerItem key={child.id}>
                  <HoverLift>
                    <Card className="h-full elevated-card overflow-hidden">
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-12 h-12 text-primary" />
                        </div>
                      </div>
                      <CardHeader className={isRTL ? "text-right" : ""}>
                        <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                          <CardTitle className="text-xl">{child.name}</CardTitle>
                          <Badge variant="secondary">
                            {child.gender === "male" ? t("sponsor.boy") : t("sponsor.girl")}
                          </Badge>
                        </div>
                        <CardDescription className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                          <span className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                            <Calendar className="w-4 h-4" />
                            {child.age} {t("sponsor.yearsOld")}
                          </span>
                          {child.grade && (
                            <span className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <GraduationCap className="w-4 h-4" />
                              {child.grade}
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className={isRTL ? "text-right" : ""}>
                        {child.story && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                            {child.story}
                          </p>
                        )}
                        {child.needs && (
                          <div className={`flex flex-wrap gap-1 ${isRTL ? "justify-end" : ""}`}>
                            {child.needs.split(",").map((need, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {need.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex flex-col gap-3 border-t pt-4">
                        <div className="w-full text-center">
                          <p className="text-sm text-muted-foreground">{t("sponsor.monthlySponsorship")}</p>
                          <p className="text-2xl font-bold text-primary">
                            PKR {(child.monthlyAmount || 5000).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleSponsorClick(child)}
                        >
                          <Heart className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {t("sponsor.sponsorBtn")} {child.name}
                        </Button>
                      </CardFooter>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <Card className={`p-12 text-center ${isRTL ? "direction-rtl" : ""}`}>
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("sponsor.allSponsored")}</h3>
              <p className="text-muted-foreground mb-6">
                {t("sponsor.allSponsoredDesc")}
              </p>
              <Link href="/donate">
                <Button>{t("sponsor.makeDonation")}</Button>
              </Link>
            </Card>
          )}

          {/* Sponsored Children */}
          {sponsoredChildren.length > 0 && (
            <>
              <ScrollReveal className="mt-16">
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isRTL ? "text-right" : ""}`}>{t("sponsor.alreadySponsored")}</h2>
                <p className={`text-muted-foreground mb-8 ${isRTL ? "text-right" : ""}`}>{t("sponsor.alreadySponsoredDesc")}</p>
              </ScrollReveal>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 opacity-75">
                {sponsoredChildren.map((child) => (
                  <Card key={child.id} className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="font-medium text-sm">{child.name}</p>
                    <p className="text-xs text-muted-foreground">{child.age} {t("sponsor.years")}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">{t("sponsor.sponsored")}</Badge>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className={`max-w-4xl mx-auto px-4 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("sponsor.ctaTitle")}
            </h2>
            <p className="text-lg opacity-90 mb-8">
              {t("sponsor.ctaDesc")}
            </p>
            <Link href="/donate">
              <Button size="lg" variant="secondary">
                {t("sponsor.oneTimeDonation")}
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Sponsorship Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`sm:max-w-md ${isRTL ? "direction-rtl" : ""}`}>
          <DialogHeader className={isRTL ? "text-right" : ""}>
            <DialogTitle>{t("sponsor.sponsorBtn")} {selectedChild?.name}</DialogTitle>
            <DialogDescription>
              {t("sponsor.dialogDesc")} PKR {(selectedChild?.monthlyAmount || 5000).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="sponsorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("sponsor.yourName")} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t("sponsor.enterName")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sponsorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("sponsor.emailAddress")} *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("sponsor.emailPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sponsorPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("sponsor.phoneNumber")}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t("sponsor.phonePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("sponsor.paymentMethod")} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("sponsor.selectPayment")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank">{t("sponsor.bankTransfer")}</SelectItem>
                        <SelectItem value="card">{t("sponsor.cardPayment")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("sponsor.messageOptional")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("sponsor.messagePlaceholder")}
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className={`flex gap-3 pt-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("sponsor.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} animate-spin`} />
                      {t("sponsor.submitting")}
                    </>
                  ) : (
                    <>
                      <Heart className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("sponsor.confirmSponsorship")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
