import { Heart, GraduationCap, Utensils, Stethoscope } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { ScrollReveal, StaggerContainer, StaggerItem, ScaleIn } from "@/lib/animations";
import type { Statistics } from "@shared/schema";

interface StatisticsBarProps {
  statistics?: Statistics;
}

const defaultStats: Statistics = {
  totalDonations: 125000,
  childrenSupported: 527,
  mealsProvided: 52400,
  studentsEducated: 312,
  medicalTreatments: 1850,
};

export function StatisticsBar({ statistics = defaultStats }: StatisticsBarProps) {
  const { t, isRTL } = useLanguage();

  const stats = [
    {
      icon: Heart,
      value: statistics.childrenSupported,
      labelKey: "stats.childrenSupported",
      suffix: "+",
    },
    {
      icon: Utensils,
      value: statistics.mealsProvided,
      labelKey: "stats.mealsProvided",
      suffix: "+",
    },
    {
      icon: GraduationCap,
      value: statistics.studentsEducated,
      labelKey: "stats.studentsEducated",
      suffix: "+",
    },
    {
      icon: Stethoscope,
      value: statistics.medicalTreatments,
      labelKey: "stats.medicalTreatments",
      suffix: "+",
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  return (
    <section className="py-16 md:py-20 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4">
        <StaggerContainer staggerDelay={0.15} className={`grid grid-cols-2 lg:grid-cols-4 gap-8 ${isRTL ? "direction-rtl" : ""}`}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={index}>
                <div
                  className="text-center"
                  data-testid={`stat-bar-${index}`}
                >
                  <ScaleIn delay={index * 0.1}>
                    <div className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7" />
                    </div>
                  </ScaleIn>
                  <p className="text-3xl md:text-4xl font-bold mb-2">
                    {formatNumber(stat.value)}{stat.suffix}
                  </p>
                  <p className="text-sm md:text-base opacity-90">{t(stat.labelKey)}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
