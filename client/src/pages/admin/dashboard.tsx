import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  DollarSign, 
  Users, 
  TrendingUp,
  LogOut,
  Plus,
  FileText,
  Settings,
  Home,
  RefreshCw,
  Loader2
} from "lucide-react";
import type { Donation, Statistics, ImpactStory, Program } from "@shared/schema";
import { categoryInfoList } from "@shared/schema";
import { apiRequest, queryClient, clearAuthToken } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAddStory, setShowAddStory] = useState(false);
  const [showAddProgram, setShowAddProgram] = useState(false);

  const { data: donations, isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donations"],
  });

  const { data: statistics, isLoading: statsLoading, refetch: refetchStats } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  const { data: stories } = useQuery<ImpactStory[]>({
    queryKey: ["/api/impact-stories"],
  });

  const { data: programs } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout", {});
    },
    onSuccess: () => {
      clearAuthToken();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      setLocation("/admin");
    },
  });

  const addStoryMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; childName: string; childAge: number }) => {
      const response = await apiRequest("POST", "/api/impact-stories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/impact-stories"] });
      setShowAddStory(false);
      toast({
        title: "Story Added",
        description: "The impact story has been published.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add story",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addProgramMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; category: string }) => {
      const response = await apiRequest("POST", "/api/programs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      setShowAddProgram(false);
      toast({
        title: "Program Added",
        description: "The program has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add program",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCategoryLabel = (categoryId: string) => {
    return categoryInfoList.find(c => c.id === categoryId)?.title || categoryId;
  };

  const donationsByCategory = donations?.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + d.amount;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalDonations = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const recentDonations = donations?.slice(0, 10) || [];

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage donations, programs, and impact stories</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/">
              <Button variant="outline" size="default">
                <Home className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-stat-total">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                  <p className="text-2xl font-bold">${totalDonations.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-donors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donors</p>
                  <p className="text-2xl font-bold">{donations?.length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-children">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Children Supported</p>
                  <p className="text-2xl font-bold">{statistics?.childrenSupported || 527}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-programs">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active Programs</p>
                  <p className="text-2xl font-bold">{programs?.length || 6}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>Latest donations received</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/donations"] })}
                  data-testid="button-refresh-donations"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {donationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : recentDonations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No donations yet
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6 px-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px]">Donor</TableHead>
                          <TableHead className="min-w-[100px]">Category</TableHead>
                          <TableHead className="min-w-[80px]">Amount</TableHead>
                          <TableHead className="min-w-[100px]">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentDonations.map((donation) => (
                          <TableRow key={donation.id} data-testid={`row-donation-${donation.id}`}>
                            <TableCell>
                              {donation.isAnonymous ? (
                                <span className="text-muted-foreground italic">Anonymous</span>
                              ) : (
                                donation.donorName || "N/A"
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {getCategoryLabel(donation.category)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">${donation.amount}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(donation.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Donations by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryInfoList.map((category) => {
                  const amount = donationsByCategory[category.id] || 0;
                  const percentage = totalDonations > 0 ? (amount / totalDonations) * 100 : 0;
                  return (
                    <div key={category.id} data-testid={`category-stat-${category.id}`}>
                      <div className="flex items-center justify-between gap-4 mb-1 text-sm flex-wrap">
                        <span>{category.title}</span>
                        <span className="text-muted-foreground">${amount.toLocaleString()}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Dialog open={showAddStory} onOpenChange={setShowAddStory}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-add-story">
                      <FileText className="w-4 h-4 mr-2" />
                      Add Impact Story
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Impact Story</DialogTitle>
                      <DialogDescription>Share a child's journey and transformation</DialogDescription>
                    </DialogHeader>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        addStoryMutation.mutate({
                          title: formData.get("title") as string,
                          content: formData.get("content") as string,
                          childName: formData.get("childName") as string,
                          childAge: parseInt(formData.get("childAge") as string) || 10,
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="title">Story Title</Label>
                        <Input id="title" name="title" placeholder="A New Beginning for..." required data-testid="input-story-title" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="childName">Child's Name</Label>
                          <Input id="childName" name="childName" placeholder="Ahmed" data-testid="input-story-child-name" />
                        </div>
                        <div>
                          <Label htmlFor="childAge">Age</Label>
                          <Input id="childAge" name="childAge" type="number" placeholder="10" data-testid="input-story-child-age" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="content">Story Content</Label>
                        <Textarea 
                          id="content" 
                          name="content" 
                          placeholder="Tell the story of transformation..." 
                          className="min-h-[120px]"
                          required
                          data-testid="textarea-story-content"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={addStoryMutation.isPending}
                        data-testid="button-publish-story"
                      >
                        {addStoryMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Publish Story
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAddProgram} onOpenChange={setShowAddProgram}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-add-program">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Program
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Program</DialogTitle>
                      <DialogDescription>Create a new care program</DialogDescription>
                    </DialogHeader>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        addProgramMutation.mutate({
                          title: formData.get("title") as string,
                          description: formData.get("description") as string,
                          category: formData.get("category") as string,
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="prog-title">Program Title</Label>
                        <Input id="prog-title" name="title" placeholder="New Care Program" required data-testid="input-program-title" />
                      </div>
                      <div>
                        <Label htmlFor="prog-category">Category</Label>
                        <Select name="category" required>
                          <SelectTrigger data-testid="select-program-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryInfoList.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="prog-description">Description</Label>
                        <Textarea 
                          id="prog-description" 
                          name="description" 
                          placeholder="Describe the program..." 
                          className="min-h-[100px]"
                          required
                          data-testid="textarea-program-description"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={addProgramMutation.isPending}
                        data-testid="button-create-program"
                      >
                        {addProgramMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Create Program
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full justify-start" disabled>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Published Impact Stories</CardTitle>
            <CardDescription>Stories currently visible on the website</CardDescription>
          </CardHeader>
          <CardContent>
            {!stories || stories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No stories published yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stories.map((story) => (
                  <Card key={story.id} className="bg-accent/30" data-testid={`card-admin-story-${story.id}`}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-1">{story.title}</h4>
                      {story.childName && (
                        <Badge variant="secondary" className="mb-2">
                          {story.childName}, {story.childAge} years
                        </Badge>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">{story.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
