"use client";

import { useState, useCallback } from "react";
import { Upload, X, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UploadedImage {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
}

interface ImageUploaderProps {
  onUploadComplete?: (image: UploadedImage) => void;
}

export function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null,
  );
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadedImage(data);
        onUploadComplete?.(data);
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview("");
    setUploadedImage(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("URL copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      {!uploadedImage ? (
        <>
          <Card
            className={`border-2 border-dashed transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center p-8">
              {!preview ? (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your image here, or
                  </p>
                  <label htmlFor="file-upload">
                    <Button variant="secondary" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-4">
                    Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </>
              ) : (
                <div className="w-full space-y-4">
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleReset}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">{file?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file?.size! / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload to Cloudinary
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <h3 className="font-semibold">Upload Successful!</h3>
            </div>
            <div className="relative">
              <img
                src={uploadedImage.url}
                alt="Uploaded"
                className="max-h-64 mx-auto rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Image URL:</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(uploadedImage.url)}
                >
                  Copy URL
                </Button>
              </div>
              <input
                type="text"
                value={uploadedImage.url}
                readOnly
                className="w-full p-2 text-xs bg-white dark:bg-gray-900 border rounded"
              />
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>Format: {uploadedImage.format.toUpperCase()}</p>
                <p>
                  Size: {uploadedImage.width} x {uploadedImage.height}
                </p>
                <p>File Size: {(uploadedImage.bytes / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <Button onClick={handleReset} variant="outline" className="w-full">
              Upload Another Image
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
