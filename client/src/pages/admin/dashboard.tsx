import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LogOut,
  Plus,
  Home,
  Loader2,
  Baby,
  Calendar,
  Check,
  X,
  Users,
  Trash2,
  Heart,
  TrendingUp,
  DollarSign,
  UserCheck,
  Clock,
  CalendarDays,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { apiRequest, queryClient, clearAuthToken } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { ImprovedChildForm } from "@/components/admin/ImprovedChildForm";
import { ImprovedEventForm } from "@/components/admin/ImprovedEventForm";

// Schema factories - create schemas with translated error messages
const createChildSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, t("validation.nameRequired")),
  age: z.coerce.number().min(1).max(18),
  gender: z.enum(["male", "female"]),
  grade: z.string().optional(),
  story: z.string().optional(),
  needs: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  monthlyAmount: z.coerce.number().min(1000).default(5000),
});

const createEventSchema = (t: (key: string) => string) => z.object({
  title: z.string().min(2, t("validation.titleRequired")),
  description: z.string().min(10, t("validation.descriptionRequired")),
  date: z.string().min(1, t("validation.dateRequired")),
  location: z.string().min(2, t("validation.locationRequired")),
  imageUrl: z.string().optional().or(z.literal("")),
  eventType: z.enum(["general", "fundraiser", "volunteer", "religious"]).default("general"),
});

type ChildFormData = z.infer<ReturnType<typeof createChildSchema>>;
type EventFormData = z.infer<ReturnType<typeof createEventSchema>>;

interface Volunteer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  availability: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface Child {
  id: string;
  name: string;
  age: number;
  gender: string;
  grade?: string;
  monthlyAmount: number;
  isSponsored: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  eventType: string;
}

