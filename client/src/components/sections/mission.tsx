import { Shield, Users, BookOpen, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    icon: Heart,
    title: "Compassion",
    description: "We treat every child with love, care, and respect, providing a nurturing environment that feels like home.",
  },
  {
    icon: Shield,
    title: "Transparency",
    description: "Every donation is accounted for. We maintain complete transparency in how funds are utilized.",
  },
  {
    icon: BookOpen,
    title: "Education",
    description: "We believe education is the key to breaking cycles of poverty and building a brighter future.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We foster a sense of belonging and family, creating strong bonds that last a lifetime.",
  },
];

export function MissionSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Mission</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6" data-testid="text-mission-title">
              Nurturing Hope, Building Futures
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Aghosh Orphan Care Home is a project of Minhaj Welfare Foundation, dedicated to 
              providing comprehensive care to orphaned and vulnerable children. We believe every 
              child deserves love, education, healthcare, and the opportunity to thrive.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our holistic approach addresses not just the immediate needs of food, shelter, and 
              clothing, but also focuses on education, spiritual growth, and emotional well-being. 
              We aim to raise confident, capable individuals who can contribute positively to society.
            </p>
            <div className="flex items-center gap-2 p-4 bg-accent/50 rounded-md">
              <span className="font-arabic text-xl">وَيُطْعِمُونَ الطَّعَامَ عَلَىٰ حُبِّهِ مِسْكِينًا وَيَتِيمًا وَأَسِيرًا</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 italic">
              "And they give food in spite of love for it to the needy, the orphan, and the captive" - Quran 76:8
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="bg-card" data-testid={`card-value-${index}`}>
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
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
