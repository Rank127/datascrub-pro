"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
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
  User,
  Bell,
  Shield,
  CreditCard,
  Loader2,
  Save,
  Crown,
  Check,
  ExternalLink,
  CheckCircle,
  XCircle,
  Smartphone,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";
import { FamilySection } from "@/components/dashboard/family";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { TwoFactorSetupDialog } from "@/components/settings/two-factor-setup-dialog";
import { TwoFactorDisableDialog } from "@/components/settings/two-factor-disable-dialog";

// Wrapper component to handle Suspense for useSearchParams
export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const { plan: currentPlan, currentPeriodEnd, hasStripeSubscription } = useSubscription();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Account settings
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newExposureAlerts, setNewExposureAlerts] = useState(true);
  const [removalUpdates, setRemovalUpdates] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [reportFrequency, setReportFrequency] = useState("weekly");
  const [notificationLoading, setNotificationLoading] = useState(false);


  // Security section
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
  const [twoFactorDisableOpen, setTwoFactorDisableOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(true);

  // Fetch 2FA status
  const fetch2FAStatus = async () => {
    setTwoFactorLoading(true);
    try {
      const response = await fetch("/api/account/2fa");
      if (response.ok) {
        const data = await response.json();
        setTwoFactorEnabled(data.enabled);
      }
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Fetch notification preferences
  const fetchNotificationPrefs = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setEmailNotifications(data.emailNotifications ?? true);
        setNewExposureAlerts(data.newExposureAlerts ?? true);
        setRemovalUpdates(data.removalUpdates ?? true);
        setWeeklyReports(data.weeklyReports ?? true);
        setMarketingEmails(data.marketingEmails ?? false);
        setReportFrequency(data.reportFrequency ?? "weekly");
      }
    } catch (error) {
      console.error("Failed to fetch notification preferences:", error);
    }
  };

  // Save notification preferences
  const handleSaveNotifications = async () => {
    setNotificationLoading(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications,
          newExposureAlerts,
          removalUpdates,
          weeklyReports,
          marketingEmails,
          reportFrequency,
        }),
      });
      if (response.ok) {
        setMessage({ type: "success", text: "Notification preferences saved!" });
      } else {
        setMessage({ type: "error", text: "Failed to save notification preferences." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save notification preferences." });
    } finally {
      setNotificationLoading(false);
    }
  };


  // Check for success/canceled URL params from Stripe redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setMessage({ type: "success", text: "Your subscription has been activated successfully!" });
    } else if (searchParams.get("canceled") === "true") {
      setMessage({ type: "error", text: "Checkout was canceled. No charges were made." });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchNotificationPrefs();
    fetch2FAStatus();
  }, []);

  const handleSaveAccount = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        setMessage({ type: "success", text: "Account updated successfully!" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update account." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan: "PRO" | "ENTERPRISE") => {
    setUpgradeLoading(plan);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to start checkout" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect to payment service" });
    } finally {
      setUpgradeLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to open billing portal" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect to billing portal" });
    } finally {
      setPortalLoading(false);
    }
  };

  const plans = [
    {
      name: "FREE",
      price: "$0",
      originalPrice: null,
      features: ["10 scans/month", "Basic exposure report", "Manual removal guides"],
      current: currentPlan === "FREE",
      sale: false,
    },
    {
      name: "PRO",
      price: "$11.99",
      originalPrice: "$19.99",
      features: [
        "50 scans/month",
        "Automated removals",
        "Weekly monitoring",
        "Priority support",
      ],
      current: currentPlan === "PRO",
      recommended: currentPlan === "FREE", // Only recommend Pro to Free users
      sale: true,
    },
    {
      name: "ENTERPRISE",
      price: "$29.99",
      originalPrice: "$49.99",
      features: [
        "Unlimited scans",
        "Dark web monitoring",
        "Family plan (5 profiles)",
        "Daily monitoring",
        "API access",
      ],
      current: currentPlan === "ENTERPRISE",
      recommended: currentPlan === "PRO", // Recommend Enterprise to Pro users
      sale: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

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
                disabled
                className="bg-slate-700/50 border-slate-600 text-white opacity-60"
              />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
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
          <Separator className="bg-slate-700" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Report Frequency</Label>
                <p className="text-sm text-slate-500">
                  How often to receive summary reports
                </p>
              </div>
              <select
                value={reportFrequency}
                onChange={(e) => setReportFrequency(e.target.value)}
                disabled={!emailNotifications || !weeklyReports}
                className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div className="pt-4">
            <Button
              onClick={handleSaveNotifications}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={notificationLoading}
            >
              {notificationLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications - Coming Soon */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Smartphone className="h-5 w-5 text-emerald-500" />
                SMS Notifications
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 ml-2">
                  Coming Soon
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Get instant text alerts for critical updates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">
                  SMS Notifications Coming Soon
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  We&apos;re working on bringing you instant text alerts for critical security events. This feature will be available for Enterprise users in an upcoming release.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-blue-400" />
                    Real-time exposure alerts
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-blue-400" />
                    Urgent data breach alerts
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-blue-400" />
                    US phone numbers supported
                  </li>
                </ul>
                <p className="text-xs text-slate-500">
                  Enterprise subscribers will be notified when this feature launches.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Subscription */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                Subscription
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage your subscription and billing
              </CardDescription>
            </div>
            {currentPlan !== "FREE" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="border-slate-600"
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Billing
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentPeriodEnd && currentPlan !== "FREE" && (
            <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
              <p className="text-sm text-slate-300">
                Current period ends:{" "}
                <span className="text-white font-medium">
                  {new Date(currentPeriodEnd).toLocaleDateString()}
                </span>
              </p>
            </div>
          )}
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
                {plan.sale && !plan.current && !plan.recommended && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500">
                    40% OFF
                  </Badge>
                )}
                <div className="flex items-center gap-2 mb-2">
                  {plan.name !== "FREE" && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  {plan.sale && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                      40% OFF
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  {plan.originalPrice && (
                    <span className="text-sm text-slate-500 line-through mr-2">{plan.originalPrice}</span>
                  )}
                  <span className="text-2xl font-bold text-white">
                    {plan.price}
                    <span className="text-sm font-normal text-slate-400">
                      /month
                    </span>
                  </span>
                </div>
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
                {!plan.current && plan.name !== "FREE" && (
                  // Only show upgrade button if this plan is higher than current plan
                  (currentPlan === "FREE" || (currentPlan === "PRO" && plan.name === "ENTERPRISE"))
                ) && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    size="sm"
                    onClick={() => handleUpgrade(plan.name as "PRO" | "ENTERPRISE")}
                    disabled={upgradeLoading === plan.name}
                  >
                    {upgradeLoading === plan.name ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Upgrade"
                    )}
                  </Button>
                )}
                {plan.current && plan.name !== "FREE" && (
                  <Button
                    variant="outline"
                    className="w-full border-slate-600"
                    size="sm"
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                  >
                    Manage
                  </Button>
                )}
              </div>
            ))}
          </div>

        </CardContent>
      </Card>

      {/* Family Plan */}
      <FamilySection />

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
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Change Password</h4>
                <p className="text-sm text-slate-400">
                  Update your account password
                </p>
              </div>
              <Button
                variant="outline"
                className="border-slate-600"
                onClick={() => setPasswordDialogOpen(true)}
              >
                Change
              </Button>
            </div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                    {twoFactorLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : twoFactorEnabled ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Enabled
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              {!twoFactorLoading && (
                twoFactorEnabled ? (
                  <Button
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    onClick={() => setTwoFactorDisableOpen(true)}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="border-slate-600"
                    onClick={() => setTwoFactorSetupOpen(true)}
                  >
                    Enable
                  </Button>
                )
              )}
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
            <div>
              <h4 className="font-medium text-red-400">Delete Account</h4>
              <p className="text-sm text-slate-400">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete your account? This action cannot be undone. Please email support@ghostmydata.com to proceed with account deletion.")) {
                  window.location.href = `mailto:support@ghostmydata.com?subject=Account%20Deletion%20Request&body=Hi%20GhostMyData%20Support%2C%0A%0AI%20would%20like%20to%20delete%20my%20account.%0A%0AAccount%20Email%3A%20${encodeURIComponent(email)}%0A%0AThank%20you.`;
                }
              }}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Dialogs */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
      <TwoFactorSetupDialog
        open={twoFactorSetupOpen}
        onOpenChange={setTwoFactorSetupOpen}
        onComplete={() => {
          setTwoFactorEnabled(true);
          setMessage({ type: "success", text: "Two-factor authentication enabled successfully!" });
        }}
      />
      <TwoFactorDisableDialog
        open={twoFactorDisableOpen}
        onOpenChange={setTwoFactorDisableOpen}
        onComplete={() => {
          setTwoFactorEnabled(false);
          setMessage({ type: "success", text: "Two-factor authentication disabled." });
        }}
      />
    </div>
  );
}
