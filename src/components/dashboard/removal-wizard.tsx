"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Circle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Zap,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RemovalStep {
  id: string;
  source: string;
  sourceName: string;
  optOutUrl?: string;
  optOutEmail?: string;
  instructions: string;
  estimatedDays: number;
  subsidiaries: string[];
  subsidiaryCount: number;
  status: "pending" | "in_progress" | "completed" | "skipped";
}

interface RemovalWizardProps {
  onComplete?: () => void;
  onClose?: () => void;
}

export function RemovalWizard({ onComplete, onClose }: RemovalWizardProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [steps, setSteps] = useState<RemovalStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [bulkStats, setBulkStats] = useState<{
    totalPendingExposures: number;
    actionsNeeded: number;
    actionsSaved: number;
    savingsPercent: number;
  } | null>(null);

  useEffect(() => {
    fetchBulkStats();
  }, []);

  const fetchBulkStats = async () => {
    try {
      const response = await fetch("/api/removals/bulk");
      if (response.ok) {
        const data = await response.json();
        setBulkStats(data);

        // Build steps from preview data
        const newSteps: RemovalStep[] = [];

        // Add parent brokers first
        for (const parent of data.preview.parents || []) {
          newSteps.push({
            id: parent.source,
            source: parent.source,
            sourceName: parent.name,
            instructions: "",
            estimatedDays: 7,
            subsidiaries: [],
            subsidiaryCount: parent.subsidiaryCount,
            status: "pending",
          });
        }

        // Add standalone brokers
        for (const broker of data.preview.standalone || []) {
          newSteps.push({
            id: broker.source,
            source: broker.source,
            sourceName: broker.name,
            instructions: "",
            estimatedDays: 7,
            subsidiaries: [],
            subsidiaryCount: 0,
            status: "pending",
          });
        }

        setSteps(newSteps);
      }
    } catch (error) {
      console.error("Failed to fetch bulk stats:", error);
      toast.error("Failed to load removal data");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRemoval = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/removals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "all_parents" }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Successfully submitted ${data.summary.totalProcessed} removal requests covering ${data.summary.totalExposuresCovered} exposures`
        );

        // Mark all steps as completed
        setSteps(prev => prev.map(step => ({ ...step, status: "completed" as const })));

        onComplete?.();
      } else {
        if (data.requiresUpgrade) {
          toast.error("Upgrade to PRO for bulk removal", {
            action: {
              label: "Upgrade",
              onClick: () => window.location.href = "/pricing",
            },
          });
        } else {
          toast.error(data.error || "Failed to process bulk removal");
        }
      }
    } catch {
      toast.error("Failed to submit bulk removal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStepAction = async (step: RemovalStep) => {
    setSubmitting(true);
    try {
      // Find the exposure ID for this source
      const exposureResponse = await fetch(`/api/exposures?source=${step.source}&status=ACTIVE`);
      if (!exposureResponse.ok) throw new Error("Failed to find exposure");

      const exposureData = await exposureResponse.json();
      const exposure = exposureData.exposures?.[0];

      if (!exposure) {
        toast.error("No pending exposure found for this broker");
        return;
      }

      // Request removal
      const response = await fetch("/api/removals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId: exposure.id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);

        // Update step status
        setSteps(prev =>
          prev.map(s =>
            s.id === step.id ? { ...s, status: "completed" as const } : s
          )
        );

        // Move to next step
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        }
      } else {
        toast.error(data.error || "Failed to submit removal");
      }
    } catch {
      toast.error("Failed to process removal");
    } finally {
      setSubmitting(false);
    }
  };

  const completedSteps = steps.filter(s => s.status === "completed").length;
  const progressPercent = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  const currentStep = steps[currentStepIndex];

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-400" />
              Removal Wizard
            </CardTitle>
            <CardDescription className="text-slate-400">
              Complete your data removal in the most efficient way
            </CardDescription>
          </div>
          {bulkStats && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Layers className="h-3 w-3 mr-1" />
              {bulkStats.actionsSaved} actions saved ({bulkStats.savingsPercent}%)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Progress</span>
            <span className="text-white">{completedSteps} of {steps.length} completed</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-slate-700" />
        </div>

        {/* Bulk Action Button */}
        {completedSteps === 0 && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  One-Click Bulk Removal
                </h4>
                <p className="text-sm text-slate-400 mt-1">
                  Submit all {bulkStats?.actionsNeeded || steps.length} removal requests at once,
                  covering {bulkStats?.totalPendingExposures || 0} total exposures
                </p>
              </div>
              <Button
                onClick={handleBulkRemoval}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Remove All
              </Button>
            </div>
          </div>
        )}

        {/* Step-by-Step View */}
        {steps.length > 0 && completedSteps < steps.length && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-400">Or complete step-by-step:</h4>

            {/* Current Step */}
            {currentStep && (
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-blue-500/20 text-blue-400"
                    )}>
                      {currentStep.status === "completed" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        currentStepIndex + 1
                      )}
                    </div>
                    <div>
                      <h5 className="text-white font-medium">{currentStep.sourceName}</h5>
                      {currentStep.subsidiaryCount > 0 && (
                        <p className="text-xs text-emerald-400 mt-1">
                          +{currentStep.subsidiaryCount} sites included
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleStepAction(currentStep)}
                    disabled={submitting || currentStep.status === "completed"}
                    size="sm"
                    className={cn(
                      currentStep.status === "completed"
                        ? "bg-emerald-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : currentStep.status === "completed" ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Done
                      </>
                    ) : (
                      <>
                        Submit Removal
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
                className="text-slate-400"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={currentStepIndex === steps.length - 1}
                className="text-slate-400"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Step List Overview */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(index)}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors",
                    index === currentStepIndex
                      ? "bg-slate-600/50 border border-slate-500"
                      : "bg-slate-700/30 hover:bg-slate-700/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {step.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-500" />
                    )}
                    <span className={cn(
                      "text-sm",
                      step.status === "completed" ? "text-slate-400" : "text-white"
                    )}>
                      {step.sourceName}
                    </span>
                  </div>
                  {step.subsidiaryCount > 0 && (
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      +{step.subsidiaryCount}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Completion State */}
        {completedSteps === steps.length && steps.length > 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">All Removals Submitted!</h4>
            <p className="text-slate-400 mb-4">
              Your removal requests have been submitted. Most brokers process removals within 7-14 days.
            </p>
            <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700">
              Done
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
