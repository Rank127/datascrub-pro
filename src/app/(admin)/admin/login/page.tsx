"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      // Check if user has admin access
      const response = await fetch("/api/admin/executive-stats");
      if (response.status === 403) {
        setError("Access denied. Admin privileges required.");
        await signIn("credentials", { redirect: false }); // Sign out
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-emerald-500/10 rounded-full">
              <Shield className="h-10 w-10 text-emerald-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Admin Portal
          </CardTitle>
          <p className="text-slate-400 text-sm">
            GhostMyData Executive Dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ghostmydata.com"
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Authorized personnel only
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
