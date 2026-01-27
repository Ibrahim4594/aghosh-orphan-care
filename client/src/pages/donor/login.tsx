import { useState, useEffect } from "react";
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
import { Heart, Loader2, LogIn, Shield, User, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { setAuthToken } from "@/lib/queryClient";

const donorLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type DonorLoginFormData = z.infer<typeof donorLoginSchema>;
type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

interface LoginResponse {
  message: string;
  token: string;
  donor: {
    id: string;
    email: string;
    fullName: string;
  };
}

export default function DonorLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const { login, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"donor" | "admin">("donor");

  // Redirect if already authenticated
  useEffect(() => {
    // Clean up old token format (admin_token with underscore)
    localStorage.removeItem("admin_token");

    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const donorForm = useForm<DonorLoginFormData>({
    resolver: zodResolver(donorLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const adminForm = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const donorLoginMutation = useMutation({
    mutationFn: async (data: DonorLoginFormData) => {
      const response = await fetch("/api/donor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json() as Promise<LoginResponse>;
    },
    onSuccess: (data) => {
      login(data.token, data.donor);
      toast({
        title: t("donor.loginSuccess"),
        description: t("donor.welcomeBack").replace("{name}", data.donor.fullName),
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: t("donor.loginFailed"),
        description: error.message || t("donor.invalidCredentials"),
        variant: "destructive",
      });
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (data: AdminLoginFormData) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      toast({
        title: t("admin.loginSuccess"),
        description: t("admin.welcomeBack"),
      });
      setLocation("/admin/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: t("admin.loginFailed"),
        description: error.message || t("admin.invalidCredentials"),
        variant: "destructive",
      });
    },
  });

  const onDonorSubmit = (data: DonorLoginFormData) => {
    donorLoginMutation.mutate(data);
  };

  const onAdminSubmit = (data: AdminLoginFormData) => {
    adminLoginMutation.mutate(data);
  };

  return (
    <main className={`min-h-[80vh] flex items-center justify-center py-12 px-4 ${isRTL ? "direction-rtl" : ""}`}>
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{t("auth.login")}</h1>
          <p className="text-muted-foreground mt-1">{t("auth.loginDescription")}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-muted rounded-xl mb-6">
          <button
            onClick={() => setActiveTab("donor")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "donor"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            {t("auth.donor")}
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "admin"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="w-4 h-4" />
            {t("auth.admin")}
          </button>
        </div>

        {/* Donor Login Form */}
        {activeTab === "donor" && (
          <Card className="border-0 shadow-xl shadow-black/5">
            <CardContent className="pt-6">
              <Form {...donorForm}>
                <form onSubmit={donorForm.handleSubmit(onDonorSubmit)} className="space-y-4">
                  <FormField
                    control={donorForm.control}
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

                  <FormField
                    control={donorForm.control}
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

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
                    disabled={donorLoginMutation.isPending}
                  >
                    {donorLoginMutation.isPending ? (
                      <>
                        <Loader2 className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} animate-spin`} />
                        {t("donor.signingIn")}
                      </>
                    ) : (
                      <>
                        {t("donor.signIn")}
                        <ArrowRight className={`w-4 h-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`} />
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("donor.noAccount")}{" "}
                  <Link href="/donor/signup" className="text-primary hover:underline font-medium">
                    {t("donor.signUpHere")}
                  </Link>
                </p>
              </div>

              {/* Benefits */}
              <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                <p className="text-sm font-medium text-center mb-3">{t("donor.benefitsTitle")}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t("donor.benefit1")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t("donor.benefit2")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t("donor.benefit3")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Login Form */}
        {activeTab === "admin" && (
          <Card className="border-0 shadow-xl shadow-black/5">
            <CardContent className="pt-6">
              <Form {...adminForm}>
                <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                  <FormField
                    control={adminForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t("admin.username")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                            <Input
                              placeholder={t("admin.usernamePlaceholder")}
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
                    control={adminForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t("admin.password")}</FormLabel>
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

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
                    disabled={adminLoginMutation.isPending}
                  >
                    {adminLoginMutation.isPending ? (
                      <>
                        <Loader2 className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} animate-spin`} />
                        {t("admin.signingIn")}
                      </>
                    ) : (
                      <>
                        {t("admin.signIn")}
                        <ArrowRight className={`w-4 h-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`} />
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Admin Notice */}
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {t("admin.accessNote")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
