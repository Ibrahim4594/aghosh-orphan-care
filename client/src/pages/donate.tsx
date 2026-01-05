import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CheckCircle,
  Shield,
  Lock,
  Loader2,
  Download,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Building2,
  Copy
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { type DonationCategory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const iconMap: Record<string, typeof Heart> = {
  Heart,
  GraduationCap,
  Utensils,
  Shirt,
  HandHeart,
};

const currencies = [
  { code: "pkr", symbol: "Rs", name: "Pakistani Rupee" },
  { code: "usd", symbol: "$", name: "US Dollar" },
  { code: "cad", symbol: "C$", name: "Canadian Dollar" },
  { code: "gbp", symbol: "£", name: "British Pound" },
  { code: "aed", symbol: "د.إ", name: "UAE Dirham" },
  { code: "eur", symbol: "€", name: "Euro" },
];

const donationFormSchema = z.object({
  donorName: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  amount: z.number().min(1, "Please enter a valid amount"),
  currency: z.string().default("pkr"),
  category: z.string().min(1, "Please select a donation purpose"),
  donationType: z.enum(["zakat", "sadaqah", "charity", "funds"]).default("sadaqah"),
  paymentMethod: z.enum(["card", "bank"]).default("card"),
  isAnonymous: z.boolean().default(false),
  message: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationFormSchema>;

const presetAmountsPKR = [500, 1000, 2500, 5000, 10000, 25000];
const presetAmountsOther = [25, 50, 100, 250, 500, 1000];

function DonateForm() {
  const { t, isRTL } = useLanguage();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const categoryParam = params.get("category") as DonationCategory | null;
  const sessionId = params.get("session_id");
  
  const [customAmount, setCustomAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [donationResult, setDonationResult] = useState<any>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const stripe = useStripe();
  const elements = useElements();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const { data: exchangeData } = useQuery({
    queryKey: ['/api/exchange-rates'],
  });

  const exchangeRates = exchangeData?.rates || {
    usd: 278.50,
    cad: 205.00,
    gbp: 352.00,
    aed: 75.85,
    eur: 302.00,
    pkr: 1,
  };

  const categories = [
    { id: "healthcare", icon: "Heart", titleKey: "categories.healthcare" },
    { id: "education", icon: "GraduationCap", titleKey: "categories.education" },
    { id: "food", icon: "Utensils", titleKey: "categories.food" },
    { id: "clothing", icon: "Shirt", titleKey: "categories.clothing" },
    { id: "general", icon: "HandHeart", titleKey: "categories.general" },
  ];

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      donorName: "",
      email: "",
      amount: 0,
      currency: "pkr",
      category: categoryParam || "",
      donationType: "sadaqah",
      paymentMethod: "card",
      isAnonymous: false,
      message: "",
    },
  });

  useEffect(() => {
    if (categoryParam) {
      form.setValue("category", categoryParam);
    }
  }, [categoryParam, form]);

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [sessionId]);

  const verifyPayment = async (sid: string) => {
    try {
      const response = await fetch(`/api/donate/verify/${sid}`);
      const data = await response.json();
      if (data.success) {
        setDonationResult(data);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
    }
  };

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: DonationFormData) => {
      const response = await apiRequest("POST", "/api/donate/create-payment-intent", {
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        donationType: data.donationType,
        donorName: data.donorName,
        donorEmail: data.email,
        isAnonymous: data.isAnonymous,
        message: data.message,
      });
      return response.json();
    },
  });

  const onSubmit = async (data: DonationFormData) => {
    if (data.isAnonymous) {
      data.donorName = undefined;
    }

    if (data.paymentMethod === "bank") {
      toast({
        title: t("donate.bankTransfer"),
        description: t("donate.bankNote"),
      });
      return;
    }

    if (!stripe || !elements) {
      toast({
        title: t("donate.donationFailed"),
        description: "Payment system not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      const intentData = await createPaymentIntentMutation.mutateAsync(data);
      
      if (!intentData.clientSecret) {
        throw new Error("Failed to create payment");
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: data.donorName || undefined,
            email: data.email || undefined,
          },
        },
      });

      if (error) {
        setCardError(error.message || "Payment failed");
        toast({
          title: t("donate.donationFailed"),
          description: error.message || t("donate.tryAgain"),
          variant: "destructive",
        });
      } else if (paymentIntent?.status === "succeeded") {
        const confirmResponse = await apiRequest("POST", "/api/donate/confirm-payment", {
          paymentIntentId: paymentIntent.id,
        });
        const confirmData = await confirmResponse.json();
        
        if (confirmData.success) {
          setDonationResult(confirmData);
          setShowSuccess(true);
        }
      }
    } catch (error: any) {
      toast({
        title: t("donate.donationFailed"),
        description: error.message || t("donate.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
  const selectedCurrency = form.watch("currency");
  const isAnonymous = form.watch("isAnonymous");
  const paymentMethod = form.watch("paymentMethod");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("donate.copied"),
      description: text,
    });
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || "$";
  };

  const getPkrEquivalent = (amount: number, currency: string) => {
    const rate = exchangeRates[currency.toLowerCase()] || 1;
    return Math.round(amount * rate);
  };

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
                  name="donationType"
                  render={({ field }) => (
                    <FormItem className={isRTL ? "text-right" : ""}>
                      <FormLabel className="text-base font-semibold">
                        {t("donate.donationType")}
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <Button
                            type="button"
                            variant={field.value === "zakat" ? "default" : "outline"}
                            className="h-16"
                            onClick={() => field.onChange("zakat")}
                            data-testid="button-type-zakat"
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-arabic text-base">زَكَاة</span>
                              <span className="text-xs">{t("donate.zakat")}</span>
                            </div>
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "sadaqah" ? "default" : "outline"}
                            className="h-16"
                            onClick={() => field.onChange("sadaqah")}
                            data-testid="button-type-sadaqah"
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-arabic text-base">صَدَقَة</span>
                              <span className="text-xs">{t("donate.sadaqah")}</span>
                            </div>
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "charity" ? "default" : "outline"}
                            className="h-16"
                            onClick={() => field.onChange("charity")}
                            data-testid="button-type-charity"
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-arabic text-base">خَيْرَات</span>
                              <span className="text-xs">{t("donate.charity")}</span>
                            </div>
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "funds" ? "default" : "outline"}
                            className="h-16"
                            onClick={() => field.onChange("funds")}
                            data-testid="button-type-funds"
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-arabic text-base">فَنْڈز</span>
                              <span className="text-xs">{t("donate.funds")}</span>
                            </div>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem className={isRTL ? "text-right" : ""}>
                        <FormLabel className="text-base font-semibold">
                          {t("donate.selectCurrency")}
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.symbol} {currency.name} ({currency.code.toUpperCase()})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                              {(selectedCurrency === 'pkr' ? presetAmountsPKR : presetAmountsOther).map((amount) => (
                                <Button
                                  key={amount}
                                  type="button"
                                  variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                                  className="h-11 text-sm sm:text-base"
                                  onClick={() => handleAmountSelect(amount)}
                                  data-testid={`button-amount-${amount}`}
                                >
                                  {getCurrencySymbol(selectedCurrency)}{amount}
                                </Button>
                              ))}
                            </div>
                            <div className="relative">
                              <span className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`}>
                                {getCurrencySymbol(selectedCurrency)}
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
                            {selectedAmount > 0 && selectedCurrency !== 'pkr' && (
                              <div className={`p-3 bg-secondary/10 rounded-md border border-secondary/20 ${isRTL ? "text-right" : ""}`}>
                                <p className="text-sm text-muted-foreground">
                                  {t("donate.pkrEquivalent")}:
                                </p>
                                <p className="text-lg font-semibold text-secondary">
                                  PKR {getPkrEquivalent(selectedAmount, selectedCurrency).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant={field.value === "card" ? "default" : "outline"}
                            className="h-14"
                            onClick={() => field.onChange("card")}
                            data-testid="button-payment-card"
                          >
                            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <CreditCard className="w-5 h-5" />
                              <span>{t("donate.creditDebitCard")}</span>
                            </div>
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "bank" ? "default" : "outline"}
                            className="h-14"
                            onClick={() => field.onChange("bank")}
                            data-testid="button-payment-bank"
                          >
                            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <Building2 className="w-5 h-5" />
                              <span>{t("donate.bankTransfer")}</span>
                            </div>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {paymentMethod === "card" && (
                  <div className={`space-y-3 ${isRTL ? "text-right" : ""}`}>
                    <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Label className="text-base font-semibold">{t("donate.cardDetails")}</Label>
                      <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-[8px] font-bold flex items-center justify-center">VISA</div>
                        <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-red-600 -mr-1"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        </div>
                        <div className="w-8 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded text-white text-[6px] font-bold flex items-center justify-center">AMEX</div>
                      </div>
                    </div>
                    <div className={`p-4 border-2 rounded-md bg-background transition-colors ${cardError ? 'border-destructive' : 'border-input focus-within:border-primary'}`}>
                      <CardElement 
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              color: '#1a1a1a',
                              '::placeholder': {
                                color: '#a0a0a0',
                              },
                              iconColor: '#666',
                            },
                            invalid: {
                              color: '#dc2626',
                              iconColor: '#dc2626',
                            },
                          },
                          hidePostalCode: true,
                        }}
                        onChange={(e) => {
                          if (e.error) {
                            setCardError(e.error.message);
                          } else {
                            setCardError(null);
                          }
                        }}
                      />
                    </div>
                    {cardError && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-xs">!</span>
                        {cardError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t("donate.cardSecure")}
                    </p>
                  </div>
                )}

                {paymentMethod === "bank" && (
                  <div className={`p-4 bg-accent/50 rounded-md border ${isRTL ? "text-right" : ""}`}>
                    <h4 className="font-semibold mb-3">{t("donate.bankDetails")}</h4>
                    <div className="space-y-2 text-sm">
                      <div className={`flex justify-between items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span className="text-muted-foreground">{t("donate.bankName")}:</span>
                        <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <span className="font-medium">Meezan Bank Limited</span>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard("Meezan Bank Limited")}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className={`flex justify-between items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span className="text-muted-foreground">{t("donate.accountTitle")}:</span>
                        <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <span className="font-medium">Minhaj Welfare Foundation</span>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard("Minhaj Welfare Foundation")}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className={`flex justify-between items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span className="text-muted-foreground">{t("donate.accountNumber")}:</span>
                        <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <span className="font-medium font-mono">0101-0105-3297-51</span>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard("0101-0105-3297-51")}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className={`flex justify-between items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span className="text-muted-foreground">IBAN:</span>
                        <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <span className="font-medium font-mono text-xs">PK36MEZN0101010532975100</span>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard("PK36MEZN0101010532975100")}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {t("donate.bankNote")}
                    </p>
                  </div>
                )}

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

                {selectedAmount > 0 && (
                  <div className={`p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-md border border-primary/20 ${isRTL ? "text-right" : ""}`}>
                    <p className="text-sm text-muted-foreground mb-1">{t("donate.donationSummary")}</p>
                    <div className={`flex items-baseline gap-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                      <span className="text-3xl font-bold text-primary">{getCurrencySymbol(selectedCurrency)}{selectedAmount}</span>
                      <span className="text-sm text-muted-foreground">{selectedCurrency.toUpperCase()}</span>
                    </div>
                    {selectedCurrency !== 'pkr' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        = PKR {getPkrEquivalent(selectedAmount, selectedCurrency).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <div className={`flex items-center justify-center gap-4 sm:gap-6 py-3 text-xs sm:text-sm text-muted-foreground flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Shield className="w-4 h-4 flex-shrink-0 text-green-600" />
                    <span>{t("donate.securePayment")}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Lock className="w-4 h-4 flex-shrink-0 text-green-600" />
                    <span>{t("donate.encryption")}</span>
                  </div>
                </div>

                {paymentMethod === "card" ? (
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-14 text-lg"
                    disabled={isProcessing || !stripe || selectedAmount <= 0}
                    data-testid="button-complete-donation"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className={`w-5 h-5 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("donate.processingPayment")}
                      </>
                    ) : (
                      <>
                        <Heart className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("donate.completeDonation")}
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-primary/10 rounded-md border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">{t("donate.bankInstructions")}</p>
                    <p className="font-semibold text-primary">
                      {selectedAmount > 0 && `${getCurrencySymbol(selectedCurrency)}${selectedAmount} (PKR ${getPkrEquivalent(selectedAmount, selectedCurrency).toLocaleString()})`}
                    </p>
                  </div>
                )}
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
            {donationResult && (
              <div className={`mt-4 p-4 bg-accent/50 rounded-md ${isRTL ? "text-right" : "text-left"}`}>
                <p className="text-sm font-medium mb-2">{t("donate.donationDetails")}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{t("donate.purpose")}: {donationResult.category && t(`categories.${donationResult.category}`)}</p>
                  <p>{t("donate.amount")}: {donationResult.currency} {donationResult.amount}</p>
                  <p>{t("donate.pkrEquivalent")}: PKR {donationResult.pkrEquivalent?.toLocaleString()}</p>
                  <p>{t("donate.donor")}: {donationResult.donorName}</p>
                </div>
              </div>
            )}
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

export default function DonatePage() {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  useEffect(() => {
    fetch("/api/stripe/publishable-key")
      .then((res) => res.json())
      .then((data) => {
        if (data.publishableKey) {
          setStripePromise(loadStripe(data.publishableKey));
        }
      })
      .catch((err) => console.error("Failed to load Stripe key:", err));
  }, []);

  if (!stripePromise) {
    return (
      <main className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment system...</p>
        </div>
      </main>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <DonateForm />
    </Elements>
  );
}
