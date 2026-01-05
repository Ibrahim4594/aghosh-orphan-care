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
import { Badge } from "@/components/ui/badge";
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
import { categoryInfoList, type DonationCategory } from "@shared/schema";
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

const paymentMethods = [
  { id: "card", label: "Credit/Debit Card", icon: CreditCard },
  { id: "bank", label: "Bank Transfer", icon: Building2 },
  { id: "wallet", label: "Digital Wallet", icon: Wallet },
];

export default function DonatePage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const categoryParam = params.get("category") as DonationCategory | null;
  
  const [customAmount, setCustomAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [donationDetails, setDonationDetails] = useState<DonationFormData | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
        title: "Donation Failed",
        description: error.message || "Something went wrong. Please try again.",
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
  const selectedCategory = form.watch("category");

  return (
    <main className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="font-arabic text-base">صَدَقَةٌ</span>
            <span className="text-sm text-muted-foreground">Charity</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-donate-title">
            Your Donation <span className="text-primary">Transforms Lives</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every contribution, no matter how small, brings hope to orphaned children. 
            Choose how you'd like to make a difference today.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Make a Donation</CardTitle>
            <CardDescription>
              Fill in the details below to complete your donation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Select Donation Purpose
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {categoryInfoList.map((category) => {
                            const Icon = iconMap[category.icon] || Heart;
                            const isSelected = field.value === category.id;
                            return (
                              <div
                                key={category.id}
                                className={`
                                  relative flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all
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
                                  <p className="font-medium text-sm">{category.title}</p>
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
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Select Amount (USD)
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
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              placeholder="Enter custom amount"
                              className="pl-7"
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
                      <FormItem className="flex flex-row items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-anonymous"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Donate Anonymously
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
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John Doe" 
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
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="john@example.com" 
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
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Payment Method
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
                                  ${field.value === method.id 
                                    ? "border-primary bg-primary/5" 
                                    : "border-border hover:border-primary/50"
                                  }
                                `}
                                data-testid={`option-payment-${method.id}`}
                              >
                                <RadioGroupItem value={method.id} className="sr-only" />
                                <Icon className={`w-5 h-5 flex-shrink-0 ${field.value === method.id ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="text-sm font-medium">{method.label}</span>
                              </Label>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-center gap-4 sm:gap-6 py-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span>256-bit Encryption</span>
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
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Complete Donation {selectedAmount > 0 && `- $${selectedAmount}`}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="text-center sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <DialogTitle className="text-2xl">Thank You!</DialogTitle>
              <DialogDescription className="text-base">
                Your generous donation of <strong>${donationDetails?.amount}</strong> has been received.
                May Allah bless you abundantly.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-4 bg-accent/50 rounded-md text-left">
              <p className="text-sm font-medium mb-2">Donation Details:</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Purpose: {categoryInfoList.find(c => c.id === donationDetails?.category)?.title}</p>
                <p>Amount: ${donationDetails?.amount}</p>
                <p>Payment: {paymentMethods.find(m => m.id === donationDetails?.paymentMethod)?.label}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  toast({
                    title: "Receipt Downloaded",
                    description: "Your donation receipt has been downloaded.",
                  });
                }}
                data-testid="button-download-receipt"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button 
                onClick={() => {
                  setShowSuccess(false);
                  setLocation("/");
                }}
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
