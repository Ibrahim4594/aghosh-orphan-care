import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Heart, 
  GraduationCap, 
  Utensils, 
  Shirt, 
  HandHeart,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle,
  Shield,
  Lock,
  Loader2,
  Download
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { type DonationCategory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, typeof Heart> = {
  Heart,
  GraduationCap,
  Utensils,
  Shirt,
  HandHeart,
};

const donationFormSchema = z.object({
  donorName: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  amount: z.number().min(1, "Please enter a valid amount"),
  category: z.string().min(1, "Please select a donation purpose"),
  isAnonymous: z.boolean().default(false),
  paymentMethod: z.string().min(1, "Please select a payment method"),
});

type DonationFormData = z.infer<typeof donationFormSchema>;

const presetAmounts = [25, 50, 100, 250, 500, 1000];

export default function DonatePage() {
  const { t, isRTL } = useLanguage();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const categoryParam = params.get("category") as DonationCategory | null;
  
  const [customAmount, setCustomAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [donationDetails, setDonationDetails] = useState<DonationFormData | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const categories = [
    { id: "healthcare", icon: "Heart", titleKey: "categories.healthcare" },
    { id: "education", icon: "GraduationCap", titleKey: "categories.education" },
    { id: "food", icon: "Utensils", titleKey: "categories.food" },
    { id: "clothing", icon: "Shirt", titleKey: "categories.clothing" },
    { id: "general", icon: "HandHeart", titleKey: "categories.general" },
  ];

  const paymentMethods = [
    { id: "card", labelKey: "donate.creditDebitCard", icon: CreditCard },
    { id: "bank", labelKey: "donate.bankTransfer", icon: Building2 },
    { id: "wallet", labelKey: "donate.digitalWallet", icon: Wallet },
  ];

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      donorName: "",
      email: "",
      amount: 0,
      category: categoryParam || "",
      isAnonymous: false,
      paymentMethod: "",
    },
  });

  useEffect(() => {
    if (categoryParam) {
      form.setValue("category", categoryParam);
    }
  }, [categoryParam, form]);

  const donationMutation = useMutation({
    mutationFn: async (data: DonationFormData) => {
      const response = await apiRequest("POST", "/api/donations", data);
      return response;
    },
    onSuccess: (_, data) => {
      setDonationDetails(data);
      setShowSuccess(true);
      form.reset();
      setCustomAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: t("donate.donationFailed"),
        description: error.message || t("donate.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DonationFormData) => {
    if (data.isAnonymous) {
      data.donorName = undefined;
    }
    donationMutation.mutate(data);
  };

  const handleAmountSelect = (amount: number) => {
    form.setValue("amount", amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseInt(value) || 0;
    form.setValue("amount", numValue);
  };

  const selectedAmount = form.watch("amount");
  const isAnonymous = form.watch("isAnonymous");

  return (
    <main className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className={`text-center mb-12 ${isRTL ? "direction-rtl" : ""}`}>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="font-arabic text-base">صَدَقَةٌ</span>
            <span className="text-sm text-muted-foreground">{t("donate.charity")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-donate-title">
            {t("donate.title")} <span className="text-primary">{t("donate.titleHighlight")}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("donate.subtitle")}
          </p>
        </div>

        <Card>
          <CardHeader className={isRTL ? "text-right" : ""}>
            <CardTitle>{t("donate.makeADonation")}</CardTitle>
            <CardDescription>
              {t("donate.fillDetails")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className={isRTL ? "text-right" : ""}>
                      <FormLabel className="text-base font-semibold">
                        {t("donate.selectPurpose")}
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {categories.map((category) => {
                            const Icon = iconMap[category.icon] || Heart;
                            const isSelected = field.value === category.id;
                            return (
                              <div
                                key={category.id}
                                className={`
                                  relative flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all
                                  ${isRTL ? "flex-row-reverse" : ""}
                                  ${isSelected 
                                    ? "border-primary bg-primary/5" 
                                    : "border-border hover:border-primary/50"
                                  }
                                `}
                                onClick={() => field.onChange(category.id)}
                                data-testid={`option-category-${category.id}`}
                              >
                                <div className={`
                                  w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0
                                  ${isSelected ? "bg-primary text-primary-foreground" : "bg-accent"}
                                `}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{t(category.titleKey)}</p>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className={isRTL ? "text-right" : ""}>
                      <FormLabel className="text-base font-semibold">
                        {t("donate.selectAmount")}
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            {presetAmounts.map((amount) => (
                              <Button
                                key={amount}
                                type="button"
                                variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                                className="h-11 text-sm sm:text-base"
                                onClick={() => handleAmountSelect(amount)}
                                data-testid={`button-amount-${amount}`}
                              >
                                ${amount}
                              </Button>
                            ))}
                          </div>
                          <div className="relative">
                            <span className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`}>
                              $
                            </span>
                            <Input
                              type="number"
                              placeholder={t("donate.enterCustom")}
                              className={isRTL ? "pr-7" : "pl-7"}
                              value={customAmount}
                              onChange={(e) => handleCustomAmountChange(e.target.value)}
                              data-testid="input-custom-amount"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isAnonymous"
                    render={({ field }) => (
                      <FormItem className={`flex flex-row items-center gap-3 space-y-0 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-anonymous"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {t("donate.donateAnonymously")}
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {!isAnonymous && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="donorName"
                        render={({ field }) => (
                          <FormItem className={isRTL ? "text-right" : ""}>
                            <FormLabel>{t("donate.yourName")}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t("donate.yourName")} 
                                {...field} 
                                data-testid="input-donor-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className={isRTL ? "text-right" : ""}>
                            <FormLabel>{t("donate.emailAddress")}</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder={t("donate.emailAddress")} 
                                {...field} 
                                data-testid="input-donor-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className={isRTL ? "text-right" : ""}>
                      <FormLabel className="text-base font-semibold">
                        {t("donate.paymentMethod")}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-1 gap-3"
                        >
                          {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            return (
                              <Label
                                key={method.id}
                                className={`
                                  flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all
                                  ${isRTL ? "flex-row-reverse" : ""}
                                  ${field.value === method.id 
                                    ? "border-primary bg-primary/5" 
                                    : "border-border hover:border-primary/50"
                                  }
                                `}
                                data-testid={`option-payment-${method.id}`}
                              >
                                <RadioGroupItem value={method.id} className="sr-only" />
                                <Icon className={`w-5 h-5 flex-shrink-0 ${field.value === method.id ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="text-sm font-medium">{t(method.labelKey)}</span>
                              </Label>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className={`flex items-center justify-center gap-4 sm:gap-6 py-4 text-xs sm:text-sm text-muted-foreground flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    <span>{t("donate.securePayment")}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span>{t("donate.encryption")}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={donationMutation.isPending}
                  data-testid="button-complete-donation"
                >
                  {donationMutation.isPending ? (
                    <>
                      <Loader2 className={`w-5 h-5 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("donate.processing")}
                    </>
                  ) : (
                    <>
                      <Heart className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("donate.completeDonation")} {selectedAmount > 0 && `- $${selectedAmount}`}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className={`text-center sm:max-w-md ${isRTL ? "direction-rtl" : ""}`}>
            <DialogHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <DialogTitle className="text-2xl">{t("donate.thankYou")}</DialogTitle>
              <DialogDescription className="text-base">
                {t("donate.donationReceived")}
              </DialogDescription>
            </DialogHeader>
            <div className={`mt-4 p-4 bg-accent/50 rounded-md ${isRTL ? "text-right" : "text-left"}`}>
              <p className="text-sm font-medium mb-2">{t("donate.donationDetails")}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{t("donate.purpose")}: {donationDetails?.category && t(`categories.${donationDetails.category}`)}</p>
                <p>{t("donate.amount")}: ${donationDetails?.amount}</p>
                <p>{t("donate.payment")}: {donationDetails?.paymentMethod && t(`donate.${donationDetails.paymentMethod === 'card' ? 'creditDebitCard' : donationDetails.paymentMethod === 'bank' ? 'bankTransfer' : 'digitalWallet'}`)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  toast({
                    title: t("donate.downloadReceipt"),
                    description: t("donate.donationReceived"),
                  });
                }}
                data-testid="button-download-receipt"
              >
                <Download className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("donate.downloadReceipt")}
              </Button>
              <Button 
                onClick={() => {
                  setShowSuccess(false);
                  setLocation("/");
                }}
                data-testid="button-back-home"
              >
                {t("donate.backToHome")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
