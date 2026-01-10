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

  // Fetch donor's donations
  const { data: donations, isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donor/donations"],
    queryFn: async () => {
      const response = await donorApiRequest("GET", "/api/donor/donations");
      return response.json();
    },
    enabled: isAuthenticated,
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
  const totalDonations = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const donationCount = donations?.length || 0;

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
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full mb-3 text-sm">
                <User className="w-4 h-4" />
                {t("donor.dashboard")}
              </div>
              <h1 className="text-3xl font-bold">{t("donor.welcomeBack").replace("{name}", donor.fullName)}</h1>
              <p className="text-muted-foreground mt-1">
                {t("donor.profileDescription")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/donate">
                <Button size="lg" className="shadow-lg shadow-primary/25">
                  <HandHeart className="w-5 h-5 mr-2" />
                  {t("nav.donate")}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-5 h-5 mr-2" />
                {t("donor.logout")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("donor.totalDonated")}
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">PKR {totalDonations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("donor.lifetimeContribution")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("donor.totalDonations")}
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{donationCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("donor.donationsMade")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("donor.memberSince")}
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {donor.createdAt ? format(new Date(donor.createdAt), "MMM yyyy") : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
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
              ) : donations && donations.length > 0 ? (
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
                      {donations.map((donation) => (
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
      </div>
    </main>
  );
}
