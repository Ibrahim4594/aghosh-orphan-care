import { Heart, GraduationCap, Utensils, Stethoscope } from "lucide-react";
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
  const stats = [
    {
      icon: Heart,
      value: statistics.childrenSupported,
      label: "Children Supported",
      suffix: "+",
    },
    {
      icon: Utensils,
      value: statistics.mealsProvided,
      label: "Meals Provided",
      suffix: "+",
    },
    {
      icon: GraduationCap,
      value: statistics.studentsEducated,
      label: "Students Educated",
      suffix: "+",
    },
    {
      icon: Stethoscope,
      value: statistics.medicalTreatments,
      label: "Medical Treatments",
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="text-center"
                data-testid={`stat-bar-${index}`}
              >
                <div className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7" />
                </div>
                <p className="text-3xl md:text-4xl font-bold mb-2">
                  {formatNumber(stat.value)}{stat.suffix}
                </p>
                <p className="text-sm md:text-base opacity-90">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
