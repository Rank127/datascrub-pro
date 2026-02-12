"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Loader2, Check, Lock, Users } from "lucide-react";
import { trackSignUp } from "@/components/analytics/google-analytics";
import { trackEvents } from "@/components/analytics/retargeting-pixels";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const discount = searchParams?.get("discount");
  const referralCode = searchParams?.get("ref");
  const callbackUrl = searchParams?.get("callbackUrl");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    // For now, show coming soon message
    setError("Google sign-in coming soon! Please use email registration.");
  };

  const handleAppleSignIn = () => {
    // TODO: Implement Apple OAuth
    setError("Apple sign-in coming soon! Please use email registration.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, referralCode: referralCode || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Track successful sign up
      trackSignUp("email");
      trackEvents.completeRegistration();

      // Redirect to login with success message, preserving callbackUrl for family invitations
      const loginUrl = callbackUrl
        ? `/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/login?registered=true";
      router.push(loginUrl);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "Find your exposed personal data",
    "Automated removal requests",
    "Continuous monitoring",
  ];

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <Shield className="h-6 w-6 text-emerald-500" />
        </div>
        <CardTitle className="text-2xl text-white">Create your account</CardTitle>
        <CardDescription className="text-slate-400">
          Start protecting your personal data today
        </CardDescription>
        {discount === "EXIT50" && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full border border-emerald-500/30">
            <span className="text-sm font-semibold text-emerald-400">
              50% OFF Applied!
            </span>
          </div>
        )}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-600 bg-white hover:bg-slate-100 text-slate-900"
              onClick={handleGoogleSignIn}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-600 bg-black hover:bg-slate-900 text-white"
              onClick={handleAppleSignIn}
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-slate-500">Or continue with email</span>
            </div>
          </div>

          <div className="mb-4 space-y-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="h-4 w-4 text-emerald-500" />
                {feature}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              className="border-slate-600 data-[state=checked]:bg-emerald-600"
            />
            <label htmlFor="terms" className="text-sm text-slate-400">
              I agree to the{" "}
              <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">
                Privacy Policy
              </Link>
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </p>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-700 mt-4">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Lock className="h-3 w-3" />
              256-bit SSL
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Shield className="h-3 w-3" />
              SOC 2 Certified
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="h-3 w-3" />
              50K+ Users
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <Shield className="h-6 w-6 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl text-white">Create your account</CardTitle>
          <CardDescription className="text-slate-400">
            Loading...
          </CardDescription>
        </CardHeader>
      </Card>
    }>
      <RegisterForm />
    </Suspense>
  );
}
