import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Loader2 } from "lucide-react";
import { ReceiptTemplate } from "@/components/receipt-template";
import { useLanguage } from "@/lib/i18n";

export default function ReceiptPage() {
  const [, params] = useRoute("/receipt/:sponsorshipId");
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchReceipt() {
      if (!params?.sponsorshipId) return;

      try {
        const response = await fetch(`/api/sponsorships/child/${params.sponsorshipId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch receipt");
        }
        const data = await response.json();
        setReceiptData(data);
      } catch (err) {
        setError("Failed to load receipt. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReceipt();
  }, [params?.sponsorshipId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !receiptData || !receiptData.localReceiptNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t("receipt.notAvailable")}</h2>
          <p className="text-muted-foreground mb-6">
            {error || t("receipt.notAvailableDesc")}
          </p>
          <a href="/sponsorship" className="text-primary hover:underline">
            {t("receipt.returnSponsorship")}
          </a>
        </div>
      </div>
    );
  }

  return <ReceiptTemplate receiptData={receiptData} />;
}
