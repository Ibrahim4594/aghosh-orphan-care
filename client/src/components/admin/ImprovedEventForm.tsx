import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus, Calendar as CalendarIcon, MapPin, Upload, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useLanguage } from "@/lib/i18n";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  eventType: "general" | "fundraiser" | "volunteer" | "religious";
}

interface ImprovedEventFormProps {
  form: UseFormReturn<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  isSubmitting: boolean;
}

export function ImprovedEventForm({ form, onSubmit, isSubmitting }: ImprovedEventFormProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      form.setValue("imageUrl", data.imageUrl);

      toast({
        title: "Image uploaded",
        description: "Banner uploaded successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    form.setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Event Details Section */}
      <div className="space-y-4 pb-4 border-b">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          Event Details
        </h3>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">{t("admin.title")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Annual Fundraising Gala"
                  className="h-11 transition-all duration-200 focus:ring-2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Event Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      General Event
                    </div>
                  </SelectItem>
                  <SelectItem value="fundraiser">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Fundraiser
                    </div>
                  </SelectItem>
                  <SelectItem value="volunteer">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Volunteer Event
                    </div>
                  </SelectItem>
                  <SelectItem value="religious">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Religious Event
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Description *</FormLabel>
              <FormControl>
                <textarea
                  placeholder="Describe what this event is about, what to expect, and why people should attend..."
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Event Background Image Section */}
      <div className="space-y-4 pb-4 border-b">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <ImagePlus className="w-4 h-4" />
          Event Banner Image
        </h3>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />

          {!form.watch("imageUrl") ? (
            <Button
              type="button"
              variant="outline"
              className="w-full h-40 border-2 border-dashed hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <div className="flex flex-col items-center gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload banner</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                    <p className="text-xs text-muted-foreground">Recommended: 1200x630px</p>
                  </>
                )}
              </div>
            </Button>
          ) : (
            <div className="relative rounded-lg overflow-hidden border-2 border-dashed bg-muted/50 h-56 flex items-center justify-center group hover:border-primary transition-colors">
              <img
                src={form.watch("imageUrl")}
                alt="Event Banner Preview"
                className="max-h-full max-w-full object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'%3E%3Crect fill='%23ddd' width='1200' height='630'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='24'%3EInvalid Image%3C/text%3E%3C/svg%3E";
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full"
                onClick={clearImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Date & Location Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          When & Where
        </h3>

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Date & Time *</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Location *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Aghosh Orphan Care Home, Gulshan-e-Iqbal, Karachi"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <Loader2 className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"} animate-spin`} />
        )}
        {isSubmitting ? "Creating Event..." : t("admin.createEvent")}
      </Button>
    </form>
  );
}
