import { useEffect, useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  User,
  GraduationCap,
  Calendar,
  Loader2,
  CheckCircle2,
  Building2,
  Copy,
  ArrowLeft,
  CreditCard,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FadeIn } from "@/lib/animations";
import { useLanguage } from "@/lib/i18n";
import { donorApiRequest, getDonorToken } from "@/lib/queryClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface Child {
  id: string;
  name: string;
  age: number;
  gender: string;
  grade: string | null;
  story: string | null;
  needs: string | null;
  imageUrl: string | null;
  monthlyAmount: number | null;
  isSponsored: boolean;
}

const sponsorshipSchema = z.object({
  sponsorName: z.string().min(2, "Name must be at least 2 characters"),
  sponsorEmail: z.string().email("Invalid email address"),
  sponsorPhone: z.string().optional(),
  paymentMethod: z.enum(["bank", "card"]).default("bank"),
  notes: z.string().optional(),
});

type SponsorshipFormData = z.infer<typeof sponsorshipSchema>;

function SponsorshipFormContent({ childId }: { childId: string }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: child, isLoading, error } = useQuery<Child>({
    queryKey: [`/api/children/${childId}`],
    queryFn: async () => {
      console.log("Fetching child with ID:", childId);
      try {
        const response = await fetch(`/api/children/${childId}`);
        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Error response:", errorData);
          throw new Error(`Failed to fetch child: ${response.status}`);
        }

        const data = await response.json();
        console.log("Child data:", data);
        return data;
      } catch (err) {
        console.error("Fetch error:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  const form = useForm<SponsorshipFormData>({
    resolver: zodResolver(sponsorshipSchema),
    defaultValues: {
      sponsorName: "",
      sponsorEmail: "",
      sponsorPhone: "",
      paymentMethod: "bank",
      notes: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  const onSubmit = async (data: SponsorshipFormData) => {
    if (!child) return;

    if (data.paymentMethod === "card") {
      // Handle Stripe payment
      if (!stripe || !elements) {
        toast({
          title: "Error",
          description: "Stripe is not loaded. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);

      try {
        // Create payment intent
        const amount = child.monthlyAmount || 5000;
        console.log("Creating payment intent for amount:", amount);

        const response = await fetch("/api/stripe/create-sponsorship-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId: child.id,
            amount: amount,
            sponsorName: data.sponsorName,
            sponsorEmail: data.sponsorEmail,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to create payment intent");
        }

        const { clientSecret } = await response.json();

        if (!clientSecret) {
          throw new Error("No client secret received from server");
        }

        // Confirm card payment
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Card element not found");
        }

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: data.sponsorName,
              email: data.sponsorEmail,
              phone: data.sponsorPhone,
            },
          },
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        if (paymentIntent?.status === "succeeded") {
          // Create sponsorship record with donor token if logged in
          const donorToken = getDonorToken();
          const sponsorshipResponse = donorToken
            ? await donorApiRequest("POST", "/api/sponsorships", {
              childId: child.id,
              sponsorName: data.sponsorName,
              sponsorEmail: data.sponsorEmail,
              sponsorPhone: data.sponsorPhone,
              paymentMethod: "card",
              notes: data.notes,
              stripePaymentId: paymentIntent.id,
            })
            : await fetch("/api/sponsorships", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                childId: child.id,
                sponsorName: data.sponsorName,
                sponsorEmail: data.sponsorEmail,
                sponsorPhone: data.sponsorPhone,
                paymentMethod: "card",
                notes: data.notes,
                stripePaymentId: paymentIntent.id,
              }),
            });

          if (sponsorshipResponse.ok) {
            const sponsorshipData = await sponsorshipResponse.json();

            // Update sponsorship with Stripe payment details - backend will fetch receipt URL
            if (sponsorshipData.sponsorship?.id) {
              await fetch(`/api/sponsorships/${sponsorshipData.sponsorship.id}/payment`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  stripePaymentIntentId: paymentIntent.id,
                  paymentStatus: "completed",
                }),
              });
            }
          }

          toast({
            title: "Success!",
            description: "Sponsorship created successfully!",
          });

          queryClient.invalidateQueries({ queryKey: ["/api/children"] });
          setLocation("/sponsorship");
        }
      } catch (error: any) {
        toast({
          title: "Payment Failed",
          description: error.message || "Failed to process payment",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Bank transfer - just create sponsorship record with donor token if logged in
      try {
        const donorToken = getDonorToken();
        if (donorToken) {
          await donorApiRequest("POST", "/api/sponsorships", {
            childId: child.id,
            ...data,
          });
        } else {
          await fetch("/api/sponsorships", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childId: child.id,
              ...data,
            }),
          });
        }

        toast({
          title: "Success!",
          description: "Sponsorship request submitted!",
        });

        queryClient.invalidateQueries({ queryKey: ["/api/children"] });
        setLocation(`/sponsorship-success?childId=${child.id}&method=bank`);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to submit sponsorship",
          variant: "destructive",
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/sponsorship">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sponsorship
            </Button>
          </Link>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="animate-pulse">
              <div className="h-64 bg-muted"></div>
              <CardHeader>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Failed to Load</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Could not load child information"}
          </p>
          <div className="text-xs text-left bg-muted p-3 rounded mb-4">
            <p className="font-mono">{String(error)}</p>
          </div>
          <Link href="/sponsorship">
            <Button>Return to Sponsorship</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Child not found</h2>
          <Link href="/sponsorship">
            <Button>Return to Sponsorship</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Link href="/sponsorship">
          <Button variant="ghost" className="mb-6 hover:bg-accent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sponsorship
          </Button>
        </Link>

        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Complete Your Sponsorship</h1>
          <p className="text-muted-foreground">Make a difference in a child's life today</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Child Info */}
          <div className="md:col-span-2">
            <FadeIn>
              <Card className="sticky top-8 shadow-lg border-2">
                <div className="h-72 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden relative">
                  {child.imageUrl ? (
                    <img
                      src={child.imageUrl}
                      alt={child.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{child.name}</CardTitle>
                    <Badge variant="secondary">
                      {child.gender === "male" ? "Boy" : "Girl"}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {child.age} years old
                    </span>
                    {child.grade && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {child.grade}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {child.story && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {child.story}
                    </p>
                  )}
                  {child.needs && (
                    <div className="flex flex-wrap gap-2">
                      {child.needs.split(",").map((need, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {need.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl text-center border-2 border-primary/20 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Monthly Sponsorship</p>
                    <p className="text-4xl font-bold text-primary mb-1">
                      PKR {(child.monthlyAmount || 5000).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Sponsorship Form */}
          <div className="md:col-span-3">
            <FadeIn delay={0.2}>
              <Card className="shadow-lg border-2">
                <CardHeader className="border-b bg-accent/20">
                  <CardTitle className="text-2xl">Sponsor {child.name}</CardTitle>
                  <CardDescription className="text-base">
                    Fill in your details to complete the sponsorship
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="sponsorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sponsorEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sponsorPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+92 300 1234567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bank">Bank Transfer (Monthly)</SelectItem>
                                <SelectItem value="card">Card Payment (Monthly Auto-Pay)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Bank Transfer Details */}
                      {paymentMethod === "bank" && (
                        <div className="rounded-xl border-2 bg-gradient-to-br from-accent/30 to-accent/10 p-5 space-y-3 shadow-sm">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Building2 className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold text-lg">Bank Transfer Details</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Bank Name:</span>
                              <span className="font-medium">Meezan Bank</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Account Title:</span>
                              <span className="font-medium">Aghosh Orphan Care Home</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Account Number:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">01234567890123</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={() => copyToClipboard("01234567890123")}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">IBAN:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium text-xs">PK36MEZN0001234567890123</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={() => copyToClipboard("PK36MEZN0001234567890123")}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground pt-2 border-t">
                            Transfer PKR {(child.monthlyAmount || 5000).toLocaleString()} monthly and keep your receipt.
                          </p>
                        </div>
                      )}

                      {/* Card Payment */}
                      {paymentMethod === "card" && (
                        <div className="rounded-xl border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 space-y-4 shadow-sm">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold text-lg">Card Details</h4>
                          </div>
                          <div className="p-4 bg-white dark:bg-slate-900 border-2 rounded-lg shadow-inner">
                            <CardElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: "16px",
                                    color: "#424770",
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    "::placeholder": {
                                      color: "#aab7c4",
                                    },
                                    padding: "12px",
                                  },
                                  invalid: {
                                    color: "#ef4444",
                                  },
                                },
                              }}
                            />
                          </div>
                          <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-3 border">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium flex items-center gap-2">
                                <span className="text-green-600">🔒</span>
                                <span>Secured by Stripe</span>
                              </p>
                              <p className="text-sm font-bold text-primary">
                                PKR {(child.monthlyAmount || 5000).toLocaleString()}/mo
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special message or request..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                        disabled={isProcessing || (paymentMethod === "card" && !stripe)}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <Heart className="w-6 h-6 mr-2 fill-current" />
                            {paymentMethod === "card" ? `Pay PKR ${(child.monthlyAmount || 5000).toLocaleString()} & Sponsor Now` : "Confirm Sponsorship"}
                          </>
                        )}
                      </Button>
                      {paymentMethod === "card" && (
                        <p className="text-xs text-center text-muted-foreground -mt-2">
                          You'll be charged PKR {(child.monthlyAmount || 5000).toLocaleString()} monthly
                        </p>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SponsorFormPage() {
  const [, params] = useRoute("/sponsor/:childId");
  const childId = params?.childId;

  if (!childId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Invalid sponsorship link</h2>
          <Link href="/sponsorship">
            <Button>Return to Sponsorship</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <SponsorshipFormContent childId={childId} />
    </Elements>
  );
}
