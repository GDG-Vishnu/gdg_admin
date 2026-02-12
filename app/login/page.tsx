"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LogIn,
  Loader2,
  Mail,
  Lock,
  Shield,
  Users,
  Calendar,
  Image,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token or session
        localStorage.setItem("authToken", data.token);
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">GDG Admin</h1>
                <p className="text-sm text-white/80">
                  Community Management Portal
                </p>
              </div>
            </div>

            <div className="mt-16 space-y-6">
              <h2 className="text-4xl font-bold leading-tight">
                Welcome to Your
                <br />
                <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Community Hub
                </span>
              </h2>
              <p className="text-lg text-white/90 max-w-md leading-relaxed">
                Manage events, members, and content all in one place. Built for
                community leaders who make a difference.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: "Member Management" },
                { icon: Calendar, label: "Event Planning" },
                { icon: Image, label: "Gallery Control" },
                { icon: Shield, label: "Secure Access" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <feature.icon className="h-5 w-5 text-white/90" />
                  <span className="text-sm font-medium text-white/90">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">GDG Admin</h1>
            </div>
          </div>

          <Card className="border-2 shadow-2xl overflow-hidden">
            {/* Header Section */}
            <CardHeader className="space-y-2 pb-8 pt-8 px-8 bg-gradient-to-b from-muted/30 to-transparent">
              <CardTitle className="text-3xl font-bold tracking-tight text-center">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-base">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin} className="space-y-0">
              {/* Form Fields Section */}
              <CardContent className="px-8 pt-6 pb-6 space-y-6">
                {/* Credentials Group */}
                <div className="space-y-5">
                  {/* Email Input */}
                  <div className="space-y-2.5">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-foreground flex items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email Address
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                        <Mail className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="admin@gdg.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10 h-12 text-base border-2 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-sm font-semibold text-foreground flex items-center gap-1.5"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Password
                      </Label>
                      <button
                        type="button"
                        tabIndex={-1}
                        className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors hover:underline underline-offset-2"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                        <Lock className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10 pr-12 h-12 text-base border-2 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4.5 w-4.5" />
                        ) : (
                          <Eye className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                </div>

                {/* Options Section */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                      className="h-4.5 w-4.5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium text-foreground cursor-pointer select-none"
                    >
                      Remember me
                    </label>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    30 days
                  </span>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-destructive mb-0.5">
                          Authentication Failed
                        </h4>
                        <p className="text-sm text-destructive/90 leading-relaxed">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Action Section */}
              <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-2 bg-gradient-to-t from-muted/20 to-transparent">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2.5 h-5 w-5" />
                      <span>Access Dashboard</span>
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Secured with enterprise-grade encryption</span>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GDG Community. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
