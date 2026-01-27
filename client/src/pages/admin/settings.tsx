import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Building, Mail, Phone, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [settings, setSettings] = useState({
    siteName: "Aghosh Orphan Care Home",
    contactEmail: "aghosh.karachi@minhaj.org",
    contactPhone: "+92 21 34836947",
    address: "Gulshan-e-Iqbal, Karachi",
    enableDonations: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    toast({
      title: t("admin.settingsSaved"),
      description: t("admin.settingsSavedDesc"),
    });
  };

  return (
    <main className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ${isRTL ? "direction-rtl" : ""}`}>
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t("admin.settingsTitle")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("admin.manageConfig")}</p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                {t("admin.orgDetails")}
              </CardTitle>
              <CardDescription>{t("admin.orgDetailsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">{t("admin.orgName")}</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("admin.address")}</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {t("admin.contactInfo")}
              </CardTitle>
              <CardDescription>{t("admin.contactInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">{t("admin.contactEmail")}</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">{t("admin.contactPhone")}</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t("admin.siteSettings")}
              </CardTitle>
              <CardDescription>{t("admin.siteSettingsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("admin.enableDonations")}</Label>
                  <p className="text-sm text-muted-foreground">{t("admin.enableDonationsDesc")}</p>
                </div>
                <Switch
                  checked={settings.enableDonations}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableDonations: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("admin.maintenanceMode")}</Label>
                  <p className="text-sm text-muted-foreground">{t("admin.maintenanceModeDesc")}</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleSave}>
            <Save className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            {t("admin.saveSettings")}
          </Button>
        </div>
      </div>
    </main>
  );
}
