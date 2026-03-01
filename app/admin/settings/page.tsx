import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { Settings, User, Bell, Shield, Database } from "lucide-react";
import { ThemeToggleSwitch } from "@/components/mode-toggle";

export default function SettingsPage() {
  const stats = [
    {
      title: "Account Settings",
      value: "Profile",
      description: "Manage your account",
      icon: User,
    },
    {
      title: "Notifications",
      value: "Enabled",
      description: "Email & push notifications",
      icon: Bell,
    },
    {
      title: "Security",
      value: "2FA On",
      description: "Two-factor authentication",
      icon: Shield,
    },
    {
      title: "Data & Privacy",
      value: "Protected",
      description: "Your data is secure",
      icon: Database,
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Settings" />

      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Application Settings
          </h2>
          <p className="text-muted-foreground">
            Manage your application preferences and configurations.
          </p>
        </div>

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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Quick Settings</CardTitle>
              <CardDescription>
                Frequently used settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Email Notifications", value: "Enabled" },
                  { label: "Auto-save Forms", value: "On" },
                  { label: "Language", value: "English" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
                <ThemeToggleSwitch />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>System Info</CardTitle>
              <CardDescription>Application details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Version", value: "1.0.0" },
                  { label: "Last Updated", value: "Jan 31, 2026" },
                  { label: "Database", value: "Connected" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Database className="h-5 w-5" />
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