// Simple bar component for charts
function SimpleBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [isChildDialogOpen, setIsChildDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEventForRSVP, setSelectedEventForRSVP] = useState<string | null>(null);

  // Verify session on mount
  const { data: sessionData } = useQuery({
    queryKey: ["/api/admin/session"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/session", undefined);
        const data = await res.json();

        // If not authenticated, clear token and redirect
        if (!data.authenticated) {
          clearAuthToken();
          setLocation("/donor/login");
          throw new Error("Session expired");
        }

        return data;
      } catch (error: any) {
        // Session invalid - clear token and redirect to login
        clearAuthToken();
        setLocation("/donor/login");
        throw error;
      }
    },
    retry: false,
  });

  // Queries
  const { data: volunteers = [], isLoading: volunteersLoading } = useQuery<Volunteer[]>({
    queryKey: ["/api/admin/volunteers"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/volunteers", undefined);
        return res.json();
      } catch (error: any) {
        // If 401, session expired - clear token and redirect to login
        if (error.message?.includes("401")) {
          clearAuthToken();
          setLocation("/donor/login");
          throw error;
        }
        throw error;
      }
    },
  });

  const { data: children = [], isLoading: childrenLoading } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Fetch RSVPs for selected event
  const { data: eventRSVPs = [], isLoading: rsvpsLoading } = useQuery({
    queryKey: [`/api/admin/events/${selectedEventForRSVP}/donations`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/events/${selectedEventForRSVP}/donations`, undefined);
      return res.json();
    },
    enabled: !!selectedEventForRSVP,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Forms with translated validation
  const childForm = useForm<ChildFormData>({
    resolver: zodResolver(createChildSchema(t)),
    defaultValues: {
      name: "",
      age: 5,
      gender: "male",
      grade: "",
      story: "",
      needs: "",
      imageUrl: "",
      monthlyAmount: 5000,
    },
  });

  const eventForm = useForm<EventFormData>({
    resolver: zodResolver(createEventSchema(t)),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
      eventType: "general",
    },
  });

  // Mutations
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout", {});
    },
    onSuccess: () => {
      clearAuthToken();
      toast({ title: t("admin.logout") });
      setLocation("/donor/login");
    },
  });

  const updateVolunteerMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/volunteers/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/volunteers"] });
      toast({ title: t("admin.volunteerUpdated") });
    },
    onError: (error: Error) => {
      // If 401, session expired - clear token and redirect to login
      if (error.message?.includes("401")) {
        clearAuthToken();
        toast({
          title: "Session Expired",
          description: "Please login again.",
          variant: "destructive",
        });
        setLocation("/donor/login");
        return;
      }

      toast({
        title: "Error",
        description: "Failed to update volunteer.",
        variant: "destructive",
      });
    },
  });

  const createChildMutation = useMutation({
    mutationFn: async (data: ChildFormData) => {
      const response = await apiRequest("POST", "/api/admin/children", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      setIsChildDialogOpen(false);
      childForm.reset();
      toast({ title: t("admin.childCreated") });
    },
    onError: (error: Error) => {
      console.error("Child creation error:", error);

      // If 401, session expired - clear token and redirect to login
      if (error.message?.includes("401")) {
        clearAuthToken();
        toast({
          title: "Session Expired",
          description: "Please login again.",
          variant: "destructive",
        });
        setLocation("/donor/login");
        return;
      }

      toast({
        title: "Error",
        description: error.message || "Failed to create child. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await apiRequest("POST", "/api/events", {
        ...data,
        date: new Date(data.date).toISOString(),
        isActive: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsEventDialogOpen(false);
      eventForm.reset();
      toast({ title: t("admin.eventCreated") });
    },
    onError: (error: Error) => {
      console.error("Event creation error:", error);

      // If 401, session expired - clear token and redirect to login
      if (error.message?.includes("401")) {
        clearAuthToken();
        toast({
          title: "Session Expired",
          description: "Please login again.",
          variant: "destructive",
        });
        setLocation("/donor/login");
        return;
      }

      toast({
        title: "Error",
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/events/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: t("admin.eventDeleted") });
    },
    onError: (error: Error) => {
      // If 401, session expired - clear token and redirect to login
      if (error.message?.includes("401")) {
        clearAuthToken();
        toast({
          title: "Session Expired",
          description: "Please login again.",
          variant: "destructive",
        });
        setLocation("/donor/login");
        return;
      }

      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    },
  });

  // Stats calculations
  const pendingVolunteers = volunteers.filter(v => v.status === "pending");
  const approvedVolunteers = volunteers.filter(v => v.status === "approved");
  const sponsoredChildren = children.filter(c => c.isSponsored);
  const availableChildren = children.filter(c => !c.isSponsored);
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date());
  const totalMonthlySponsorship = sponsoredChildren.reduce((sum, c) => sum + c.monthlyAmount, 0);

  // Event type distribution
  const eventTypeStats = {
    general: events.filter(e => e.eventType === "general").length,
    fundraiser: events.filter(e => e.eventType === "fundraiser").length,
    volunteer: events.filter(e => e.eventType === "volunteer").length,
    religious: events.filter(e => e.eventType === "religious").length,
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? "ur-PK" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ${isRTL ? "direction-rtl" : ""}`}>
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t("admin.dashboard")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("admin.manageOrphanage")}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link href="/admin/settings">
              <Button variant="outline" size="sm">
                <Settings className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("admin.settings")}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("admin.viewSite")}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("admin.logout")}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("admin.totalChildren")}</p>
                  <p className="text-3xl font-bold text-blue-600">{children.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sponsoredChildren.length} {t("admin.sponsored")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Baby className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("admin.monthlyRevenue")}</p>
                  <p className="text-3xl font-bold text-green-600">
                    {totalMonthlySponsorship > 0 ? `${(totalMonthlySponsorship / 1000).toFixed(0)}K` : "0"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t("admin.fromSponsors")}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("admin.volunteers")}</p>
                  <p className="text-3xl font-bold text-purple-600">{approvedVolunteers.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingVolunteers.length} {t("admin.pending")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("admin.upcomingEvents")}</p>
                  <p className="text-3xl font-bold text-orange-600">{upcomingEvents.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {events.length} {t("admin.total")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Children Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                {t("admin.childrenOverview")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <div className="relative w-32 h-32">
                  {/* Donut Chart */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-muted/30"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={`${children.length > 0 ? (sponsoredChildren.length / children.length) * 352 : 0} 352`}
                      className="text-green-500 transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{children.length > 0 ? Math.round((sponsoredChildren.length / children.length) * 100) : 0}%</span>
                    <span className="text-xs text-muted-foreground">{t("admin.sponsored")}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{sponsoredChildren.length}</p>
                  <p className="text-xs text-muted-foreground">{t("admin.sponsored")}</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{availableChildren.length}</p>
                  <p className="text-xs text-muted-foreground">{t("admin.needSponsors")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                {t("admin.eventDistribution")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <SimpleBar
                label={t("admin.generalEvents")}
                value={eventTypeStats.general}
                maxValue={Math.max(...Object.values(eventTypeStats), 1)}
                color="bg-blue-500"
              />
              <SimpleBar
                label={t("admin.fundraisers")}
                value={eventTypeStats.fundraiser}
                maxValue={Math.max(...Object.values(eventTypeStats), 1)}
                color="bg-green-500"
              />
              <SimpleBar
                label={t("admin.volunteerEvents")}
                value={eventTypeStats.volunteer}
                maxValue={Math.max(...Object.values(eventTypeStats), 1)}
                color="bg-purple-500"
              />
              <SimpleBar
                label={t("admin.religiousEvents")}
                value={eventTypeStats.religious}
                maxValue={Math.max(...Object.values(eventTypeStats), 1)}
                color="bg-amber-500"
              />
              {events.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  {t("admin.noEventsYet")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="children" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="children" className="flex items-center gap-2">
              <Baby className="w-4 h-4" />
              {t("admin.children")}
              <Badge variant="secondary" className="ml-1">{children.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t("admin.events")}
              <Badge variant="secondary" className="ml-1">{events.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t("admin.volunteers")}
              {pendingVolunteers.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingVolunteers.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Children Tab */}
          <TabsContent value="children">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("admin.childrenForSponsorship")}</CardTitle>
                  <CardDescription>{t("admin.addChildrenDesc")}</CardDescription>
                </div>
                <Dialog open={isChildDialogOpen} onOpenChange={setIsChildDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("admin.addChild")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">{t("admin.addNewChild")}</DialogTitle>
                      <DialogDescription>{t("admin.childWillAppear")}</DialogDescription>
                    </DialogHeader>
                    <Form {...childForm}>
                      <ImprovedChildForm
                        form={childForm}
                        onSubmit={(data) => createChildMutation.mutate(data)}
                        isSubmitting={createChildMutation.isPending}
                      />
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {childrenLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : children.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Baby className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t("admin.noChildrenYet")}</p>
                    <p className="text-sm">{t("admin.clickAddChild")}</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${child.isSponsored ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'}`}>
                            <Baby className={`w-5 h-5 ${child.isSponsored ? 'text-green-600' : 'text-primary'}`} />
                          </div>
                          <div>
                            <p className="font-medium">{child.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {child.age} {t("admin.yearsOld")} • {child.gender === "male" ? t("admin.boy") : t("admin.girl")}
                              {child.grade && ` • ${child.grade}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">PKR {child.monthlyAmount.toLocaleString()}/mo</span>
                          <Badge variant={child.isSponsored ? "default" : "secondary"}>
                            {child.isSponsored ? t("admin.sponsored") : t("admin.available")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("admin.events")}</CardTitle>
                  <CardDescription>{t("admin.eventsDesc")}</CardDescription>
                </div>
                <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("admin.addEvent")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">{t("admin.createNewEvent")}</DialogTitle>
                      <DialogDescription>{t("admin.eventWillAppear")}</DialogDescription>
                    </DialogHeader>
                    <Form {...eventForm}>
                      <ImprovedEventForm
                        form={eventForm}
                        onSubmit={(data) => createEventMutation.mutate(data)}
                        isSubmitting={createEventMutation.isPending}
                      />
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t("admin.noEventsCreated")}</p>
                    <p className="text-sm">{t("admin.clickAddEvent")}</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(event.date)} • {event.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{event.eventType}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEventForRSVP(event.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View RSVPs
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteEventMutation.mutate(event.id)}
                            disabled={deleteEventMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RSVP Dialog */}
            <Dialog open={!!selectedEventForRSVP} onOpenChange={(open) => !open && setSelectedEventForRSVP(null)}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Event RSVPs</DialogTitle>
                  <DialogDescription>
                    View who has responded to this event
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {rsvpsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : eventRSVPs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No RSVPs yet</p>
                      <p className="text-sm">RSVPs will appear here when people respond</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {eventRSVPs.map((rsvp: any) => (
                        <div key={rsvp.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              rsvp.attendanceStatus === 'attending' ? 'bg-green-100 dark:bg-green-900/30' :
                              rsvp.attendanceStatus === 'not_attending' ? 'bg-red-100 dark:bg-red-900/30' :
                              'bg-amber-100 dark:bg-amber-900/30'
                            }`}>
                              {rsvp.attendanceStatus === 'attending' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : rsvp.attendanceStatus === 'not_attending' ? (
                                <XCircle className="w-5 h-5 text-red-600" />
                              ) : (
                                <HelpCircle className="w-5 h-5 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{rsvp.donorName || 'Anonymous'}</p>
                              <p className="text-sm text-muted-foreground">{rsvp.donorEmail || 'No email'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              rsvp.attendanceStatus === 'attending' ? 'default' :
                              rsvp.attendanceStatus === 'not_attending' ? 'destructive' :
                              'secondary'
                            }>
                              {rsvp.attendanceStatus === 'attending' ? 'Will Attend' :
                               rsvp.attendanceStatus === 'not_attending' ? 'Won\'t Attend' :
                               'Maybe'}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(rsvp.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.volunteerApplications")}</CardTitle>
                <CardDescription>{t("admin.reviewApprove")}</CardDescription>
              </CardHeader>
              <CardContent>
                {volunteersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : volunteers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t("admin.noVolunteersYet")}</p>
                    <p className="text-sm">{t("admin.applicationsWillAppear")}</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {volunteers.map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            volunteer.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30' :
                            volunteer.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-amber-100 dark:bg-amber-900/30'
                          }`}>
                            {volunteer.status === 'approved' ? (
                              <UserCheck className="w-5 h-5 text-green-600" />
                            ) : volunteer.status === 'rejected' ? (
                              <X className="w-5 h-5 text-red-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-amber-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{volunteer.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {volunteer.email} • {volunteer.phone}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t("admin.availableTime")}: {volunteer.availability}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {volunteer.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => updateVolunteerMutation.mutate({ id: volunteer.id, status: "approved" })}
                                disabled={updateVolunteerMutation.isPending}
                              >
                                <Check className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                                {t("admin.approve")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => updateVolunteerMutation.mutate({ id: volunteer.id, status: "rejected" })}
                                disabled={updateVolunteerMutation.isPending}
                              >
                                <X className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                                {t("admin.reject")}
                              </Button>
                            </>
                          ) : (
                            <Badge variant={volunteer.status === "approved" ? "default" : "destructive"}>
                              {volunteer.status === "approved" ? t("admin.approved") : t("admin.rejected")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
