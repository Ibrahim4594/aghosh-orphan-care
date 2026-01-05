import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  GraduationCap, 
  Utensils, 
  Shirt, 
  Home,
  BookOpen,
  Stethoscope,
  Users,
  ArrowRight
} from "lucide-react";

const programs = [
  {
    id: "orphan-care",
    title: "Orphan Care Program",
    description: "Comprehensive care for orphaned children including shelter, food, clothing, and emotional support.",
    fullDescription: "Our flagship program provides a loving home environment for orphaned and vulnerable children. Each child receives individual attention, comfortable accommodation, nutritious meals, appropriate clothing, and most importantly, the love and care of a supportive family environment.",
    icon: Home,
    features: ["24/7 Care & Supervision", "Nutritious Meals", "Safe Living Spaces", "Emotional Support"],
    category: "Core Program",
  },
  {
    id: "education",
    title: "Education & Quran Learning",
    description: "Quality education from primary to higher levels, combined with Islamic studies and Quran memorization.",
    fullDescription: "Education is the cornerstone of a child's future. We provide quality formal education while also nurturing spiritual growth through Quran learning and Islamic studies. Many of our children have become Hafiz-e-Quran and excel academically.",
    icon: GraduationCap,
    features: ["Formal Schooling", "Quran Memorization", "Tutoring Support", "Extracurricular Activities"],
    category: "Education",
  },
  {
    id: "healthcare",
    title: "Healthcare & Medical Support",
    description: "Regular health checkups, vaccinations, and medical treatments for all children.",
    fullDescription: "Health is wealth. Our on-site medical facility ensures regular health checkups, vaccinations, and prompt treatment of any illnesses. We also provide dental care, eye checkups, and mental health support.",
    icon: Stethoscope,
    features: ["Regular Checkups", "Vaccinations", "Dental Care", "Mental Health Support"],
    category: "Healthcare",
  },
  {
    id: "nutrition",
    title: "Food & Nutrition",
    description: "Balanced, nutritious meals prepared with care to ensure proper growth and development.",
    fullDescription: "Growing children need proper nutrition. Our kitchen provides three nutritious meals daily, plus snacks, prepared under hygienic conditions. Special dietary needs are accommodated, and we ensure variety in our menu.",
    icon: Utensils,
    features: ["Three Daily Meals", "Balanced Diet", "Special Diets", "Clean Water"],
    category: "Nutrition",
  },
  {
    id: "clothing",
    title: "Clothing & Daily Needs",
    description: "Quality clothing, school uniforms, and all essential daily necessities for comfortable living.",
    fullDescription: "Every child deserves to be dressed with dignity. We provide quality clothing for all seasons, school uniforms, shoes, and personal care items. Special occasion clothes for Eid and other celebrations are also provided.",
    icon: Shirt,
    features: ["Seasonal Clothing", "School Uniforms", "Personal Care Items", "Eid Gifts"],
    category: "Daily Needs",
  },
  {
    id: "spiritual",
    title: "Spiritual Development",
    description: "Islamic education, character building, and moral values to nurture well-rounded individuals.",
    fullDescription: "Beyond worldly education, we emphasize spiritual growth. Children learn Quran, Islamic history, ethics, and values. Regular prayers, Islamic events, and character-building activities help shape righteous individuals.",
    icon: BookOpen,
    features: ["Quran Classes", "Islamic Studies", "Character Building", "Prayer Guidance"],
    category: "Spiritual",
  },
];

export default function ProgramsPage() {
  return (
    <main className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Programs</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6" data-testid="text-programs-title">
            How We Serve
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our comprehensive programs address every aspect of a child's development - 
            from physical well-being to education, spiritual growth, and life skills.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <Card key={program.id} className="group" data-testid={`card-program-${program.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <Badge variant="secondary">{program.category}</Badge>
                  </div>
                  <CardTitle className="text-xl mt-4">{program.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {program.fullDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {program.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="font-normal">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Link href={`/donate?category=${program.id === 'orphan-care' ? 'general' : program.id === 'nutrition' ? 'food' : program.id === 'spiritual' ? 'education' : program.id}`}>
                    <Button variant="outline" className="gap-2" data-testid={`button-support-${program.id}`}>
                      Support This Program
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-20 bg-primary/5 rounded-lg p-8 md:p-12 text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Want to Visit Aghosh?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            We welcome visitors who wish to see our facilities and meet the children. 
            Schedule a visit to experience the warmth and love at Aghosh firsthand.
          </p>
          <Link href="/contact">
            <Button size="lg" data-testid="button-schedule-visit">
              <Heart className="w-5 h-5 mr-2" />
              Schedule a Visit
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
