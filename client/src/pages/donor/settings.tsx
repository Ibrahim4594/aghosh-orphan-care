import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Lock,
  Bell,
  Shield,
  ChevronLeft,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { donorApiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/lib/animations";

export default function DonorSettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const { isAuthenticated, isLoading: authLoading, donor } = useAuth();

  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    donationReceipts: true,
    newsletter: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/donor/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Initialize form with donor data
  useEffect(() => {
    if (donor) {
      setProfileForm({
        fullName: donor.fullName || "",
        phone: "",
        address: "",
        city: "",
        country: "",
      });
    }
  }, [donor]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      const response = await donorApiRequest("PATCH", "/api/donor/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await donorApiRequest("PATCH", "/api/donor/password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update password. Please check your current password.",
        variant: "destructive",
      });
    },
  });

  const handlePasswordSubmit = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated || !donor) {
    return null;
  }

  return (
    <main className={`min-h-screen bg-gradient-to-b from-background to-accent/20 ${isRTL ? "direction-rtl" : ""}`}>
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-6 md:py-10">
        <div className="container mx-auto px-3 md:px-4">
          <ScrollReveal>
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ChevronLeft className={`w-4 h-4 ${isRTL ? "ml-1 rotate-180" : "mr-1"}`} />
                {t("nav.home") || "Home"}
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">{t("donor.settings") || "Account Settings"}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {t("donor.settingsDescription") || "Manage your account preferences and security"}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 pb-24 md:pb-8">
        <StaggerContainer className="space-y-6">
          {/* Profile Information */}
          <StaggerItem>
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-4">
                <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <CardTitle className="text-lg">{t("donor.personalInfo") || "Personal Information"}</CardTitle>
                    <CardDescription>{t("donor.personalInfoDesc") || "Update your personal details"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <User className="w-4 h-4 text-muted-foreground" />
                      {t("donor.fullName")}
                    </Label>
                    <Input
                      id="fullName"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {t("donor.email")}
                    </Label>
                    <Input
                      id="email"
                      value={donor.email}
                      disabled
                      className="h-11 bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {t("donor.phone")}
                    </Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {t("donor.address") || "Address"}
                    </Label>
                    <Input
                      id="address"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {t("donor.city")}
                    </Label>
                    <Input
                      id="city"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      {t("donor.country")}
                    </Label>
                    <Input
                      id="country"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                      placeholder="Pakistan"
                      className="h-11"
                    />
                  </div>
                </div>
                <div className={`pt-4 ${isRTL ? "text-left" : "text-right"}`}>
                  <Button
                    onClick={() => updateProfileMutation.mutate(profileForm)}
                    disabled={updateProfileMutation.isPending}
                    className="min-w-[140px]"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    )}
                    {t("donor.saveChanges") || "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Security */}
          <StaggerItem>
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-4">
                <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <CardTitle className="text-lg">{t("donor.security") || "Security"}</CardTitle>
                    <CardDescription>{t("donor.securityDesc") || "Manage your password and security settings"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      {t("donor.currentPassword") || "Current Password"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      {t("donor.newPassword") || "New Password"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      {t("donor.confirmPassword") || "Confirm Password"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className={`pt-4 ${isRTL ? "text-left" : "text-right"}`}>
                  <Button
                    onClick={handlePasswordSubmit}
                    disabled={updatePasswordMutation.isPending || !passwordForm.currentPassword || !passwordForm.newPassword}
                    variant="outline"
                    className="min-w-[160px]"
                  >
                    {updatePasswordMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Lock className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    )}
                    {t("donor.updatePassword") || "Update Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Notifications */}
          <StaggerItem>
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-4">
                <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <CardTitle className="text-lg">{t("donor.notifications") || "Notifications"}</CardTitle>
                    <CardDescription>{t("donor.notificationsDesc") || "Manage your email preferences"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex items-center justify-between py-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className={isRTL ? "text-right" : ""}>
                    <p className="font-medium">{t("donor.emailUpdates") || "Email Updates"}</p>
                    <p className="text-sm text-muted-foreground">{t("donor.emailUpdatesDesc") || "Receive updates about our programs"}</p>
                  </div>
                  <Switch
                    checked={notifications.emailUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailUpdates: checked })}
                  />
                </div>
                <Separator />
                <div className={`flex items-center justify-between py-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className={isRTL ? "text-right" : ""}>
                    <p className="font-medium">{t("donor.donationReceipts") || "Donation Receipts"}</p>
                    <p className="text-sm text-muted-foreground">{t("donor.donationReceiptsDesc") || "Get receipts for your donations"}</p>
                  </div>
                  <Switch
                    checked={notifications.donationReceipts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, donationReceipts: checked })}
                  />
                </div>
                <Separator />
                <div className={`flex items-center justify-between py-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className={isRTL ? "text-right" : ""}>
                    <p className="font-medium">{t("donor.newsletter") || "Newsletter"}</p>
                    <p className="text-sm text-muted-foreground">{t("donor.newsletterDesc") || "Monthly updates and stories"}</p>
                  </div>
                  <Switch
                    checked={notifications.newsletter}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newsletter: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </main>
  );
}
