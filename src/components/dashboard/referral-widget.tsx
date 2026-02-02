"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gift, Copy, Check, Users, DollarSign, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ReferralStats {
  totalReferrals: number;
  signedUp: number;
  converted: number;
  totalEarnings: number;
  pendingEarnings: number;
  referralCode: string;
  referralLink: string;
}

export function ReferralWidget() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/referrals");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch referral stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!stats) return;

    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareLink = async () => {
    if (!stats) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join GhostMyData",
          text: "Protect your personal data online. Use my referral link to get $10 off!",
          url: stats.referralLink,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <Card className="border-slate-700 bg-slate-800/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-1/2" />
            <div className="h-8 bg-slate-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800/50 to-emerald-900/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Gift className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-white">Refer & Earn</CardTitle>
            <CardDescription className="text-slate-400">
              Give $10, Get $10 for each friend who subscribes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <Users className="h-4 w-4 text-slate-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{stats.signedUp}</div>
            <div className="text-xs text-slate-500">Signed Up</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <Check className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{stats.converted}</div>
            <div className="text-xs text-slate-500">Converted</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <DollarSign className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-emerald-400">
              ${(stats.totalEarnings / 100).toFixed(0)}
            </div>
            <div className="text-xs text-slate-500">Earned</div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Your referral link</label>
          <div className="flex gap-2">
            <Input
              value={stats.referralLink}
              readOnly
              className="bg-slate-700/50 border-slate-600 text-white text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="border-slate-600 hover:bg-slate-700"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Button */}
        <Button
          onClick={shareLink}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Referral Link
        </Button>

        {/* Pending Earnings */}
        {stats.pendingEarnings > 0 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-400">Pending Rewards</span>
              <span className="font-semibold text-yellow-400">
                ${(stats.pendingEarnings / 100).toFixed(0)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rewards are credited after the first payment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
