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
  Loader2
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

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
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    form.reset();
  };

  return (
    <main className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`text-center mb-16 ${isRTL ? "direction-rtl" : ""}`}>
          <span className="text-sm font-medium text-primary uppercase tracking-wider">{t("nav.contact")}</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6" data-testid="text-contact-title">
            {t("contact.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className={`grid lg:grid-cols-3 gap-8 ${isRTL ? "direction-rtl" : ""}`}>
          <div className="lg:col-span-1 space-y-6">
            <Card data-testid="card-contact-address">
              <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
                <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("contact.address")}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Aghosh Orphan Care Home<br />
                      Near Jamia-al-Minhaj<br />
                      Shah Jillani Road, Township<br />
                      Lahore, Pakistan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-contact-phone">
              <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
                <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("contact.phone")}</h3>
                    <p className="text-sm text-muted-foreground">
                      +92 42 35169111<br />
                      +92 42 35168504
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-contact-email">
              <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
                <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("contact.email")}</h3>
                    <p className="text-sm text-muted-foreground">
                      info@welfare.org.pk<br />
                      info@minhaj.org
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-contact-hours">
              <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
                <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("contact.officeHours")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.officeHoursText")}<br />
                      {t("contact.closed")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardContent className={`p-6 md:p-8 ${isRTL ? "text-right" : ""}`}>
                {isSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{t("contact.messageSent")}</h3>
                    <p className="text-muted-foreground mb-6">
                      {t("contact.responseTime")}
                    </p>
                    <Button variant="outline" onClick={() => setIsSuccess(false)}>
                      {t("contact.send")}
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-2">{t("contact.sendMessage")}</h2>
                    <p className="text-muted-foreground mb-6">
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
                                  <Input placeholder={t("contact.yourName")} {...field} data-testid="input-contact-name" />
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
                                  <Input type="email" placeholder={t("contact.email")} {...field} data-testid="input-contact-email" />
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
                                  <SelectTrigger data-testid="select-contact-subject">
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
                          className="w-full"
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className={`mt-16 bg-accent/30 rounded-lg p-8 md:p-12 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("contact.visitUs")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("contact.visitDesc")}
          </p>
        </div>
      </div>
    </main>
  );
}
