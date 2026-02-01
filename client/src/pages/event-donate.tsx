import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, CheckCircle, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  location: string;
  imageUrl: string | null;
  eventType: string;
  isActive: boolean;
  createdAt: string;
}

function EventDonateForm({ event }: { event: Event }) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, donor, isLoading } = useAuth();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  const [attendanceStatus, setAttendanceStatus] = useState<"attending" | "not_attending" | "maybe">("attending");
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t("eventDonate.loginRequired"),
        description: t("eventDonate.loginDesc"),
        variant: "destructive",
      });
      setLocation("/donor/login");
    }
  }, [isAuthenticated, isLoading, setLocation, toast, t]);

  const createEventDonation = useMutation({
    mutationFn: async (data: {
      eventId: string;
      donorName: string;
      donorEmail: string;
      amount: number;
      paymentMethod: string;
      attendanceStatus: string;
      stripePaymentIntentId?: string;
    }) => {
      const response = await fetch("/api/event-donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(t("eventDonate.failedCreate"));
      return response.json();
    },
  });

  const handleRSVP = async () => {
    if (!donor) return;

    setIsProcessing(true);

    try {
      const result = await createEventDonation.mutateAsync({
        eventId: event.id,
        donorName: donor.fullName,
        donorEmail: donor.email,
        amount: 0, // No donation, just RSVP
        paymentMethod: "rsvp",
        attendanceStatus,
      });

      const statusMessages = {
        attending: t("eventDonate.attendingMessage"),
        maybe: t("eventDonate.maybeMessage"),
        not_attending: t("eventDonate.notAttendingMessage"),
      };

      toast({
        title: t("eventDonate.rsvpConfirmed"),
        description: statusMessages[attendanceStatus],
      });

      // Redirect to donor dashboard
      setLocation("/donor/dashboard");
    } catch (error) {
      toast({
        title: t("eventDonate.error"),
        description: t("eventDonate.rsvpError"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRSVP();
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      general: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      fundraiser: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      volunteer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      religious: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    };
    return colors[type] || colors.general;
  };

  if (isLoading || !isAuthenticated || !donor) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getEventTypeColor(event.eventType)}>
              {event.eventType}
            </Badge>
          </div>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>{format(new Date(event.date), "h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{event.location}</span>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("eventDonate.attendQuestion")}</CardTitle>
          <CardDescription>{t("eventDonate.attendDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={attendanceStatus} onValueChange={(val: any) => setAttendanceStatus(val)}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer`}>
              <RadioGroupItem value="attending" id="attending" />
              <Label htmlFor="attending" className="flex items-center gap-2 cursor-pointer font-normal w-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-semibold">{t("eventDonate.attending")}</div>
                  <div className="text-sm text-muted-foreground">{t("eventDonate.attendingSubtitle")}</div>
                </div>
              </Label>
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer`}>
              <RadioGroupItem value="maybe" id="maybe" />
              <Label htmlFor="maybe" className="flex items-center gap-2 cursor-pointer font-normal w-full">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="font-semibold">{t("eventDonate.maybe")}</div>
                  <div className="text-sm text-muted-foreground">{t("eventDonate.maybeSubtitle")}</div>
                </div>
              </Label>
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer`}>
              <RadioGroupItem value="not_attending" id="not_attending" />
              <Label htmlFor="not_attending" className="flex items-center gap-2 cursor-pointer font-normal w-full">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-semibold">{t("eventDonate.notAttending")}</div>
                  <div className="text-sm text-muted-foreground">{t("eventDonate.notAttendingSubtitle")}</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            {t("eventDonate.submitting")}
          </>
        ) : (
          <>
            <CheckCircle className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t("eventDonate.confirmRsvp")}
          </>
        )}
      </Button>
    </form>
  );
}

export default function EventDonatePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error(t("eventDonate.failedFetch"));
      return response.json();
    },
    enabled: !!eventId,
  });


  if (eventLoading) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">{t("eventDonate.notFound")}</h1>
          <Button onClick={() => setLocation("/events")}>{t("eventDonate.backToEvents")}</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setLocation("/events")}>
            ← {t("eventDonate.backToEvents")}
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">{t("eventDonate.supportTitle")}</h1>

        <EventDonateForm event={event} />
      </div>
    </main>
  );
}
