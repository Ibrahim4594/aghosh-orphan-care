import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Heart, Loader2, Lock } from "lucide-react";
import { apiRequest, setAuthToken } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  message: string;
  token: string;
  user: { username: string };
}

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/admin/login", data);
      return response.json() as Promise<LoginResponse>;
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      toast({
        title: t("adminAuth.loginSuccess"),
        description: t("adminAuth.welcomeAdmin"),
      });
      setLocation("/admin/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: t("adminAuth.loginFailed"),
        description: error.message || t("adminAuth.invalidCredentials"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-md bg-primary flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{t("adminAuth.title")}</CardTitle>
          <CardDescription>
            {t("adminAuth.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("adminAuth.username")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("adminAuth.adminPlaceholder")}
                        {...field}
                        data-testid="input-admin-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("adminAuth.password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("adminAuth.passwordPlaceholder")}
                        {...field}
                        data-testid="input-admin-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-admin-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                    {t("adminAuth.signingIn")}
                  </>
                ) : (
                  <>
                    <Lock className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t("adminAuth.signIn")}
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 p-4 bg-accent/50 rounded-md">
            <p className="text-sm text-muted-foreground text-center">
              <strong>{t("adminAuth.demoCredentials")}</strong><br />
              {t("adminAuth.demoUsername")}
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
