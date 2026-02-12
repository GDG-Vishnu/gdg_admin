import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { Calendar, CalendarPlus, CalendarCheck, CalendarX } from "lucide-react";

export default function EventsPage() {
  const stats = [
    {
      title: "Total Events",
      value: "48",
      description: "All time events",
      icon: Calendar,
    },
    {
      title: "Upcoming",
      value: "12",
      description: "Next 30 days",
      icon: CalendarPlus,
    },
    {
      title: "Completed",
      value: "32",
      description: "This year",
      icon: CalendarCheck,
    },
    {
      title: "Cancelled",
      value: "4",
      description: "This year",
      icon: CalendarX,
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Events" />

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Event Management
          </h2>
          <p className="text-muted-foreground">
            Organize and manage GDG community events.
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

        {/* Event Details */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest events in your community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Workshop Event</p>
                      <p className="text-xs text-muted-foreground">
                        Scheduled for next week
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next scheduled events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Tech Talk</p>
                      <p className="text-xs text-muted-foreground">
                        Feb 15, 2026
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
