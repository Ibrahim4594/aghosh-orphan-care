import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, BookOpen, Home, Shield, Globe } from "lucide-react";

const milestones = [
  { year: "2008", title: "Foundation Established", description: "Aghosh Orphan Care Home was founded under Minhaj Welfare Foundation." },
  { year: "2010", title: "First Education Program", description: "Launched comprehensive education program with Quran learning." },
  { year: "2015", title: "Healthcare Initiative", description: "Established on-site medical facility for regular health checkups." },
  { year: "2018", title: "Expansion", description: "Opened new facilities to accommodate more children in need." },
  { year: "2023", title: "500+ Children", description: "Reached milestone of supporting over 500 children." },
];

const team = [
  { name: "Dr. Muhammad Tahir", role: "Director", icon: Users },
  { name: "Sister Amina", role: "Care Coordinator", icon: Heart },
  { name: "Ustaz Ahmad", role: "Education Head", icon: BookOpen },
  { name: "Dr. Fatima Khan", role: "Medical Officer", icon: Shield },
];

export default function AboutPage() {
  return (
    <main className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">About Us</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6" data-testid="text-about-title">
            Our Story
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            For over 15 years, Aghosh Orphan Care Home has been a beacon of hope for orphaned 
            and vulnerable children, providing them with love, education, and the tools they 
            need to build a brighter future.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Aghosh, meaning "embrace" in Urdu, truly reflects our mission - to embrace 
              orphaned children with love, care, and support. As a project of Minhaj Welfare 
              Foundation, we operate under strict Islamic principles of charity, transparency, 
              and service to humanity.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our approach is holistic. We don't just provide food and shelter - we nurture 
              the complete development of each child. From quality education and healthcare 
              to spiritual guidance and emotional support, we ensure every child has the 
              opportunity to reach their full potential.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every child at Aghosh is treated as a member of our family. We celebrate their 
              achievements, support them through challenges, and prepare them for a successful, 
              independent life.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Home, title: "Safe Home", desc: "Comfortable living spaces designed for children" },
              { icon: BookOpen, title: "Quality Education", desc: "Academic excellence and Quran learning" },
              { icon: Heart, title: "Healthcare", desc: "Regular medical checkups and treatments" },
              { icon: Globe, title: "Life Skills", desc: "Preparing children for independent living" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} data-testid={`card-about-${index}`}>
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border hidden md:block" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`flex flex-col md:flex-row gap-4 md:gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  data-testid={`milestone-${index}`}
                >
                  <div className="flex-1 md:text-right">
                    {index % 2 === 0 && (
                      <Card>
                        <CardContent className="p-6">
                          <span className="text-primary font-bold text-lg">{milestone.year}</span>
                          <h3 className="font-semibold mt-1">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <div className="hidden md:flex items-center justify-center w-4 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-background" />
                  </div>
                  <div className="flex-1">
                    {index % 2 !== 0 && (
                      <Card>
                        <CardContent className="p-6">
                          <span className="text-primary font-bold text-lg">{milestone.year}</span>
                          <h3 className="font-semibold mt-1">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    )}
                    {index % 2 === 0 && (
                      <Card className="md:hidden">
                        <CardContent className="p-6">
                          <span className="text-primary font-bold text-lg">{milestone.year}</span>
                          <h3 className="font-semibold mt-1">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-center mb-12">Our Leadership</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => {
              const Icon = member.icon;
              return (
                <Card key={index} className="text-center" data-testid={`card-team-${index}`}>
                  <CardContent className="p-6">
                    <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
