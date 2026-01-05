import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const subjects = [
  "General Inquiry",
  "Donation Questions",
  "Volunteer Opportunities",
  "Schedule a Visit",
  "Partnership Request",
  "Media Inquiry",
  "Other",
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll respond within 24-48 hours.",
    });
    form.reset();
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <main className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Get in Touch</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6" data-testid="text-contact-title">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have questions about our programs, want to volunteer, or need assistance with a donation? 
            We're here to help. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card data-testid="card-contact-address">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Aghosh Orphan Care Home<br />
                      Minhaj Welfare Foundation<br />
                      365-M, Model Town<br />
                      Lahore, Pakistan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-contact-phone">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-sm text-muted-foreground">
                      +92 42 35169111<br />
                      +92 300 1234567
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-contact-email">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      info@aghosh.org<br />
                      donations@aghosh.org
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-contact-hours">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office Hours</h3>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 9AM - 5PM<br />
                      Saturday: 10AM - 2PM<br />
                      <span className="italic">Closed for Friday prayers (1-2 PM)</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. We'll respond within 24-48 hours.
                    </p>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John Doe" 
                                  {...field} 
                                  data-testid="input-contact-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="john@example.com" 
                                  {...field}
                                  data-testid="input-contact-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-contact-subject">
                                  <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subjects.map((subject) => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="How can we help you?" 
                                className="min-h-[150px] resize-none"
                                {...field}
                                data-testid="textarea-contact-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full"
                        disabled={isSubmitting}
                        data-testid="button-send-message"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16 bg-accent/30 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Visit Aghosh Orphan Care Home
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            We welcome visitors who wish to see our facilities, meet the children, and learn 
            more about our work. Please contact us in advance to schedule a visit.
          </p>
          <p className="text-sm text-muted-foreground italic">
            "The best of you are those who are best to the orphans." - Prophet Muhammad (PBUH)
          </p>
        </div>
      </div>
    </main>
  );
}
