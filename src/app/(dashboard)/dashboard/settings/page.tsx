"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Loader2,
  Save,
  Crown,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Account settings
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newExposureAlerts, setNewExposureAlerts] = useState(true);
  const [removalUpdates, setRemovalUpdates] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleSaveAccount = async () => {
    setIsLoading(true);
    // TODO: Implement account update
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  // Mock plan data
  const currentPlan: string = "FREE";
  const plans = [
    {
      name: "FREE",
      price: "$0",
      features: ["1 scan/month", "Basic exposure report", "Manual removal guides"],
      current: currentPlan === "FREE",
    },
    {
      name: "PRO",
      price: "$9.99",
      features: [
        "10 scans/month",
        "Automated removals",
        "Weekly monitoring",
        "Priority support",
      ],
      current: currentPlan === "PRO",
      recommended: true,
    },
    {
      name: "ENTERPRISE",
      price: "$29.99",
      features: [
        "Unlimited scans",
        "Dark web monitoring",
        "Family plan (5 profiles)",
        "Daily monitoring",
        "API access",
      ],
      current: currentPlan === "ENTERPRISE",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Settings */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-emerald-500" />
            Account Settings
          </CardTitle>
          <CardDescription className="text-slate-400">
            Update your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveAccount}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5 text-emerald-500" />
            Notification Settings
          </CardTitle>
          <CardDescription className="text-slate-400">
            Control how and when we notify you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-200">Email Notifications</Label>
              <p className="text-sm text-slate-500">
                Receive notifications via email
              </p>
            </div>
            <Checkbox
              checked={emailNotifications}
              onCheckedChange={(checked) =>
                setEmailNotifications(checked as boolean)
              }
              className="border-slate-600 data-[state=checked]:bg-emerald-600"
            />
          </div>
          <Separator className="bg-slate-700" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">New Exposure Alerts</Label>
                <p className="text-sm text-slate-500">
                  Get notified when new exposures are found
                </p>
              </div>
              <Checkbox
                checked={newExposureAlerts}
                onCheckedChange={(checked) =>
                  setNewExposureAlerts(checked as boolean)
                }
                disabled={!emailNotifications}
                className="border-slate-600 data-[state=checked]:bg-emerald-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Removal Updates</Label>
                <p className="text-sm text-slate-500">
                  Updates on your removal request status
                </p>
              </div>
              <Checkbox
                checked={removalUpdates}
                onCheckedChange={(checked) =>
                  setRemovalUpdates(checked as boolean)
                }
                disabled={!emailNotifications}
                className="border-slate-600 data-[state=checked]:bg-emerald-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Weekly Reports</Label>
                <p className="text-sm text-slate-500">
                  Receive a weekly summary of your data protection status
                </p>
              </div>
              <Checkbox
                checked={weeklyReports}
                onCheckedChange={(checked) =>
                  setWeeklyReports(checked as boolean)
                }
                disabled={!emailNotifications}
                className="border-slate-600 data-[state=checked]:bg-emerald-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Marketing Emails</Label>
                <p className="text-sm text-slate-500">
                  Product updates and promotional offers
                </p>
              </div>
              <Checkbox
                checked={marketingEmails}
                onCheckedChange={(checked) =>
                  setMarketingEmails(checked as boolean)
                }
                disabled={!emailNotifications}
                className="border-slate-600 data-[state=checked]:bg-emerald-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            Subscription
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-4 rounded-lg border ${
                  plan.current
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700 bg-slate-700/30"
                }`}
              >
                {plan.recommended && !plan.current && (
                  <Badge className="absolute -top-2 -right-2 bg-emerald-500">
                    Recommended
                  </Badge>
                )}
                {plan.current && (
                  <Badge className="absolute -top-2 -right-2 bg-blue-500">
                    Current
                  </Badge>
                )}
                <div className="flex items-center gap-2 mb-2">
                  {plan.name !== "FREE" && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                </div>
                <p className="text-2xl font-bold text-white mb-4">
                  {plan.price}
                  <span className="text-sm font-normal text-slate-400">
                    /month
                  </span>
                </p>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    size="sm"
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-emerald-500" />
            Security
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage your security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Change Password</h4>
              <p className="text-sm text-slate-400">
                Update your account password
              </p>
            </div>
            <Button variant="outline" className="border-slate-600">
              Change
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Two-Factor Authentication</h4>
              <p className="text-sm text-slate-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" className="border-slate-600">
              Enable
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
            <div>
              <h4 className="font-medium text-red-400">Delete Account</h4>
              <p className="text-sm text-slate-400">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
