import { useState, useEffect } from "react";
import {
  Languages,
  Loader2,
  CheckCircle2,
  ImageIcon,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIResponse {
  description: string;
  language: string;
}

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "ru", label: "Russian" },
];

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add a slight delay to allow for a smooth entrance animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
      // Initialize mouse move effect after component is loaded
      initMouseMoveEffect();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        setError(null);
        setAiResponse(null);
      } else {
        setError("Please upload an image file");
      }
    }
  };

  const getBase64FromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result?.toString().split(",")[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error("Failed to convert image to base64"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\*\*/g, "") // Remove bold markers
      .replace(/\*/g, "") // Remove italic markers
      .replace(/^- /gm, "• ") // Replace markdown bullets with bullet points
      .split("\n") // Split into lines
      .map((line) => line.trim()) // Trim each line
      .filter((line) => line.length > 0) // Remove empty lines
      .join("\n\n"); // Join with double newlines for spacing
  };

  const getLanguagePrompt = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      en: "English",
      es: "Spanish (Español)",
      fr: "French (Français)",
      de: "German (Deutsch)",
      hi: "Hindi (हिंदी)",
      zh: "Chinese (中文)",
      ja: "Japanese (日本語)",
      ko: "Korean (한국어)",
      ar: "Arabic (العربية)",
      ru: "Russian (Русский)",
    };
    return languageMap[lang] || "English";
  };

  const translateText = async (
    text: string,
    targetLang: string
  ): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `Translate the following text to ${getLanguagePrompt(
        targetLang
      )}. 
Keep the same format and structure, including bullet points. 
Make sure the translation is natural and fluent.

Text to translate:
${text}`;

      const result = await model.generateContent(prompt);
      const translatedText = result.response.text();
      return cleanMarkdown(translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error(
        `Translation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    try {
      setLoading(true);
      setError(null);

      // Get base64 image data
      const base64Image = await getBase64FromFile(selectedImage);

      // Get the Gemini Vision Pro model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      console.log(
        "Sending request to Gemini with image type:",
        selectedImage.type
      );

      // Generate content with language-specific prompt
      const prompt =
        language === "en"
          ? "Analyze this medical or health-related image and provide a detailed but concise description. List each observation as a separate bullet point. Focus on any visible symptoms, medical conditions, or health-related aspects. Use simple, easy-to-understand language without any special formatting or markdown."
          : `Analyze this medical or health-related image and provide a detailed but concise description in ${getLanguagePrompt(
              language
            )}. List each observation as a separate bullet point. Focus on any visible symptoms, medical conditions, or health-related aspects. Use simple, easy-to-understand language without any special formatting or markdown.`;

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: selectedImage.type,
            data: base64Image,
          },
        },
        prompt,
      ]);

      const response = await result.response;
      let description = cleanMarkdown(response.text());

      console.log("Received response from Gemini:", description);

      // Check if we need translation by looking for some language-specific characters
      const needsTranslation =
        language !== "en" &&
        !(
          (
            (language === "hi" && /[\u0900-\u097F]/.test(description)) || // Hindi
            (language === "zh" && /[\u4E00-\u9FFF]/.test(description)) || // Chinese
            (language === "ja" && /[\u3040-\u30FF]/.test(description)) || // Japanese
            (language === "ko" && /[\uAC00-\uD7AF]/.test(description)) || // Korean
            (language === "ar" && /[\u0600-\u06FF]/.test(description)) || // Arabic
            (language === "ru" && /[\u0400-\u04FF]/.test(description))
          ) // Russian
        );

      if (needsTranslation) {
        console.log("Translating response to", getLanguagePrompt(language));
        try {
          description = await translateText(description, language);
        } catch (translationError) {
          console.warn(
            "Translation failed, using original response:",
            translationError
          );
          // Continue with the original response if translation fails
        }
      }

      setAiResponse({
        description,
        language,
      });
    } catch (error: unknown) {
      console.error("Analysis error:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      let errorMessage = "Failed to analyze image. ";
      if (error instanceof Error) {
        if (error.message.includes("PERMISSION_DENIED")) {
          errorMessage += "API key error. Please check your API key.";
        } else if (error.message.includes("INVALID_ARGUMENT")) {
          errorMessage += "Invalid image format. Please try a different image.";
        } else if (error.message.includes("404")) {
          errorMessage += "Model not found. Please check model availability.";
        } else if (error.message.includes("Translation failed")) {
          errorMessage += "Failed to translate, showing original response.";
        } else {
          errorMessage += error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAiResponse(null);
    setError(null);
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center py-8 px-4 md:px-8 transition-opacity duration-500",
        isLoaded ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="w-full max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 animate-slide-down">
          <div className="mb-4 md:mb-0">
            <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-2 gradient-text">
              Medical Analysis
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight primary-grad">
              Visual Health Insights
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Upload a medical image and get an AI-powered analysis in your
              preferred language.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px] backdrop-blur-sm border-gradient-animate">
                <Languages className="h-4 w-4 mr-2 text-primary" />
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          {/* Left Column - Image Upload */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-0 glass-morphism shadow-glow">
              <CardContent className="p-6">
                <ImageUploadArea
                  imagePreview={imagePreview}
                  onImageUpload={handleImageUpload}
                  onClearImage={clearImage}
                />

                {error && (
                  <div className="flex items-center mt-4 p-3 bg-destructive/10 text-destructive rounded-lg">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {imagePreview && !loading && !aiResponse && (
                  <Button
                    onClick={analyzeImage}
                    className="w-full mt-4 shadow-sm gradient-button"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Analyze Image
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div>
            <Card className="h-full border-0 glass-morphism shadow-glow overflow-hidden">
              <CardContent className="p-6 h-full">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full gradient-spinner animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                    </div>
                    <p className="mt-6 text-center font-medium">
                      Processing your image
                    </p>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Identifying health insights with AI...
                    </p>
                  </div>
                ) : aiResponse ? (
                  <div className="space-y-4 h-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        <h3 className="text-lg font-medium">
                          Analysis Results
                        </h3>
                      </div>
                      <div className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full gradient-text">
                        {languages.find((l) => l.value === aiResponse.language)
                          ?.label || aiResponse.language}
                      </div>
                    </div>

                    <div className="overflow-y-auto pr-2 max-h-[400px] space-y-2 custom-scrollbar">
                      {aiResponse.description
                        .split("\n\n")
                        .map((paragraph, index) => (
                          <p
                            key={index}
                            className={cn(
                              "py-1.5 text-foreground staggered-fade",
                              paragraph.startsWith("•")
                                ? "pl-3 gradient-border-left"
                                : ""
                            )}
                          >
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <div className="rounded-full mb-4 gradient-circle p-6">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No Analysis Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mt-2">
                      Upload a medical image and click the analyze button to see
                      AI results here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Information */}
        <div className="mt-8 text-xs text-center text-muted-foreground animate-fade-in">
          <p>
            Powered by Google Gemini AI • Medical image analysis for reference
            only • Not a diagnostic tool
          </p>
        </div>
      </div>
    </div>
  );
}

import { Upload, X } from "lucide-react";

interface ImageUploadAreaProps {
  imagePreview: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  className?: string;
}

export function ImageUploadArea({
  imagePreview,
  onImageUpload,
  onClearImage,
  className,
}: ImageUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Create a synthetic event to reuse the upload handler
      const event = {
        target: {
          files,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onImageUpload(event);
    }
  };

  return (
    <div className={cn("w-full transition-all duration-300", className)}>
      {!imagePreview ? (
        <label
          className={cn(
            "image-upload-area flex flex-col items-center justify-center cursor-pointer",
            isDragging ? "border-primary scale-[1.01] bg-secondary/60" : ""
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="bg-primary/10 p-4 rounded-full mb-4 animate-pulse-subtle">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <p className="font-medium text-center">Drag and drop an image</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            or click to browse
          </p>
          <div className="h-px w-16 bg-border my-4"></div>
          <p className="text-xs text-muted-foreground">
            Supports PNG, JPG, JPEG, WEBP up to 10MB
          </p>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onImageUpload}
          />
        </label>
      ) : (
        <div className="relative w-full overflow-hidden rounded-xl animate-scale-in">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-auto rounded-xl transition-transform duration-500 object-contain bg-black/5"
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 rounded-full opacity-80 hover:opacity-100 shadow-lg"
            onClick={onClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initMouseMoveEffect() {
  if (typeof document !== "undefined") {
    document.querySelectorAll(".glass-morphism").forEach((card) => {
      if (card instanceof HTMLElement) {
        card.addEventListener("mousemove", (e) => {
          if (e instanceof MouseEvent) {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
            card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
          }
        });
      }
    });
  }
}
