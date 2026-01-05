import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, BookOpen, Home, Shield, Globe, Utensils, GraduationCap } from "lucide-react";
import aghoshLogo from "@assets/Aghosh-Karachi-Minhaj-Welfare-Foundation-Pakistan_05_1767633857577.jpg";

const milestones = [
  { year: "2008", title: "Foundation Established", description: "Aghosh Orphan Care Home was founded under Minhaj Welfare Foundation by Shaykh-ul-Islam Dr. Muhammad Tahir-ul-Qadri." },
  { year: "2008", title: "Construction Begins", description: "Construction of a permanent purpose-built campus for orphans started in November 2008." },
  { year: "2010", title: "First Education Program", description: "Launched comprehensive education program combining modern schooling with Hifz-e-Quran." },
  { year: "2015", title: "Healthcare Initiative", description: "Established Trauma Center with qualified doctors for complete medical treatment." },
  { year: "2020", title: "Aghosh Karachi", description: "Expanded operations with new Aghosh facility in Karachi to serve more children." },
  { year: "2024", title: "500+ Children", description: "Reached milestone of supporting over 500 children with quality education and care." },
];

const facilities = [
  { icon: Home, title: "Residential Facilities", desc: "Individual beds, study tables, chairs, computers, and cupboards for each child" },
  { icon: BookOpen, title: "Quality Education", desc: "Minhaj Model School providing modern education in English, Urdu, Arabic, and Science" },
  { icon: GraduationCap, title: "Hifz-e-Quran", desc: "Dedicated Tehfeez-ul-Quran program for Quran memorization" },
  { icon: Shield, title: "Healthcare", desc: "Trauma Center with certified doctors for complete medical treatment" },
  { icon: Utensils, title: "Balanced Diet", desc: "Nutritious meals including fruit, milk, and balanced food for proper growth" },
  { icon: Globe, title: "Recreation", desc: "Regular trips to recreational spots, museums, and participation in sports" },
];

export default function AboutPage() {
  return (
    <main className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">About Us</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6" data-testid="text-about-title">
            Aghosh Orphan Care Home
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            One of the largest orphan care facilities of its nature in Pakistan, providing shelter, 
            education, and comprehensive care to orphaned children since 2008.
          </p>
        </div>

        <div className="flex justify-center mb-16">
          <img 
            src={aghoshLogo} 
            alt="Aghosh Orphan Care Home Logo" 
            className="h-40 w-auto object-contain"
            data-testid="img-about-logo"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Foundation</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Shaykh-ul-Islam Dr. Muhammad Tahir-ul-Qadri</strong> founded the Minhaj Welfare Foundation (MWF) 
              to provide every possible help and assistance to the deprived and destitute classes of society. 
              The main purpose is to promote feelings of sympathy among people, create an environment conducive 
              to foster mutual love, brotherhood, and fraternity, and strive for a real Islamic Welfare Society.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Aghosh</strong>, meaning "embrace" in Urdu, truly reflects our mission - to embrace 
              orphaned children with love, care, and support. The objectives of Aghosh are to provide shelter 
              and good education to orphans, ensure their safe future, and turn them into socially productive 
              human beings.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The Aghosh complex near Jamia-al-Minhaj on Shah Jillani Road, Township Lahore, has four stories 
              with a basement and a total constructed area of 15,32,65 SFT. The whole project is divided into 
              34 blocks, and each block consists of 50 units.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {facilities.slice(0, 4).map((item, index) => {
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
          <h2 className="text-2xl font-bold text-center mb-4">Our Facilities</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Residential facilities of the highest standards are available for children. Every child has 
            individual resources for their comfort, education, and personal development.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} data-testid={`card-facility-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
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

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Sponsor a Child</h2>
            <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
              Donate <strong>Rs. 6,500</strong> per month towards an orphan. You will receive a photo of the child, 
              regular updates through education progress reports, an opportunity to meet the child you have sponsored, 
              and annual reports. Support them through university for a continuous reward for you and your family.
            </p>
            <p className="text-sm text-muted-foreground italic">
              For the safety of the child and through MWF equality policy, every child is equal - 
              one to one contact is not allowed.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
