import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Send,
  Loader2,
  MessageCircle,
  Heart
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { ScrollReveal, StaggerContainer, StaggerItem, HoverLift } from "@/lib/animations";
import { Link } from "wouter";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { t, isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subjects = [
    { key: "contact.generalInquiry", value: "general" },
    { key: "contact.donationQuestions", value: "donation" },
    { key: "contact.volunteerOpportunities", value: "volunteer" },
    { key: "contact.scheduleVisit", value: "visit" },
    { key: "contact.partnershipRequest", value: "partnership" },
    { key: "contact.mediaInquiry", value: "media" },
    { key: "contact.other", value: "other" },
  ];

  const contactInfo = [
    {
      icon: MapPin,
      title: "contact.address",
      content: ["Aghosh Orphan Care Home", "Gulshan-e-Iqbal", "Karachi, Pakistan"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Phone,
      title: "contact.phone",
      content: ["+92 21 34836947"],
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: Mail,
      title: "contact.email",
      content: ["aghosh.karachi@minhaj.org"],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "contact.officeHours",
      content: ["contact.officeHoursText", "contact.closed"],
      isTranslated: true,
      color: "from-amber-500 to-orange-500"
    },
  ];

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Contact form error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/5 to-background overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        <div className={`max-w-7xl mx-auto px-4 text-center relative z-10 ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{t("nav.contact")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-contact-title">
              {t("contact.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("contact.subtitle")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-8 relative z-10">
        <div className={`max-w-7xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <StaggerItem key={index}>
                  <HoverLift>
                    <Card className="h-full border-none shadow-lg" data-testid={`card-contact-${index}`}>
                      <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4 shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">{t(info.title)}</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {info.content.map((line, i) => (
                            <p key={i}>{info.isTranslated ? t(line) : line}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 md:py-20">
        <div className={`max-w-4xl mx-auto px-4 ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <Card className="border-none shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                {isSuccess ? (
                  <div className="text-center py-16 px-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">{t("contact.messageSent")}</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      {t("contact.responseTime")}
                    </p>
                    <Button size="lg" onClick={() => setIsSuccess(false)}>
                      <Send className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("contact.send")}
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-5">
                    {/* Form Side */}
                    <div className={`md:col-span-3 p-8 md:p-10 ${isRTL ? "text-right" : ""}`}>
                      <h2 className="text-2xl font-bold mb-2">{t("contact.sendMessage")}</h2>
                      <p className="text-muted-foreground mb-8">
                        {t("contact.fillForm")}
                      </p>

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("contact.yourName")}</FormLabel>
                                  <FormControl>
                                    <Input className="h-11" placeholder={t("contact.yourName")} {...field} data-testid="input-contact-name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("contact.email")}</FormLabel>
                                  <FormControl>
                                    <Input className="h-11" type="email" placeholder={t("contact.email")} {...field} data-testid="input-contact-email" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("contact.subject")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11" data-testid="select-contact-subject">
                                      <SelectValue placeholder={t("contact.selectSubject")} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {subjects.map((subject) => (
                                      <SelectItem key={subject.value} value={subject.value}>
                                        {t(subject.key)}
                                      </SelectItem>
                                    ))}
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
                                <FormLabel>{t("contact.message")}</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={t("contact.messagePlaceholder")}
                                    className="min-h-[150px] resize-none"
                                    {...field}
                                    data-testid="textarea-contact-message"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            size="lg"
                            className="w-full h-12"
                            disabled={isSubmitting}
                            data-testid="button-contact-submit"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className={`w-5 h-5 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />
                                {t("contact.sending")}
                              </>
                            ) : (
                              <>
                                <Send className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                                {t("contact.send")}
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>

                    {/* Info Side */}
                    <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 md:p-10 flex flex-col justify-center">
                      <h3 className="text-xl font-bold mb-4">{t("contact.visitUs")}</h3>
                      <p className="opacity-90 mb-6 text-sm leading-relaxed">
                        {t("contact.visitDesc")}
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">Karachi, Pakistan</p>
                            <p className="opacity-75">Gulshan-e-Iqbal</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">9:00 AM - 5:00 PM</p>
                            <p className="opacity-75">Mon - Sat</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent/30">
        <div className={`max-w-4xl mx-auto px-4 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <Heart className="w-12 h-12 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-4">{t("contact.visitUs")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("contact.visitDesc")}
            </p>
            <Link href="/donate">
              <Button size="lg">
                <Heart className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("nav.donateNow")}
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
