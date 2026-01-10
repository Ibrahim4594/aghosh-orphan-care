import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { ImpactStory } from "@shared/schema";

interface ImpactStoriesProps {
  stories?: ImpactStory[];
}

const defaultStoriesEn: ImpactStory[] = [
  {
    id: "1",
    title: "A New Beginning for Ahmed",
    content: "Ahmed came to Aghosh at age 6 after losing both parents. Today, he excels in his studies and dreams of becoming a doctor to help others. With your support, Ahmed received proper nutrition, quality education, and the love of a caring family. He is now one of the top students in his class and participates actively in sports and Quran recitation competitions.",
    childName: "Ahmed",
    childAge: 12,
    imageUrl: null,
    isPublished: true,
    createdAt: new Date(),
  },
  {
    id: "2", 
    title: "Fatima's Journey to Success",
    content: "Fatima arrived at the orphanage malnourished and withdrawn. Through dedicated care, nutritious meals, and education, she has blossomed into a confident young girl who loves to help others. She now teaches younger children how to read and dreams of becoming a teacher herself.",
    childName: "Fatima",
    childAge: 10,
    imageUrl: null,
    isPublished: true,
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Ibrahim Finds His Voice",
    content: "When Ibrahim first came to us, he barely spoke. Through patient care, counseling, and the support of his new family at Aghosh, he has become an outgoing child who loves to recite the Quran. His beautiful voice now leads the morning prayers.",
    childName: "Ibrahim",
    childAge: 8,
    imageUrl: null,
    isPublished: true,
    createdAt: new Date(),
  },
];

const defaultStoriesUr: ImpactStory[] = [
  {
    id: "1",
    title: "احمد کے لیے ایک نئی شروعات",
    content: "احمد 6 سال کی عمر میں والدین کے انتقال کے بعد آغوش آیا۔ آج وہ اپنی تعلیم میں بہترین ہے اور ڈاکٹر بننے کا خواب رکھتا ہے۔ آپ کی مدد سے احمد کو مناسب غذائیت، معیاری تعلیم اور پیار ملا۔ وہ اب اپنی کلاس کے بہترین طلباء میں سے ایک ہے۔",
    childName: "احمد",
    childAge: 12,
    imageUrl: null,
    isPublished: true,
    createdAt: new Date(),
  },
  {
    id: "2", 
    title: "فاطمہ کا کامیابی کا سفر",
    content: "فاطمہ یتیم خانے میں کمزور اور خاموش آئی۔ وقف دیکھ بھال، غذائیت سے بھرپور کھانے اور تعلیم کے ذریعے وہ ایک پر اعتماد لڑکی بن گئی ہے جو دوسروں کی مدد کرنا پسند کرتی ہے۔ وہ اب چھوٹے بچوں کو پڑھنا سکھاتی ہے۔",
    childName: "فاطمہ",
    childAge: 10,
    imageUrl: null,
    isPublished: true,
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "ابراہیم نے اپنی آواز پائی",
    content: "جب ابراہیم پہلی بار ہمارے پاس آیا تو وہ بمشکل بولتا تھا۔ صبر سے دیکھ بھال اور مشاورت کے ذریعے وہ ایک ملنسار بچہ بن گیا ہے جو قرآن پڑھنا پسند کرتا ہے۔ اس کی خوبصورت آواز اب صبح کی نمازوں کی امامت کرتی ہے۔",
    childName: "ابراہیم",
    childAge: 8,
    imageUrl: null,
    isPublished: true,
    createdAt: new Date(),
  },
];

export function ImpactStoriesSection({ stories }: ImpactStoriesProps) {
  const { t, isRTL, language } = useLanguage();
  const [selectedStory, setSelectedStory] = useState<ImpactStory | null>(null);
  
  // Always use language-specific local stories for proper translation
  const displayStories = language === "ur" ? defaultStoriesUr : (stories || defaultStoriesEn);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`text-center mb-12 ${isRTL ? "direction-rtl" : ""}`}>
          <span className="text-sm font-medium text-primary uppercase tracking-wider">{t("impact.label")}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4" data-testid="text-stories-title">
            {t("stories.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("stories.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayStories.map((story) => (
            <Card
              key={story.id}
              className="group elevated-card transition-all duration-300 overflow-visible"
              data-testid={`card-story-${story.id}`}
            >
              <div className="aspect-[4/3] bg-accent/50 flex items-center justify-center rounded-t-md">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
              </div>
              <CardContent className={`p-6 ${isRTL ? "text-right" : ""}`}>
                <div className={`flex items-center gap-2 mb-3 ${isRTL ? "justify-end" : ""}`}>
                  {story.childName && (
                    <Badge variant="secondary" className="text-xs">
                      {story.childName}, {story.childAge} {t("stories.years")}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {story.content}
                </p>
                <Button 
                  variant="ghost" 
                  className="mt-4 p-0 h-auto text-primary"
                  onClick={() => setSelectedStory(story)}
                  data-testid={`button-read-story-${story.id}`}
                >
                  {t("stories.readFull")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
          <DialogContent className={`max-w-2xl ${isRTL ? "direction-rtl text-right" : ""}`}>
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedStory?.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {selectedStory?.childName && (
                <Badge variant="secondary" className="mb-4">
                  {selectedStory.childName}, {selectedStory.childAge} {t("stories.yearsOld")}
                </Badge>
              )}
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {selectedStory?.content}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
