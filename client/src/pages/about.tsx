import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, BookOpen, Home, Shield, Globe, Utensils, GraduationCap, Laptop, Bed } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import aghoshLogo from "@assets/Aghosh-Karachi-Minhaj-Welfare-Foundation-Pakistan_05_1767633857577.jpg";

const milestones = [
  { year: "2008", title: "Foundation Announced", description: "Aghosh Orphan Care Home announced under Minhaj Welfare Foundation by Shaykh-ul-Islam Dr. Muhammad Tahir-ul-Qadri on 15th July 2008." },
  { year: "2008", title: "Construction Begins", description: "Construction of permanent purpose-built campus for orphans started in November 2008." },
  { year: "2010", title: "Education Programs Launch", description: "Launched Hifz-e-Quran program and Minhaj Model School for comprehensive education." },
  { year: "2015", title: "Trauma Center Established", description: "Medical Trauma Center established with qualified doctors for complete healthcare." },
  { year: "2020", title: "Aghosh Karachi Opens", description: "Expanded operations with new Aghosh facility in Karachi to serve more children." },
  { year: "2024", title: "500+ Children Supported", description: "Reached milestone of supporting over 500 orphans with quality education and care." },
];

const facilities = [
  { icon: Bed, title: "Individual Beds", desc: "Every child has their own comfortable bed for restful sleep" },
  { icon: Laptop, title: "Personal Computer", desc: "Each child has access to a computer for modern education" },
  { icon: BookOpen, title: "Study Table & Chair", desc: "Dedicated study space with personal table and chair" },
  { icon: Home, title: "Personal Cupboard", desc: "Individual storage space for clothes and belongings" },
  { icon: GraduationCap, title: "Hifz-e-Quran", desc: "Tehfeez-ul-Quran program for Holy Quran memorization" },
  { icon: Shield, title: "Trauma Center", desc: "Medical facility with qualified doctors for complete treatment" },
];

const educationPrograms = [
  { title: "Hifz-e-Quran", desc: "After primary education, children are admitted to Tehfeez-ul-Quran Institution to memorize the Holy Quran." },
  { title: "Minhaj Model School", desc: "Modern contemporary education in English, Urdu, Arabic and Scientific subjects according to prevalent syllabus." },
  { title: "Extra Coaching", desc: "Able tutors provide individual attention for educational and psychological problems." },
];

export default function AboutPage() {
  return (
    <main className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">About Us</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2 mb-6" data-testid="text-about-title">
            Aghosh Orphan Care Home
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            One of the largest orphan care facilities of its nature in Pakistan, providing shelter, 
            education, and comprehensive care to orphaned children since 2008.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <img 
            src={aghoshLogo} 
            alt="Aghosh Orphan Care Home Logo" 
            className="h-32 sm:h-40 w-auto object-contain"
            data-testid="img-about-logo"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Shaykh-ul-Islam Dr. Muhammad Tahir-ul-Qadri</strong> founded the Minhaj Welfare Foundation (MWF) 
              to provide every possible help and assistance to the deprived and destitute classes of society.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The main purpose is to promote feelings of sympathy among people, create an environment conducive 
              to foster mutual love, brotherhood and fraternity, and strive for a real Islamic Welfare Society, 
              taking all sections of society along.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              To achieve this purpose, MWF has embarked on projects in the fields of education, health and public welfare. 
              It is through these fields of welfare work that the sacred task of serving humanity is being accomplished.
            </p>
          </div>
          
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Aims & Objectives</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The objectives of Aghosh are to provide shelter and good education to orphans, 
              ensure their safe future and to turn them into socially productive human beings.
            </p>
            
            <h2 className="text-xl sm:text-2xl font-bold mb-4 mt-6">The Project</h2>
            <p className="text-muted-foreground leading-relaxed">
              In November 2008, construction of a permanent purpose-built campus for orphans started. 
              The Aghosh complex has <strong>four stories with a basement</strong> and a total constructed area of <strong>15,32,65 SFT</strong>. 
              The whole project is divided into <strong>34 blocks</strong> and each block consists of <strong>50 units</strong>. 
              Aghosh complex is one of the largest of its nature in Pakistan for orphans.
            </p>
          </div>
        </div>

        <Card className="mb-16 bg-secondary/10 border-secondary/20">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <Globe className="w-8 h-8 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <p className="text-muted-foreground">
                  Aghosh is situated near <strong>Jamia-al-Minhaj</strong> on <strong>Shah Jillani Road, Township Lahore</strong>, Pakistan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-4">Residential Facilities</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Residential facilities of the highest standards are available for children. 
            Every child has individual resources for their comfort and education.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {facilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} data-testid={`card-facility-${index}`}>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base mb-1">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Education</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
            The educational activities of the institution are of great importance. All children are imparted 
            Hifz-e-Quran and school education according to their capacity and temperament. MWF ensures quality 
            education to <strong>500 orphans</strong> along with a quality lifestyle.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {educationPrograms.map((program, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-primary">{program.title}</h3>
                  <p className="text-sm text-muted-foreground">{program.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Utensils className="w-8 h-8 text-secondary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Food & Nutrition</h3>
                  <p className="text-sm text-muted-foreground">
                    Provision of sufficient and balanced diet is a basic priority. The menu ensures children get 
                    sufficient energy for day-long activities. <strong>Fruit, milk, ice cream, juice and biscuits</strong> are 
                    part of their diet plan. New dresses are made according to seasonal demands and religious occasions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Heart className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Recreational Activities</h3>
                  <p className="text-sm text-muted-foreground">
                    Children are taken to <strong>Sky Land, Joy Land</strong> and other recreational spots monthly. 
                    They visit museums, Wagha border and historic places. Daily games between Asar and Maghrib 
                    prayers and weekly sports competitions keep them fit. They participate in spiritual gatherings 
                    of Minhaj-ul-Quran International.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Journey</h2>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <Card key={index} data-testid={`milestone-${index}`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 sm:w-20 flex-shrink-0">
                      <span className="text-primary font-bold text-lg">{milestone.year}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 sm:p-8 text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Sponsor a Child</h2>
            <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
              Donate <strong className="text-primary text-lg">Rs. 6,500</strong> per month towards an orphan.
            </p>
            <div className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto space-y-2">
              <p>What you will get:</p>
              <ul className="list-disc list-inside text-left">
                <li>Photo of the child</li>
                <li>Regular updates through education progress reports</li>
                <li>An opportunity to meet the child you have sponsored</li>
                <li>Annual report of the child</li>
                <li>Support them through university for continuous reward</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground italic mb-6">
              For the safety of the child and through MWF equality policy, every child is equal - 
              one to one contact is not allowed.
            </p>
            <Link href="/donate">
              <Button size="lg" data-testid="button-sponsor-child">
                <Heart className="w-5 h-5 mr-2" />
                Sponsor a Child Today
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
