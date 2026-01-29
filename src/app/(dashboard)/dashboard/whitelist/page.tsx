"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Plus,
  Loader2,
  ExternalLink,
  ListChecks,
  ShieldOff,
} from "lucide-react";
import { DataSourceNames, type DataSource } from "@/lib/types";

interface WhitelistItem {
  id: string;
  source: DataSource;
  sourceUrl: string | null;
  sourceName: string;
  reason: string | null;
  createdAt: string;
}

export default function WhitelistPage() {
  const [whitelist, setWhitelist] = useState<WhitelistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [source, setSource] = useState<string>("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchWhitelist();
  }, []);

  const fetchWhitelist = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/whitelist");
      if (response.ok) {
        const data = await response.json();
        setWhitelist(data.whitelist);
      }
    } catch (error) {
      console.error("Failed to fetch whitelist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!source || !sourceName) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          sourceName,
          sourceUrl: sourceUrl || undefined,
          reason: reason || undefined,
        }),
      });

      if (response.ok) {
        fetchWhitelist();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to add to whitelist:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/whitelist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchWhitelist();
      }
    } catch (error) {
      console.error("Failed to remove from whitelist:", error);
    }
  };

  const resetForm = () => {
    setSource("");
    setSourceName("");
    setSourceUrl("");
    setReason("");
  };

  const sourceOptions = Object.entries(DataSourceNames).map(([key, name]) => ({
    value: key,
    label: name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Whitelist</h1>
          <p className="text-slate-400">
            Accounts and services you want to keep - excluded from removal
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Add to Whitelist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add to Whitelist</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add an account or service you want to protect from removal requests
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="source" className="text-slate-200">
                  Source Type
                </Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600">
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {sourceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceName" className="text-slate-200">
                  Account/Profile Name
                </Label>
                <Input
                  id="sourceName"
                  placeholder="e.g., My LinkedIn Profile"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceUrl" className="text-slate-200">
                  URL (Optional)
                </Label>
                <Input
                  id="sourceUrl"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-slate-200">
                  Reason (Optional)
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Why do you want to keep this account?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white resize-none"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting || !source || !sourceName}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add to Whitelist"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="bg-emerald-500/10 border-emerald-500/20">
        <CardContent className="flex items-start gap-4 pt-6">
          <Shield className="h-6 w-6 text-emerald-500 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-emerald-400">
              What is the whitelist?
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              The whitelist contains accounts and services you want to keep. When
              you add something to the whitelist, we won&apos;t send removal requests
              for it. Use this for your active social media accounts or services
              you still use.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Whitelist Items */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ListChecks className="h-5 w-5 text-emerald-500" />
            Whitelisted Items
          </CardTitle>
          <CardDescription className="text-slate-400">
            {whitelist.length} items protected from removal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : whitelist.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300">
                No whitelisted items
              </h3>
              <p className="text-slate-500 mt-1">
                Add accounts you want to protect from removal
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {whitelist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Shield className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {item.sourceName}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-slate-600/50 border-0 text-slate-300"
                        >
                          {DataSourceNames[item.source] || item.source}
                        </Badge>
                      </div>
                      {item.reason && (
                        <p className="text-sm text-slate-400 mt-1">
                          {item.reason}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.sourceUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-white"
                        asChild
                      >
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-slate-400 border-slate-600 hover:text-orange-400 hover:border-orange-400/50"
                      onClick={() => handleDelete(item.id)}
                      title="Remove from whitelist - this item will become active again"
                    >
                      <ShieldOff className="h-4 w-4 mr-1" />
                      Unprotect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
