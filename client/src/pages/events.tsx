import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, CalendarDays, Users, Heart } from "lucide-react";
import { format, isPast, isFuture, isToday } from "date-fns";
import { ScrollReveal, StaggerContainer, StaggerItem, HoverLift } from "@/lib/animations";
import { CardSkeleton } from "@/components/ui/skeletons";
import { useLanguage } from "@/lib/i18n";
import { Link } from "wouter";

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

export default function EventsPage() {
  const { t, isRTL } = useLanguage();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      general: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      fundraiser: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      volunteer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      religious: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    };
    return colors[type] || colors.general;
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      general: t("events.typeGeneral") || "General Event",
      fundraiser: t("events.typeFundraiser") || "Fundraiser",
      volunteer: t("events.typeVolunteer") || "Volunteer Event",
      religious: t("events.typeReligious") || "Religious Event",
    };
    return labels[type] || t("events.typeGeneral") || "Event";
  };

  const getEventStatus = (date: string) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) return { label: t("events.today") || "Today", color: "bg-green-500" };
    if (isPast(eventDate)) return { label: t("events.past") || "Past", color: "bg-gray-500" };
    return { label: t("events.upcoming") || "Upcoming", color: "bg-primary" };
  };

  // Separate upcoming and past events
  const upcomingEvents = events?.filter(e => isFuture(new Date(e.date)) || isToday(new Date(e.date))) || [];
  const pastEvents = events?.filter(e => isPast(new Date(e.date)) && !isToday(new Date(e.date))) || [];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-10 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
        <div className={`max-w-7xl mx-auto px-3 md:px-4 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6">
              <CalendarDays className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-medium">{t("nav.events")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4 px-2">
              {t("events.title")}
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8 px-2">
              {t("events.subtitle")}
            </p>
            <div className={`flex flex-col sm:flex-row gap-3 md:gap-4 justify-center ${isRTL ? "sm:flex-row-reverse" : ""}`}>
              <Link href="/volunteer">
                <Button size="lg" className="text-sm md:text-base w-full sm:w-auto">
                  <Users className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("volunteer.title")}
                </Button>
              </Link>
              <Link href="/donate">
                <Button size="lg" variant="outline" className="text-sm md:text-base w-full sm:w-auto">
                  <Heart className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("nav.donateNow")}
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Events List */}
      <section className="py-10 md:py-20">
        <div className={`max-w-7xl mx-auto px-3 md:px-4 ${isRTL ? "direction-rtl" : ""}`}>
          {/* Upcoming Events */}
          <ScrollReveal>
            <h2 className={`text-2xl md:text-3xl font-bold mb-8 ${isRTL ? "text-right" : ""}`}>{t("events.upcoming")}</h2>
          </ScrollReveal>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => {
                const status = getEventStatus(event.date);
                return (
                  <StaggerItem key={event.id}>
                    <HoverLift>
                      <Card className="h-full elevated-card overflow-hidden">
                        {event.imageUrl && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                        )}
                        <CardHeader className={isRTL ? "text-right" : ""}>
                          <div className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                            <Badge className={getEventTypeColor(event.eventType)}>
                              {getEventTypeLabel(event.eventType)}
                            </Badge>
                            <Badge className={status.color}>{status.label}</Badge>
                          </div>
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {event.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className={isRTL ? "text-right" : ""}>
                          <div className="space-y-3 text-sm text-muted-foreground">
                            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{format(new Date(event.date), "h:mm a")}</span>
                              {event.endDate && (
                                <span>- {format(new Date(event.endDate), "h:mm a")}</span>
                              )}
                            </div>
                            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                              <MapPin className="w-4 h-4 text-primary" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Link href={`/event-donate/${event.id}`}>
                              <Button className="w-full">
                                <Heart className="w-4 h-4 mr-2" />
                                Support This Event
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </HoverLift>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          ) : (
            <Card className={`p-12 text-center ${isRTL ? "direction-rtl" : ""}`}>
              <CalendarDays className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("events.noUpcoming")}</h3>
              <p className="text-muted-foreground mb-6">
                {t("events.noUpcomingDesc")}
              </p>
              <Link href="/contact">
                <Button variant="outline">{t("events.contactUs")}</Button>
              </Link>
            </Card>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <>
              <ScrollReveal className="mt-16">
                <h2 className={`text-2xl md:text-3xl font-bold mb-8 ${isRTL ? "text-right" : ""}`}>{t("events.past")}</h2>
              </ScrollReveal>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                {pastEvents.slice(0, 6).map((event) => (
                  <StaggerItem key={event.id}>
                    <Card className={`h-full ${isRTL ? "text-right" : ""}`}>
                      <CardHeader>
                        <div className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                          <Badge variant="secondary">
                            {getEventTypeLabel(event.eventType)}
                          </Badge>
                          <Badge variant="outline">{t("events.completed") || "Completed"}</Badge>
                        </div>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(event.date), "MMMM d, yyyy")}</span>
                          </div>
                          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-16 bg-primary text-primary-foreground">
        <div className={`max-w-4xl mx-auto px-3 md:px-4 text-center ${isRTL ? "direction-rtl" : ""}`}>
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-3 md:mb-4">
              {t("events.ctaTitle")}
            </h2>
            <p className="text-sm md:text-lg opacity-90 mb-6 md:mb-8">
              {t("events.ctaDesc")}
            </p>
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="text-sm md:text-base">
                {t("events.contactUs")}
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
