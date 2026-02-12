import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { Image, ImagePlus, Folder, Heart } from "lucide-react";

export default function GalleryPage() {
  const stats = [
    {
      title: "Total Images",
      value: "542",
      description: "In your gallery",
      icon: Image,
    },
    {
      title: "Albums",
      value: "24",
      description: "Organized collections",
      icon: Folder,
    },
    {
      title: "New This Month",
      value: "86",
      description: "Recently added",
      icon: ImagePlus,
    },
    {
      title: "Favorites",
      value: "128",
      description: "Liked images",
      icon: Heart,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background ">
        <h1 className="text-xl font-semibold">Gallery</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gallery Management
          </h2>
          <p className="text-muted-foreground">
            Manage and organize your community event photos.
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

        {/* Gallery Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>
                Latest images added to the gallery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <Image className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Event Photo Album</p>
                      <p className="text-xs text-muted-foreground">
                        12 images • Added 2 days ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Popular Albums</CardTitle>
              <CardDescription>Most viewed albums</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "DevFest 2026", value: "234 views" },
                  { label: "Workshop Series", value: "189 views" },
                  { label: "Team Photos", value: "156 views" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
