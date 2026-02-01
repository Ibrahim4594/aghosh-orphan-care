import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { AnimatePresence, PageTransition } from "@/lib/animations";
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import ProgramsPage from "@/pages/programs";
import DonatePage from "@/pages/donate";
import ImpactPage from "@/pages/impact";
import ContactPage from "@/pages/contact";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminSettingsPage from "@/pages/admin/settings";
import DonorLoginPage from "@/pages/donor/login";
import DonorSignupPage from "@/pages/donor/signup";
import DonorDashboardPage from "@/pages/donor/dashboard";
import DonorSettingsPage from "@/pages/donor/settings";
import WelcomePage from "@/pages/welcome";
import EventsPage from "@/pages/events";
import EventDonatePage from "@/pages/event-donate";
import EventReceiptPage from "@/pages/event-receipt";
import VolunteerPage from "@/pages/volunteer";
import SponsorshipPage from "@/pages/sponsorship";
import SponsorFormPage from "@/pages/sponsor-form";
import ReceiptPage from "@/pages/receipt";
import DonateTestPage from "@/pages/donate-test";
import NotFound from "@/pages/not-found";

// Simple auth guard - no redirects, just render children
function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Welcome page
function WelcomeRedirect() {
  return (
    <PageTransition>
      <WelcomePage />
    </PageTransition>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pb-20 md:pb-0">{children}</div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/">
          <PublicLayout>
            <PageTransition>
              <HomePage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/about">
          <PublicLayout>
            <PageTransition>
              <AboutPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/programs">
          <PublicLayout>
            <PageTransition>
              <ProgramsPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/donate">
          <PublicLayout>
            <PageTransition>
              <DonatePage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/impact">
          <PublicLayout>
            <PageTransition>
              <ImpactPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/contact">
          <PublicLayout>
            <PageTransition>
              <ContactPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/events">
          <PublicLayout>
            <PageTransition>
              <EventsPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/event-donate/:eventId">
          <PublicLayout>
            <PageTransition>
              <EventDonatePage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/event-receipt/:eventDonationId">
          <PublicLayout>
            <PageTransition>
              <EventReceiptPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/volunteer">
          <PublicLayout>
            <PageTransition>
              <VolunteerPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/sponsorship">
          <PublicLayout>
            <PageTransition>
              <SponsorshipPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/sponsor/:childId">
          <PublicLayout>
            <PageTransition>
              <SponsorFormPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/receipt/:sponsorshipId">
          <PublicLayout>
            <PageTransition>
              <ReceiptPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/admin">
          <AdminLayout>
            <PageTransition>
              <AdminLoginPage />
            </PageTransition>
          </AdminLayout>
        </Route>
        <Route path="/admin/dashboard">
          <AdminLayout>
            <PageTransition>
              <AdminDashboardPage />
            </PageTransition>
          </AdminLayout>
        </Route>
        <Route path="/admin/settings">
          <AdminLayout>
            <PageTransition>
              <AdminSettingsPage />
            </PageTransition>
          </AdminLayout>
        </Route>
        <Route path="/login">
          <Redirect to="/donor/login" />
        </Route>
        <Route path="/signup">
          <Redirect to="/donor/signup" />
        </Route>
        <Route path="/welcome">
          <Redirect to="/" />
        </Route>
        <Route path="/donor/login">
          <PublicLayout>
            <PageTransition>
              <DonorLoginPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/donor/signup">
          <PublicLayout>
            <PageTransition>
              <DonorSignupPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/donor/dashboard">
          <PublicLayout>
            <PageTransition>
              <DonorDashboardPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/donor/settings">
          <PublicLayout>
            <PageTransition>
              <DonorSettingsPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route path="/donate-test">
          <PublicLayout>
            <PageTransition>
              <DonateTestPage />
            </PageTransition>
          </PublicLayout>
        </Route>
        <Route>
          <PublicLayout>
            <PageTransition>
              <NotFound />
            </PageTransition>
          </PublicLayout>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="aghosh-theme">
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <AuthGuard>
                <Router />
              </AuthGuard>
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
