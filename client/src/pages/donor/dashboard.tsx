import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Heart,
  LogOut,
  User,
  History,
  Loader2,
  HandHeart,
  Calendar,
  DollarSign,
  TrendingUp,
  Pencil,
  Settings,
  ExternalLink,
  FileText,
  Receipt,
  MapPin,
  CheckCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { donorApiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { format } from "date-fns";
import { StatsCardSkeleton, ProfileSkeleton, TableSkeleton } from "@/components/ui/skeletons";

interface DonorProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
}

interface Donation {
  id: string;
  donorId: string | null;
  donorName: string | null;
  email: string | null;
  amount: number;
  category: string;
  isAnonymous: boolean;
  paymentMethod: string;
  createdAt: string;
}

interface Sponsorship {
  id: string;
  childId: string;
  sponsorName: string;
  sponsorEmail: string;
  monthlyAmount: number;
  startDate: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  localReceiptNumber: string | null;
  stripeReceiptUrl: string | null;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  imageUrl: string | null;
  eventType: string;
  createdAt: string;
}

interface EventDonation {
  id: string;
  eventId: string;
  donorName: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  attendanceStatus: string;
  localReceiptNumber: string | null;
  createdAt: string;
}

export default function DonorDashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isAuthenticated, isLoading: authLoading, donor: authDonor, logout: authLogout } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/donor/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Fetch donor's donations with real-time updates
  const { data: donations, isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donor/donations"],
    queryFn: async () => {
      const response = await donorApiRequest("GET", "/api/donor/donations");
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when user returns to the page
    refetchOnMount: true, // Refetch when component mounts
  });

  // Fetch donor's sponsorships with real-time updates
  const { data: sponsorships, isLoading: sponsorshipsLoading } = useQuery<Sponsorship[]>({
    queryKey: ["/api/donor/sponsorships"],
    queryFn: async () => {
      const response = await donorApiRequest("GET", "/api/donor/sponsorships");
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when user returns to the page
    refetchOnMount: true, // Refetch when component mounts
  });

  // Fetch all events
  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch donor's event donations with real-time updates
  const { data: eventDonations, isLoading: eventDonationsLoading } = useQuery<EventDonation[]>({
    queryKey: ["/api/donor/event-donations"],
    queryFn: async () => {
      const response = await donorApiRequest("GET", "/api/donor/event-donations");
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when user returns to the page
    refetchOnMount: true, // Refetch when component mounts
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await donorApiRequest("POST", "/api/donor/logout");
    },
    onSuccess: () => {
      authLogout();
      queryClient.clear();
      toast({
        title: t("donor.loggedOut"),
        description: t("donor.loggedOutMessage"),
      });
      setLocation("/donor/login");
    },
  });

  // Profile edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  // Initialize edit form when auth data loads
  useEffect(() => {
    if (authDonor) {
      setEditForm({
        fullName: authDonor.fullName || "",
        phone: "",
        address: "",
        city: "",
        country: "",
      });
    }
  }, [authDonor]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof editForm) => {
      const response = await donorApiRequest("PATCH", "/api/donor/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("donor.profileUpdated") || "Profile Updated",
        description: t("donor.profileUpdatedMessage") || "Your profile has been updated successfully.",
      });
      setIsEditOpen(false);
    },
    onError: () => {
      toast({
        title: t("donor.updateFailed") || "Update Failed",
        description: t("donor.updateFailedMessage") || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-9 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-5 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ProfileSkeleton />
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="h-6 w-40 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <TableSkeleton rows={5} columns={4} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !authDonor) {
    return null;
  }

  // Extend auth donor with default values for missing profile fields
  const donor: DonorProfile = {
    id: authDonor.id,
    email: authDonor.email,
    fullName: authDonor.fullName,
    phone: null,
    address: null,
    city: null,
    country: null,
    createdAt: new Date().toISOString(),
  };
  const totalDonations = (donations as Donation[])?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const donationCount = (donations as Donation[])?.length || 0;

  const totalSponsorships = (sponsorships as Sponsorship[])?.filter(s => s.status === 'active').length || 0;
  const totalSponsorshipAmount = (sponsorships as Sponsorship[])
    ?.filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.monthlyAmount, 0) || 0;

  const totalEventDonations = (eventDonations as EventDonation[])?.reduce((sum, ed) => sum + ed.amount, 0) || 0;
  const eventDonationCount = (eventDonations as EventDonation[])?.length || 0;

  const totalContributed = totalDonations + totalSponsorshipAmount + totalEventDonations;
  const totalEvents = (events as Event[])?.length || 0;
  const upcomingEvents = (events as Event[])?.filter(e => new Date(e.date) > new Date()).slice(0, 3) || [];

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      health: t("categories.healthcare"),
      education: t("categories.education"),
      food: t("categories.food"),
      clothing: t("categories.clothing"),
      general: t("categories.general"),
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      education: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      food: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      clothing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      general: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    };
    return colors[category] || colors.general;
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-12 md:py-16 overflow-hidden border-b">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4 text-sm font-medium">
                <User className="w-4 h-4" />
                {t("donor.dashboard")}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {t("donor.welcomeBack").replace("{name}", donor.fullName.split(' ')[0])}{" "}
                <span className="text-primary">{donor.fullName.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Thank you for making a difference in children's lives
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
              <Link href="/sponsorship">
                <Button size="lg" className="shadow-lg">
                  <Heart className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Sponsor a Child</span>
                </Button>
              </Link>
              <Link href="/donate">
                <Button size="lg" variant="outline" className="shadow-md border-2">
                  <HandHeart className="w-5 h-5 md:mr-2" />
                  <span className="hidden sm:inline">{t("nav.donate")}</span>
                </Button>
              </Link>
              <Link href="/donor/settings">
                <Button variant="outline" size="lg" className="border-2">
                  <Settings className="w-5 h-5 md:mr-2" />
                  <span className="hidden md:inline">{t("donor.settings") || "Settings"}</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-2"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">{t("donor.logout")}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Total Contributed
              </CardTitle>
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">PKR {totalContributed.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Lifetime Donations + Sponsorships
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Active Sponsorships
              </CardTitle>
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{totalSponsorships}</div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                PKR {totalSponsorshipAmount.toLocaleString()}/month recurring
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                One-Time Donations
              </CardTitle>
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-secondary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{donationCount}</div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                {t("donor.donationsMade")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                {t("donor.memberSince")}
              </CardTitle>
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">
                {donor.createdAt ? format(new Date(donor.createdAt), "MMM yyyy") : "N/A"}
              </div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                {t("donor.joinedDate")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1 border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t("donor.profile")}
                </CardTitle>
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("donor.editProfile") || "Edit Profile"}</DialogTitle>
                      <DialogDescription>
                        {t("donor.editProfileDescription") || "Update your profile information"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">{t("donor.fullName")}</Label>
                        <Input
                          id="fullName"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("donor.phone")}</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">{t("donor.address") || "Address"}</Label>
                        <Input
                          id="address"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">{t("donor.city")}</Label>
                          <Input
                            id="city"
                            value={editForm.city}
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">{t("donor.country")}</Label>
                          <Input
                            id="country"
                            value={editForm.country}
                            onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => updateProfileMutation.mutate(editForm)}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {t("donor.saveChanges") || "Save Changes"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>{t("donor.profileDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("donor.fullName")}</label>
                <p className="font-medium">{donor.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("donor.email")}</label>
                <p className="font-medium">{donor.email}</p>
              </div>
              {donor.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("donor.phone")}</label>
                  <p className="font-medium">{donor.phone}</p>
                </div>
              )}
              {(donor.city || donor.country) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("donor.location")}</label>
                  <p className="font-medium">
                    {[donor.city, donor.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donation History */}
          <Card className="lg:col-span-2 border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                {t("donor.donationHistory")}
              </CardTitle>
              <CardDescription>{t("donor.donationHistoryDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {donationsLoading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : donations && (donations as Donation[]).length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("donor.date")}</TableHead>
                        <TableHead>{t("donor.category")}</TableHead>
                        <TableHead>{t("donor.amount")}</TableHead>
                        <TableHead>{t("donor.paymentMethod")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(donations as Donation[]).map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell>
                            {donation.createdAt
                              ? format(new Date(donation.createdAt), "MMM dd, yyyy")
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getCategoryColor(donation.category)}>
                              {getCategoryLabel(donation.category)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            PKR {donation.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="capitalize">{donation.paymentMethod}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <HandHeart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">{t("donor.noDonationsYet")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("donor.noDonationsDescription")}
                  </p>
                  <Link href="/donate">
                    <Button>
                      <HandHeart className="w-4 h-4 mr-2" />
                      {t("donor.makeFirstDonation")}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sponsorships Section */}
        <div className="mt-8">
          <Card className="border-2 shadow-2xl">
            <CardHeader className="bg-accent border-b-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
                    </div>
                    My Sponsorships
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Children you are currently sponsoring - View receipts and track your impact
                  </CardDescription>
                </div>
                <Badge className="bg-secondary text-secondary-foreground text-lg px-4 py-2">
                  {totalSponsorships} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {sponsorshipsLoading ? (
                <TableSkeleton rows={3} columns={5} />
              ) : sponsorships && (sponsorships as Sponsorship[]).length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Child</TableHead>
                        <TableHead className="font-semibold">Monthly Amount</TableHead>
                        <TableHead className="font-semibold">Start Date</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Receipts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(sponsorships as Sponsorship[]).map((sponsorship) => (
                        <TableRow key={sponsorship.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{sponsorship.sponsorName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-primary" />
                              <span className="font-semibold">PKR {sponsorship.monthlyAmount.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground">/month</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {format(new Date(sponsorship.startDate), "MMM dd, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={sponsorship.status === 'active' ? 'default' : 'secondary'}
                              className={sponsorship.status === 'active' ? 'bg-secondary' : ''}
                            >
                              {sponsorship.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {sponsorship.localReceiptNumber ? (
                              <div className="flex flex-col gap-2">
                                <Link href={`/receipt/${sponsorship.childId}`}>
                                  <Button variant="outline" size="sm" className="w-full justify-start">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Local Receipt
                                  </Button>
                                </Link>
                                {sponsorship.stripeReceiptUrl ? (
                                  <a
                                    href={sponsorship.stripeReceiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full"
                                  >
                                    <Button variant="default" size="sm" className="w-full justify-start">
                                      <Receipt className="w-4 h-4 mr-2" />
                                      Stripe Receipt
                                      <ExternalLink className="w-3 h-3 ml-auto" />
                                    </Button>
                                  </a>
                                ) : (
                                  <Button variant="ghost" size="sm" disabled className="w-full justify-start opacity-50">
                                    <Receipt className="w-4 h-4 mr-2" />
                                    Stripe Receipt Unavailable
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Pending</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Active Sponsorships</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start sponsoring a child today and make a lasting impact on their life.
                  </p>
                  <Link href="/sponsorship">
                    <Button>
                      <Heart className="w-4 h-4 mr-2" />
                      Browse Children
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Events Section */}
        <div className="mt-8">
          <Card className="border-2 shadow-2xl">
            <CardHeader className="bg-accent border-b-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    Upcoming Events
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Support our events and make a difference in the community
                  </CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
                  {eventDonationCount} Donations
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => {
                    const eventTypeColors: Record<string, string> = {
                      general: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                      fundraiser: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                      volunteer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                      religious: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                    };

                    const alreadyDonated = (eventDonations as EventDonation[])?.some(ed => ed.eventId === event.id);

                    return (
                      <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                        {event.imageUrl && (
                          <div className="h-48 overflow-hidden bg-muted">
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={eventTypeColors[event.eventType] || eventTypeColors.general}>
                              {event.eventType}
                            </Badge>
                            {alreadyDonated && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                ✓ Donated
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {event.description || "Join us for this special event"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(event.date), "MMM dd, yyyy · h:mm a")}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}
                          <Link href={`/donate?eventId=${event.id}`}>
                            <Button className="w-full mt-4" variant={alreadyDonated ? "outline" : "default"}>
                              <DollarSign className="w-4 h-4 mr-2" />
                              {alreadyDonated ? "Donate Again" : "Donate to Event"}
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Upcoming Events</h3>
                  <p className="text-sm text-muted-foreground">
                    Check back soon for new events and opportunities to make a difference.
                  </p>
                </div>
              )}

              {/* Event Donations History */}
              {eventDonationCount > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Your Event Donations
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Event</TableHead>
                          <TableHead className="font-semibold">Amount</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Attendance</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eventDonations?.map((donation) => {
                          const event = events?.find(e => e.id === donation.eventId);
                          const getAttendanceConfig = (status: string) => {
                            switch (status) {
                              case "attending":
                                return {
                                  icon: <CheckCircle className="w-4 h-4" />,
                                  label: "Attending",
                                  className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                };
                              case "not_attending":
                                return {
                                  icon: <XCircle className="w-4 h-4" />,
                                  label: "Not Attending",
                                  className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                };
                              case "maybe":
                                return {
                                  icon: <HelpCircle className="w-4 h-4" />,
                                  label: "Maybe",
                                  className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                };
                              default:
                                return {
                                  icon: <CheckCircle className="w-4 h-4" />,
                                  label: "Attending",
                                  className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                };
                            }
                          };
                          const attendance = getAttendanceConfig(donation.attendanceStatus);

                          return (
                            <TableRow key={donation.id} className="hover:bg-muted/30">
                              <TableCell className="font-medium">
                                {event?.title || "Event"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-primary" />
                                  <span className="font-semibold">PKR {donation.amount.toLocaleString()}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  {format(new Date(donation.createdAt), "MMM dd, yyyy")}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={attendance.className}>
                                  <span className="flex items-center gap-1">
                                    {attendance.icon}
                                    {attendance.label}
                                  </span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={donation.paymentStatus === 'completed' ? 'default' : 'secondary'}
                                  className={donation.paymentStatus === 'completed' ? 'bg-green-600' : ''}
                                >
                                  {donation.paymentStatus}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
