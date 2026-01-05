import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ur";

interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.programs": "Programs",
    "nav.donate": "Donate",
    "nav.impact": "Impact",
    "nav.contact": "Contact",
    "nav.donateNow": "Donate Now",
    
    // Hero
    "hero.greeting": "Peace be upon you",
    "hero.title1": "Embrace Orphaned Children with",
    "hero.love": "Love",
    "hero.care": "Care",
    "hero.description": "Aghosh by Minhaj Welfare Foundation provides shelter, Hifz-e-Quran, modern education, healthcare and turns orphans into socially productive human beings.",
    "hero.learnStory": "Learn Our Story",
    "hero.orphansSupported": "Orphans Supported",
    "hero.residentialBlocks": "Residential Blocks",
    "hero.monthlySponsorship": "Monthly Sponsorship",
    "hero.transparency": "Transparency",
    
    // About
    "about.title": "Aghosh Orphan Care Home",
    "about.subtitle": "One of the largest orphan care facilities of its nature in Pakistan, providing shelter, education, and comprehensive care to orphaned children since 2008.",
    "about.introduction": "Introduction",
    "about.aimsObjectives": "Aims & Objectives",
    "about.theProject": "The Project",
    "about.location": "Location",
    "about.residentialFacilities": "Residential Facilities",
    "about.education": "Education",
    "about.ourJourney": "Our Journey",
    "about.sponsorChild": "Sponsor a Child",
    "about.sponsorChildDesc": "per month towards an orphan.",
    "about.whatYouGet": "What you will get:",
    "about.photoOfChild": "Photo of the child",
    "about.regularUpdates": "Regular updates through education progress reports",
    "about.meetChild": "An opportunity to meet the child you have sponsored",
    "about.annualReport": "Annual report of the child",
    "about.supportUniversity": "Support them through university for continuous reward",
    "about.safetyNote": "For the safety of the child and through MWF equality policy, every child is equal - one to one contact is not allowed.",
    "about.sponsorToday": "Sponsor a Child Today",
    
    // Donate
    "donate.title": "Your Donation",
    "donate.titleHighlight": "Transforms Lives",
    "donate.subtitle": "Every contribution, no matter how small, brings hope to orphaned children. Choose how you'd like to make a difference today.",
    "donate.makeADonation": "Make a Donation",
    "donate.fillDetails": "Fill in the details below to complete your donation",
    "donate.selectPurpose": "Select Donation Purpose",
    "donate.selectAmount": "Select Amount (USD)",
    "donate.enterCustom": "Enter custom amount",
    "donate.donateAnonymously": "Donate Anonymously",
    "donate.yourName": "Your Name",
    "donate.emailAddress": "Email Address",
    "donate.paymentMethod": "Payment Method",
    "donate.securePayment": "Secure Payment",
    "donate.encryption": "256-bit Encryption",
    "donate.completeDonation": "Complete Donation",
    "donate.processing": "Processing...",
    "donate.thankYou": "Thank You!",
    "donate.donationReceived": "Your generous donation has been received. May Allah bless you abundantly.",
    "donate.donationDetails": "Donation Details:",
    "donate.purpose": "Purpose",
    "donate.amount": "Amount",
    "donate.payment": "Payment",
    "donate.downloadReceipt": "Download Receipt",
    "donate.backToHome": "Back to Home",
    
    // Contact
    "contact.title": "Contact Us",
    "contact.subtitle": "Have questions about our programs, want to volunteer, or need assistance with a donation? We're here to help.",
    "contact.address": "Address",
    "contact.phone": "Phone",
    "contact.email": "Email",
    "contact.officeHours": "Office Hours",
    "contact.sendMessage": "Send Us a Message",
    "contact.fillForm": "Fill out the form below and we'll get back to you as soon as possible.",
    "contact.yourName": "Your Name",
    "contact.subject": "Subject",
    "contact.selectSubject": "Select a subject",
    "contact.message": "Message",
    "contact.send": "Send Message",
    "contact.sending": "Sending...",
    "contact.messageSent": "Message Sent!",
    "contact.responseTime": "Thank you for reaching out. We'll respond within 24-48 hours.",
    "contact.visitUs": "Visit Aghosh Orphan Care Home",
    "contact.visitDesc": "We welcome visitors who wish to see our facilities, meet the children, and learn more about our work. Please contact us in advance to schedule a visit.",
    
    // Footer
    "footer.description": "Founded by Shaykh-ul-Islam Dr. Muhammad Tahir-ul-Qadri to provide shelter, education, and care to orphaned children, turning them into socially productive human beings.",
    "footer.quickLinks": "Quick Links",
    "footer.aboutUs": "About Us",
    "footer.ourPrograms": "Our Programs",
    "footer.makeDonation": "Make a Donation",
    "footer.ourImpact": "Our Impact",
    "footer.contactUs": "Contact Us",
    "footer.contactInfo": "Contact Info",
    "footer.stayUpdated": "Stay Updated",
    "footer.newsletter": "Subscribe to our newsletter for updates on our work and impact stories.",
    "footer.subscribe": "Subscribe",
    "footer.adminLogin": "Admin Login",
    "footer.privacyPolicy": "Privacy Policy",
    "footer.termsOfService": "Terms of Service",
    "footer.copyright": "All rights reserved.",
    
    // Common
    "common.language": "Language",
    "common.english": "English",
    "common.urdu": "اردو",
  },
  ur: {
    // Navigation
    "nav.home": "ہوم",
    "nav.about": "تعارف",
    "nav.programs": "پروگرامز",
    "nav.donate": "عطیہ",
    "nav.impact": "اثرات",
    "nav.contact": "رابطہ",
    "nav.donateNow": "ابھی عطیہ دیں",
    
    // Hero
    "hero.greeting": "السلام علیکم",
    "hero.title1": "یتیم بچوں کو گلے لگائیں",
    "hero.love": "محبت",
    "hero.care": "دیکھ بھال",
    "hero.description": "آغوش منہاج ویلفیئر فاؤنڈیشن کے تحت یتیم بچوں کو پناہ، حفظ قرآن، جدید تعلیم، صحت کی سہولیات فراہم کرتا ہے اور انہیں معاشرے کے مفید شہری بناتا ہے۔",
    "hero.learnStory": "ہماری کہانی",
    "hero.orphansSupported": "یتیم بچے",
    "hero.residentialBlocks": "رہائشی بلاکس",
    "hero.monthlySponsorship": "ماہانہ کفالت",
    "hero.transparency": "شفافیت",
    
    // About
    "about.title": "آغوش یتیم خانہ",
    "about.subtitle": "پاکستان میں اپنی نوعیت کی سب سے بڑی یتیم خانے کی سہولت، 2008 سے یتیم بچوں کو پناہ، تعلیم اور جامع دیکھ بھال فراہم کر رہی ہے۔",
    "about.introduction": "تعارف",
    "about.aimsObjectives": "مقاصد",
    "about.theProject": "پروجیکٹ",
    "about.location": "مقام",
    "about.residentialFacilities": "رہائشی سہولیات",
    "about.education": "تعلیم",
    "about.ourJourney": "ہمارا سفر",
    "about.sponsorChild": "بچے کی کفالت کریں",
    "about.sponsorChildDesc": "ماہانہ ایک یتیم کے لیے",
    "about.whatYouGet": "آپ کو کیا ملے گا:",
    "about.photoOfChild": "بچے کی تصویر",
    "about.regularUpdates": "تعلیمی پیش رفت کی رپورٹس",
    "about.meetChild": "اپنے کفالت یافتہ بچے سے ملنے کا موقع",
    "about.annualReport": "بچے کی سالانہ رپورٹ",
    "about.supportUniversity": "یونیورسٹی تک ان کی مدد کریں",
    "about.safetyNote": "بچے کی حفاظت کے لیے ون ٹو ون رابطے کی اجازت نہیں ہے۔",
    "about.sponsorToday": "آج ہی کفالت کریں",
    
    // Donate
    "donate.title": "آپ کا عطیہ",
    "donate.titleHighlight": "زندگیاں بدلتا ہے",
    "donate.subtitle": "ہر چھوٹی سے چھوٹی مدد یتیم بچوں کے لیے امید لاتی ہے۔ آج فرق پیدا کریں۔",
    "donate.makeADonation": "عطیہ کریں",
    "donate.fillDetails": "عطیہ مکمل کرنے کے لیے تفصیلات بھریں",
    "donate.selectPurpose": "عطیہ کا مقصد منتخب کریں",
    "donate.selectAmount": "رقم منتخب کریں (ڈالر)",
    "donate.enterCustom": "اپنی رقم درج کریں",
    "donate.donateAnonymously": "گمنام عطیہ کریں",
    "donate.yourName": "آپ کا نام",
    "donate.emailAddress": "ای میل ایڈریس",
    "donate.paymentMethod": "ادائیگی کا طریقہ",
    "donate.securePayment": "محفوظ ادائیگی",
    "donate.encryption": "256-bit انکرپشن",
    "donate.completeDonation": "عطیہ مکمل کریں",
    "donate.processing": "پروسیسنگ...",
    "donate.thankYou": "شکریہ!",
    "donate.donationReceived": "آپ کا عطیہ موصول ہو گیا۔ اللہ آپ کو برکت دے۔",
    "donate.donationDetails": "عطیہ کی تفصیلات:",
    "donate.purpose": "مقصد",
    "donate.amount": "رقم",
    "donate.payment": "ادائیگی",
    "donate.downloadReceipt": "رسید ڈاؤن لوڈ کریں",
    "donate.backToHome": "ہوم پر واپس",
    
    // Contact
    "contact.title": "ہم سے رابطہ کریں",
    "contact.subtitle": "کسی سوال یا مدد کے لیے ہم سے رابطہ کریں۔",
    "contact.address": "پتہ",
    "contact.phone": "فون",
    "contact.email": "ای میل",
    "contact.officeHours": "دفتری اوقات",
    "contact.sendMessage": "پیغام بھیجیں",
    "contact.fillForm": "ہم جلد جواب دیں گے۔",
    "contact.yourName": "آپ کا نام",
    "contact.subject": "موضوع",
    "contact.selectSubject": "موضوع منتخب کریں",
    "contact.message": "پیغام",
    "contact.send": "پیغام بھیجیں",
    "contact.sending": "بھیج رہے ہیں...",
    "contact.messageSent": "پیغام بھیج دیا گیا!",
    "contact.responseTime": "رابطے کا شکریہ۔ ہم 24-48 گھنٹوں میں جواب دیں گے۔",
    "contact.visitUs": "آغوش یتیم خانے کا دورہ کریں",
    "contact.visitDesc": "ہم ان زائرین کا استقبال کرتے ہیں جو ہماری سہولیات دیکھنا چاہتے ہیں۔ براہ کرم پہلے سے رابطہ کریں۔",
    
    // Footer
    "footer.description": "شیخ الاسلام ڈاکٹر محمد طاہر القادری نے یتیم بچوں کو پناہ، تعلیم اور دیکھ بھال فراہم کرنے کے لیے قائم کیا۔",
    "footer.quickLinks": "فوری لنکس",
    "footer.aboutUs": "ہمارے بارے میں",
    "footer.ourPrograms": "ہمارے پروگرامز",
    "footer.makeDonation": "عطیہ کریں",
    "footer.ourImpact": "ہمارے اثرات",
    "footer.contactUs": "رابطہ کریں",
    "footer.contactInfo": "رابطہ کی معلومات",
    "footer.stayUpdated": "اپ ڈیٹ رہیں",
    "footer.newsletter": "ہماری اپڈیٹس کے لیے سبسکرائب کریں۔",
    "footer.subscribe": "سبسکرائب",
    "footer.adminLogin": "ایڈمن لاگ ان",
    "footer.privacyPolicy": "رازداری کی پالیسی",
    "footer.termsOfService": "سروس کی شرائط",
    "footer.copyright": "جملہ حقوق محفوظ ہیں۔",
    
    // Common
    "common.language": "زبان",
    "common.english": "English",
    "common.urdu": "اردو",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("aghosh-language") as Language) || "en";
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("aghosh-language", language);
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const isRTL = language === "ur";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
