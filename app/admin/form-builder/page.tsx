import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { FileText, FilePlus, FileCheck, FileEdit } from "lucide-react";

export default function FormBuilderPage() {
  const stats = [
    {
      title: "Total Forms",
      value: "24",
      description: "All created forms",
      icon: FileText,
    },
    {
      title: "Active Forms",
      value: "18",
      description: "Currently accepting responses",
      icon: FilePlus,
    },
    {
      title: "Responses",
      value: "1,432",
      description: "Total submissions",
      icon: FileCheck,
    },
    {
      title: "Draft Forms",
      value: "6",
      description: "Not yet published",
      icon: FileEdit,
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Form Builder" />

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Form Builder</h2>
          <p className="text-muted-foreground">
            Create and manage custom forms for your community.
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

        {/* Forms List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Forms</CardTitle>
              <CardDescription>Your recently created forms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        Event Registration Form
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created 2 days ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Form Templates</CardTitle>
              <CardDescription>Quick start templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Event Registration", value: "45 uses" },
                  { label: "Feedback Survey", value: "32 uses" },
                  { label: "Contact Form", value: "28 uses" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <FileText className="h-5 w-5" />
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
