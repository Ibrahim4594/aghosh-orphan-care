import { Shield, Users, BookOpen, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";

export function MissionSection() {
  const { t, isRTL } = useLanguage();

  const values = [
    {
      icon: Heart,
      titleKey: "mission.compassion",
      descKey: "mission.compassionDesc",
    },
    {
      icon: Shield,
      titleKey: "mission.transparency",
      descKey: "mission.transparencyDesc",
    },
    {
      icon: BookOpen,
      titleKey: "mission.education",
      descKey: "mission.educationDesc",
    },
    {
      icon: Users,
      titleKey: "mission.community",
      descKey: "mission.communityDesc",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isRTL ? "direction-rtl" : ""}`}>
          <div className={isRTL ? "text-right" : ""}>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{t("mission.label")}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6" data-testid="text-mission-title">
              {t("mission.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t("mission.desc1")}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t("mission.desc2")}
            </p>
            <div className="flex items-center gap-2 p-4 bg-accent/50 rounded-md">
              <span className="font-arabic text-xl">وَيُطْعِمُونَ الطَّعَامَ عَلَىٰ حُبِّهِ مِسْكِينًا وَيَتِيمًا وَأَسِيرًا</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 italic">
              "{t("mission.quranVerse")}" - {t("mission.quranRef")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="bg-card" data-testid={`card-value-${index}`}>
                  <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
                    <div className={`w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 ${isRTL ? "mr-auto" : ""}`}>
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{t(value.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(value.descKey)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
