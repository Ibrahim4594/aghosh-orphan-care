import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heart, Loader2, UserPlus, Mail, Lock, User, Phone, MapPin, Globe, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";

const createSignupSchema = (t: (key: string) => string) => z.object({
  fullName: z.string().min(2, t("validation.fullNameMinLength")),
  email: z.string().email(t("validation.invalidEmail")),
  password: z.string().min(6, t("validation.passwordMinLength")),
  confirmPassword: z.string().min(6, t("validation.passwordMinLength")),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t("validation.passwordsDontMatch"),
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<ReturnType<typeof createSignupSchema>>;

interface SignupResponse {
  message: string;
  token: string;
  donor: {
    id: string;
    email: string;
    fullName: string;
  };
}

export default function DonorSignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(createSignupSchema(t)),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      city: "",
      country: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const { confirmPassword, ...signupData } = data;
      const response = await fetch("/api/donor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
      }
      return response.json() as Promise<SignupResponse>;
    },
    onSuccess: (data) => {
      login(data.token, data.donor);
      toast({
        title: t("donor.signupSuccess"),
        description: t("donor.welcomeMessage").replace("{name}", data.donor.fullName),
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: t("donor.signupFailed"),
        description: error.message || t("donor.signupError"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  const benefits = [
    t("donor.benefit1"),
    t("donor.benefit2"),
    t("donor.benefit3"),
  ];

  return (
    <main className={`min-h-[80vh] flex items-center justify-center py-12 px-4 ${isRTL ? "direction-rtl" : ""}`}>
      <div className="w-full max-w-lg">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{t("donor.createAccount")}</h1>
          <p className="text-muted-foreground mt-1">{t("donor.signupDescription")}</p>
        </div>

        {/* Benefits Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-100 dark:border-green-800">
          <div className="flex flex-wrap gap-4 justify-center">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-green-800 dark:text-green-200">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-0 shadow-xl shadow-black/5">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">{t("donor.fullName")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                          <Input
                            placeholder={t("donor.fullNamePlaceholder")}
                            className={`${isRTL ? "pr-10" : "pl-10"} h-11`}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">{t("donor.email")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className={`${isRTL ? "pr-10" : "pl-10"} h-11`}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Row */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t("donor.password")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className={`${isRTL ? "pr-10" : "pl-10"} h-11`}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t("donor.confirmPassword")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className={`${isRTL ? "pr-10" : "pl-10"} h-11`}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Optional Fields Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t("common.optional")}</span>
                  </div>
                </div>

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t("donor.phone")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                          <Input
                            type="tel"
                            placeholder="+92 300 1234567"
                            className={`${isRTL ? "pr-10" : "pl-10"} h-11`}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City & Country Row */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t("donor.city")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                            <Input
                              placeholder={t("donor.cityPlaceholder")}
                              className={`${isRTL ? "pr-10" : "pl-10"} h-11`}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t("donor.country")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                            <Input
                              placeholder={t("donor.countryPlaceholder")}
                              className={`${isRTL ? "pr-10" : "pl-10"} h-11`}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium mt-2"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? (
                    <>
                      <Loader2 className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} animate-spin`} />
                      {t("donor.creatingAccount")}
                    </>
                  ) : (
                    <>
                      <UserPlus className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("donor.createAccountBtn")}
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t("donor.haveAccount")}{" "}
                <Link href="/donor/login" className="text-primary hover:underline font-medium">
                  {t("donor.signInHere")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
