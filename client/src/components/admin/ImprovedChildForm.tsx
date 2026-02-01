import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus, Upload, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useLanguage } from "@/lib/i18n";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ChildFormData {
  name: string;
  age: number;
  gender: "male" | "female";
  grade?: string;
  story?: string;
  needs?: string;
  imageUrl?: string;
  monthlyAmount: number;
}

interface ImprovedChildFormProps {
  form: UseFormReturn<ChildFormData>;
  onSubmit: (data: ChildFormData) => void;
  isSubmitting: boolean;
}

export function ImprovedChildForm({ form, onSubmit, isSubmitting }: ImprovedChildFormProps) {
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
        description: "Photo uploaded successfully",
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
      {/* Basic Information Section */}
      <div className="space-y-4 pb-4 border-b">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary"></span>
          Basic Information
        </h3>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">{t("admin.name")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("admin.childsName")}
                  className="h-11 transition-all duration-200 focus:ring-2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">{t("admin.age")} *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="18"
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
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">{t("admin.gender")} *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">{t("admin.boy")}</SelectItem>
                    <SelectItem value="female">{t("admin.girl")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">{t("admin.gradeClass")}</FormLabel>
                <FormControl>
                  <Input placeholder="Class 5" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4 pb-4 border-b">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <ImagePlus className="w-4 h-4" />
          Child Photo
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
              className="w-full h-32 border-2 border-dashed hover:border-primary transition-colors"
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
                    <p className="text-sm font-medium">Click to upload photo</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                  </>
                )}
              </div>
            </Button>
          ) : (
            <div className="relative rounded-lg overflow-hidden border-2 border-dashed bg-muted/50 h-48 flex items-center justify-center group hover:border-primary transition-colors">
              <img
                src={form.watch("imageUrl")}
                alt="Preview"
                className="max-h-full max-w-full object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3EInvalid Image%3C/text%3E%3C/svg%3E";
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

      {/* Story & Needs Section */}
      <div className="space-y-4 pb-4 border-b">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary"></span>
          Child's Story & Needs
        </h3>

        <FormField
          control={form.control}
          name="story"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Story (Optional)</FormLabel>
              <FormControl>
                <textarea
                  placeholder="Share the child's background story to help sponsors connect..."
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="needs"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Needs (Optional)</FormLabel>
              <FormControl>
                <textarea
                  placeholder="What does this child need? (e.g., education, medical care, clothing)"
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Sponsorship Amount Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary"></span>
          Sponsorship Details
        </h3>
        <FormField
          control={form.control}
          name="monthlyAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">{t("admin.monthlyAmount")} *</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                    PKR
                  </span>
                  <Input
                    type="number"
                    min="1000"
                    className="h-12 pl-16 text-base font-medium"
                    placeholder="5000"
                    {...field}
                  />
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-green-500"></span>
                Recommended: PKR 5,000 - 10,000 per month
              </p>
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
        {isSubmitting ? "Adding Child..." : t("admin.addChild")}
      </Button>
    </form>
  );
}
