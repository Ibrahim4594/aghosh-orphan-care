import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

interface ReceiptProps {
  receiptData: {
    id: string;
    localReceiptNumber: string;
    sponsorName: string;
    sponsorEmail: string;
    sponsorPhone?: string;
    childName: string;
    childAge: number;
    childGrade?: string;
    monthlyAmount: number;
    startDate: string;
    paymentMethod: string;
    paymentStatus: string;
    stripePaymentIntentId?: string;
    stripeReceiptUrl?: string;
    createdAt: string;
  };
}

export function ReceiptTemplate({ receiptData }: ReceiptProps) {
  const [, setLocation] = useLocation();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 no-print">
          <Button onClick={() => setLocation('/sponsorship')} variant="outline">
            Back to Sponsorship
          </Button>
          <div className="flex-1"></div>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
          <Button onClick={handleDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          {receiptData.stripeReceiptUrl && (
            <Button
              variant="default"
              onClick={() => window.open(receiptData.stripeReceiptUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Stripe Receipt
            </Button>
          )}
        </div>

        {/* Receipt */}
        <Card className="p-12 bg-white shadow-lg">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">AGHOSH ORPHAN CARE HOME</h1>
            <p className="text-sm text-gray-600">Minhaj Welfare Foundation Pakistan</p>
            <p className="text-xs text-gray-500 mt-2">
              Contact: info@aghosh.org | Phone: +92 XXX XXXXXXX<br />
              Address: Karachi, Pakistan
            </p>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">TAX RECEIPT / DONATION RECEIPT</h2>
            <div className="flex justify-between items-center max-w-2xl mx-auto text-sm border-y py-3">
              <div>
                <span className="text-gray-600">Receipt No: </span>
                <span className="font-mono font-bold text-lg">{receiptData.localReceiptNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Date Issued: </span>
                <span className="font-semibold">
                  {new Date(receiptData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Donor Info */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 border-b-2 pb-2">DONOR INFORMATION</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Donor Name:</span>
                <p className="font-semibold text-base mt-1">{receiptData.sponsorName}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-semibold text-base mt-1">{receiptData.sponsorEmail}</p>
              </div>
              {receiptData.sponsorPhone && (
                <div className="col-span-2">
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-semibold text-base mt-1">{receiptData.sponsorPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sponsorship Details */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 border-b-2 pb-2">SPONSORSHIP DETAILS</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Child Name:</span>
                <p className="font-semibold text-base mt-1">{receiptData.childName}</p>
              </div>
              <div>
                <span className="text-gray-600">Age:</span>
                <p className="font-semibold text-base mt-1">{receiptData.childAge} years</p>
              </div>
              {receiptData.childGrade && (
                <div>
                  <span className="text-gray-600">Grade:</span>
                  <p className="font-semibold text-base mt-1">{receiptData.childGrade}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Sponsorship Type:</span>
                <p className="font-semibold text-base mt-1">Monthly Child Sponsorship</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Start Date:</span>
                <p className="font-semibold text-base mt-1">
                  {new Date(receiptData.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 border-b-2 pb-2">PAYMENT INFORMATION</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">
                  {receiptData.paymentMethod === 'card' ? 'Credit/Debit Card (Stripe)' : 'Bank Transfer'}
                </span>
              </div>
              {receiptData.stripePaymentIntentId && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{receiptData.stripePaymentIntentId}</span>
                  </div>
                  {receiptData.stripeReceiptUrl && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Stripe Receipt URL:</span>
                      <a
                        href={receiptData.stripeReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs break-all max-w-md text-right"
                      >
                        {receiptData.stripeReceiptUrl}
                      </a>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-semibold capitalize bg-green-100 text-green-800 px-3 py-1 rounded">
                  {receiptData.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Section */}
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 mb-8">
            <div className="flex justify-between items-center border-b-2 border-blue-400 pb-4 mb-4">
              <span className="text-lg font-semibold">MONTHLY SPONSORSHIP AMOUNT:</span>
              <span className="text-4xl font-bold text-blue-600">
                PKR {receiptData.monthlyAmount.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              This amount will be deducted monthly to support {receiptData.childName}'s education, healthcare, and daily needs.
            </p>
          </div>

          {/* Bank Details for Bank Transfer */}
          {receiptData.paymentMethod === 'bank' && (
            <div className="bg-amber-50 p-5 rounded-lg border-2 border-amber-300 mb-8">
              <p className="font-bold mb-3 text-amber-900">BANK TRANSFER INSTRUCTIONS</p>
              <div className="text-sm space-y-2">
                <p><strong>Bank Name:</strong> Meezan Bank</p>
                <p><strong>Account Title:</strong> Aghosh Orphan Care Home</p>
                <p><strong>Account Number:</strong> 01234567890123</p>
                <p><strong>IBAN:</strong> PK36MEZN0001234567890123</p>
                <p className="text-xs text-amber-900 mt-3 pt-3 border-t border-amber-300">
                  Please transfer PKR {receiptData.monthlyAmount.toLocaleString()} monthly and keep your bank receipt for records.
                </p>
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="text-center mt-12 mb-8">
            <div className="inline-block border-2 border-gray-800 px-16 py-8">
              <p className="font-bold text-sm mb-2">AUTHORIZED SIGNATURE</p>
              <div className="h-20"></div>
              <div className="border-t-2 border-gray-800 pt-3">
                <p className="text-sm font-semibold">Aghosh Orphan Care Home</p>
                <p className="text-xs text-gray-600 mt-1">Minhaj Welfare Foundation</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t-2 border-gray-800 text-center text-xs text-gray-600 space-y-3">
            <p className="font-semibold text-gray-800">Tax Information: This receipt is eligible for tax deduction under applicable laws.</p>
            <p>Aghosh Orphan Care Home is a registered charitable organization under Minhaj Welfare Foundation Pakistan.</p>
            <p className="text-sm font-semibold text-gray-800 mt-4">
              Thank you for your generous support! May Allah accept your donation.
            </p>
            <p className="text-xs mt-6 text-gray-500">
              This is a computer-generated receipt and does not require a physical signature.<br />
              For any queries, please contact us at info@aghosh.org
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
