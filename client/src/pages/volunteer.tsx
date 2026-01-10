import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Heart, BookOpen, Utensils, Loader2, CheckCircle2, HandHeart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollReveal, StaggerContainer, StaggerItem, FadeIn, SuccessCheckmark } from "@/lib/animations";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";

const volunteerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  city: z.string().optional(),
  skills: z.string().optional(),
  availability: z.string().min(1, "Please select your availability"),
  message: z.string().optional(),
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;

const skillOptions = [
  "Teaching / Tutoring",
  "Healthcare / Medical",
  "Cooking / Food Service",
  "Event Management",
  "IT / Technology",
  "Counseling / Psychology",
  "Sports / Recreation",
  "Arts / Crafts",
  "Administration",
  "Fundraising",
  "Other",
];

export default function VolunteerPage() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      skills: "",
      availability: "",
      message: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: VolunteerFormData) => {
      const response = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit application");
      }
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: t("volunteer.successTitle"),
        description: t("volunteer.successDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("volunteer.errorTitle"),
        description: error.message || t("volunteer.errorDesc"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VolunteerFormData) => {
    submitMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-background">
        <div className={`max-w-2xl mx-auto px-4 py-20 ${isRTL ? "direction-rtl" : ""}`}>
          <FadeIn>
            <Card className="text-center p-12">
              <SuccessCheckmark className="w-24 h-24 mx-auto text-green-500 mb-6" />
              <h1 className="text-3xl font-bold mb-4">{t("volunteer.successTitle")}</h1>
              <p className="text-muted-foreground mb-8">
                {t("volunteer.thankYouMessage")}
              </p>
              <div className={`flex gap-4 justify-center ${isRTL ? "flex-row-reverse" : ""}`}>
                <Link href="/">
                  <Button>{t("volunteer.returnHome")}</Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline">{t("nav.events")}</Button>
                </Link>
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
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-secondary/10 via-primary/5 to-background">
        <div className={`max-w-7xl mx-auto px-4 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-6">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{t("volunteer.joinTeam")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("volunteer.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("volunteer.subtitle")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-accent/30">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: t("volunteer.benefit1Title"), desc: t("volunteer.benefit1Desc") },
              { icon: Users, title: t("volunteer.benefit2Title"), desc: t("volunteer.benefit2Desc") },
              { icon: BookOpen, title: t("volunteer.benefit3Title"), desc: t("volunteer.benefit3Desc") },
              { icon: HandHeart, title: t("volunteer.benefit4Title"), desc: t("volunteer.benefit4Desc") },
            ].map((item, index) => (
              <StaggerItem key={index}>
                <div className="text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-20">
        <div className={`max-w-2xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <Card className="elevated-card">
              <CardHeader className={isRTL ? "text-right" : ""}>
                <CardTitle className="text-2xl">{t("volunteer.formTitle")}</CardTitle>
                <CardDescription>
                  {t("volunteer.formDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("volunteer.fullName")} *</FormLabel>
                          <FormControl>
                            <Input placeholder={t("volunteer.fullNamePlaceholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("volunteer.email")} *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder={t("volunteer.emailPlaceholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("volunteer.phone")} *</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder={t("volunteer.phonePlaceholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("volunteer.city")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("volunteer.cityPlaceholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("volunteer.skills")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("volunteer.skillsPlaceholder")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {skillOptions.map((skill) => (
                                <SelectItem key={skill} value={skill}>
                                  {skill}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {t("volunteer.skillsDesc")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("volunteer.availability")} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("volunteer.availabilityPlaceholder")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekdays">{t("volunteer.weekdays")}</SelectItem>
                              <SelectItem value="weekends">{t("volunteer.weekends")}</SelectItem>
                              <SelectItem value="flexible">{t("volunteer.flexible")}</SelectItem>
                              <SelectItem value="occasional">{t("volunteer.occasional")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("volunteer.message")}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("volunteer.messagePlaceholder")}
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} animate-spin`} />
                          {t("volunteer.submitting")}
                        </>
                      ) : (
                        <>
                          <Users className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {t("volunteer.submitBtn")}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
