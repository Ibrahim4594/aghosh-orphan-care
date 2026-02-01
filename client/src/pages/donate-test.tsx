import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Receipt,
  Download,
  Printer,
  CheckCircle2,
  Heart,
  Calendar,
  User,
  Mail,
  CreditCard,
  Hash,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { format } from "date-fns";
import { ScrollReveal } from "@/lib/animations";

interface DonationReceipt {
  receiptNumber: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  category: string;
  paymentMethod: string;
  date: Date;
  transactionId: string;
}

export default function DonateTestPage() {
  const { t, isRTL } = useLanguage();
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);

  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    amount: "",
    currency: "pkr",
    category: "general",
    paymentMethod: "card",
  });

  const categories = [
    { value: "general", label: "General Support" },
    { value: "education", label: "Education" },
    { value: "health", label: "Healthcare" },
    { value: "food", label: "Food & Nutrition" },
    { value: "clothing", label: "Clothing" },
  ];

  const currencies = [
    { value: "pkr", label: "PKR - Pakistani Rupee" },
    { value: "usd", label: "USD - US Dollar" },
    { value: "gbp", label: "GBP - British Pound" },
    { value: "eur", label: "EUR - Euro" },
    { value: "aed", label: "AED - UAE Dirham" },
    { value: "cad", label: "CAD - Canadian Dollar" },
  ];

  const paymentMethods = [
    { value: "card", label: "Credit/Debit Card" },
    { value: "bank", label: "Bank Transfer" },
    { value: "easypaisa", label: "Easypaisa" },
    { value: "jazzcash", label: "JazzCash" },
  ];

  const generateReceiptNumber = () => {
    const prefix = "AGH";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `${prefix}-${timestamp}-${random}`;
  };

  const generateTransactionId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "TXN";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleTestDonation = () => {
    if (!formData.donorName || !formData.donorEmail || !formData.amount) {
      alert("Please fill in all required fields");
      return;
    }

    const newReceipt: DonationReceipt = {
      receiptNumber: generateReceiptNumber(),
      donorName: formData.donorName,
      donorEmail: formData.donorEmail,
      amount: parseFloat(formData.amount),
      currency: formData.currency.toUpperCase(),
      category: categories.find(c => c.value === formData.category)?.label || "General",
      paymentMethod: paymentMethods.find(p => p.value === formData.paymentMethod)?.label || "Card",
      date: new Date(),
      transactionId: generateTransactionId(),
    };

    setReceipt(newReceipt);
    setShowReceipt(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!receipt) return;

    const receiptText = `
AGHOSH ORPHAN CARE HOME
DONATION RECEIPT
================================

Receipt Number: ${receipt.receiptNumber}
Transaction ID: ${receipt.transactionId}
Date: ${format(receipt.date, "MMMM dd, yyyy 'at' hh:mm a")}

DONOR INFORMATION
-----------------
Name: ${receipt.donorName}
Email: ${receipt.donorEmail}

DONATION DETAILS
----------------
Amount: ${receipt.currency} ${receipt.amount.toLocaleString()}
Category: ${receipt.category}
Payment Method: ${receipt.paymentMethod}

================================
Thank you for your generous donation!
Your contribution helps orphaned children
receive education, healthcare, and a loving home.

Minhaj Welfare Foundation
www.minhajwelfare.org
================================
    `;

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Donation_Receipt_${receipt.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setShowReceipt(false);
    setReceipt(null);
    setFormData({
      donorName: "",
      donorEmail: "",
      amount: "",
      currency: "pkr",
      category: "general",
      paymentMethod: "card",
    });
  };

  return (
    <main className={`min-h-screen bg-gradient-to-b from-background to-accent/20 py-8 md:py-12 ${isRTL ? "direction-rtl" : ""}`}>
      <div className="container mx-auto px-3 md:px-4 max-w-4xl pb-24 md:pb-8">
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full mb-4">
              <Receipt className="w-4 h-4" />
              <span className="text-sm font-medium">Receipt Testing</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Donation Receipt Test</h1>
            <p className="text-muted-foreground">
              Test the donation receipt generation without making a real payment
            </p>
          </div>
        </ScrollReveal>

        {!showReceipt ? (
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Test Donation Form
              </CardTitle>
              <CardDescription>
                Fill in the details below to generate a sample donation receipt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="donorName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Donor Name *
                  </Label>
                  <Input
                    id="donorName"
                    placeholder="Muhammad Ali"
                    value={formData.donorName}
                    onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donorEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address *
                  </Label>
                  <Input
                    id="donorEmail"
                    type="email"
                    placeholder="donor@example.com"
                    value={formData.donorEmail}
                    onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    Donation Amount *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="5000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Donation Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleTestDonation}
                size="lg"
                className="w-full h-12 text-lg"
              >
                <Receipt className="w-5 h-5 mr-2" />
                Generate Test Receipt
              </Button>
            </CardContent>
          </Card>
        ) : receipt && (
          <div className="space-y-6">
            {/* Success Message */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                  Test Donation Successful!
                </h2>
                <p className="text-muted-foreground">
                  Your sample receipt has been generated below
                </p>
              </CardContent>
            </Card>

            {/* Receipt Card */}
            <Card className="border-none shadow-xl print:shadow-none" id="receipt">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg print:bg-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Aghosh Orphan Care Home</CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      Minhaj Welfare Foundation
                    </CardDescription>
                  </div>
                  <Receipt className="w-12 h-12 opacity-50" />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center border-b pb-4">
                  <h3 className="text-xl font-bold">DONATION RECEIPT</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Hash className="w-4 h-4" /> Receipt Number
                    </p>
                    <p className="font-mono font-bold">{receipt.receiptNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Date
                    </p>
                    <p className="font-medium">{format(receipt.date, "MMM dd, yyyy")}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3 text-primary">Donor Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{receipt.donorName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{receipt.donorEmail}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-primary">Donation Details</h4>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-2xl font-bold text-primary">
                        {receipt.currency} {receipt.amount.toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-medium">{receipt.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment Method</p>
                        <p className="font-medium">{receipt.paymentMethod}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground text-sm">Transaction ID</p>
                      <p className="font-mono text-sm">{receipt.transactionId}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg text-center text-sm">
                  <p className="text-muted-foreground">
                    Thank you for your generous donation! Your contribution helps orphaned children
                    receive education, healthcare, and a loving home.
                  </p>
                  <p className="font-medium mt-2 text-primary">
                    May Allah bless you abundantly!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 print:hidden">
              <Button onClick={handlePrint} variant="outline" className="flex-1">
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button onClick={resetForm} className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                New Test Donation
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
