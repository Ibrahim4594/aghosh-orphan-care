import { Link } from "wouter";
import { Heart, GraduationCap, Utensils, Shirt, HandHeart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categoryInfoList, type CategoryInfo } from "@shared/schema";

const iconMap: Record<string, typeof Heart> = {
  Heart,
  GraduationCap,
  Utensils,
  Shirt,
  HandHeart,
};

function DonationCard({ category }: { category: CategoryInfo }) {
  const Icon = iconMap[category.icon] || Heart;
  
  return (
    <Card className="group hover-elevate transition-all duration-300" data-testid={`card-category-${category.id}`}>
      <CardHeader className="pb-4">
        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{category.title}</CardTitle>
        <CardDescription className="leading-relaxed">
          {category.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Link href={`/donate?category=${category.id}`}>
          <Button variant="outline" className="w-full" data-testid={`button-donate-${category.id}`}>
            Donate Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function DonationCategoriesSection() {
  return (
    <section className="py-16 md:py-24 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-categories-title">
            Ways to Support
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose how you'd like to make a difference in the lives of orphaned children. 
            Every donation, big or small, brings hope and transforms lives.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryInfoList.map((category) => (
            <DonationCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
