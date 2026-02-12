"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { Link2, Upload, Copy, CheckCircle, ExternalLink } from "lucide-react";
import { ImageUploader } from "@/components/admin/forms/ImageUploader";
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

interface CloudinaryResource {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
}

export default function ImageToUrlPage() {
  const [recentUploads, setRecentUploads] = useState<CloudinaryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalUploads: 0,
    thisMonth: 0,
    totalStorage: 0,
  });

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  const fetchRecentUploads = async () => {
    try {
      const response = await fetch("/api/upload");
      const data = await response.json();

      if (data.success) {
        setRecentUploads(data.resources);

        // Calculate stats
        const total = data.resources.length;
        const totalBytes = data.resources.reduce(
          (acc: number, resource: CloudinaryResource) => acc + resource.bytes,
          0,
        );

        // Calculate this month's uploads
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthCount = data.resources.filter(
          (resource: CloudinaryResource) => {
            const uploadDate = new Date(resource.created_at);
            return (
              uploadDate.getMonth() === currentMonth &&
              uploadDate.getFullYear() === currentYear
            );
          },
        ).length;

        setTotalStats({
          totalUploads: total,
          thisMonth: thisMonthCount,
          totalStorage: totalBytes,
        });
      }
    } catch (error) {
      console.error("Failed to fetch uploads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (image: UploadedImage) => {
    // Refresh the list
    fetchRecentUploads();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const stats = [
    {
      title: "Total Uploads",
      value: loading ? "..." : totalStats.totalUploads.toString(),
      description: "All time uploads",
      icon: Upload,
    },
    {
      title: "This Month",
      value: loading ? "..." : totalStats.thisMonth.toString(),
      description: "Images uploaded",
      icon: Link2,
    },
    {
      title: "URLs Generated",
      value: loading ? "..." : totalStats.totalUploads.toString(),
      description: "Successfully created",
      icon: CheckCircle,
    },
    {
      title: "Total Storage",
      value: loading ? "..." : formatBytes(totalStats.totalStorage),
      description: "Space used",
      icon: Copy,
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Image to URL" />

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Image to URL Converter
          </h2>
          <p className="text-muted-foreground">
            Upload images and generate shareable URLs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Upload Details */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Upload Area */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Upload your image to Cloudinary and get a shareable URL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>

          {/* Recent Uploads */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>Your recently uploaded images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : recentUploads.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No uploads yet. Upload your first image!
                  </p>
                ) : (
                  recentUploads.slice(0, 5).map((upload) => (
                    <div
                      key={upload.public_id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <img
                        src={upload.secure_url}
                        alt={upload.public_id}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {upload.public_id.split("/").pop()}.{upload.format}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(upload.created_at)} •{" "}
                          {formatBytes(upload.bytes)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(upload.secure_url)}
                            className="h-7 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="h-7 text-xs"
                          >
                            <a
                              href={upload.secure_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Uploads Gallery */}
        {!loading && recentUploads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All Uploads</CardTitle>
              <CardDescription>
                View and manage all your uploaded images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentUploads.map((upload) => (
                  <div
                    key={upload.public_id}
                    className="group relative aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors"
                  >
                    <img
                      src={upload.secure_url}
                      alt={upload.public_id}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(upload.secure_url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" asChild>
                        <a
                          href={upload.secure_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">
                        {upload.width} x {upload.height}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
