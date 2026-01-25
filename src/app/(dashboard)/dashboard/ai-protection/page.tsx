"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExposureCard } from "@/components/dashboard/exposure-card";
import {
  Bot,
  Scan,
  Mic,
  Shield,
  Lock,
  ExternalLink,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { trackRemovalRequested, trackManualReviewCompleted } from "@/components/analytics/google-analytics";
import type { DataSource, Severity, ExposureStatus, ExposureType } from "@/lib/types";

// AI Protection source categories
const AI_TRAINING_SOURCES = [
  "SPAWNING_AI", "LAION_AI", "STABILITY_AI", "OPENAI", "MIDJOURNEY", "META_AI",
  "GOOGLE_AI", "LINKEDIN_AI", "ADOBE_AI", "AMAZON_AI"
];
const FACIAL_RECOGNITION_SOURCES = [
  "CLEARVIEW_AI", "PIMEYES", "FACECHECK_ID", "SOCIAL_CATFISH", "TINEYE", "YANDEX_IMAGES"
];
const VOICE_CLONING_SOURCES = ["ELEVENLABS", "RESEMBLE_AI", "MURF_AI"];

interface AIExposure {
  id: string;
  source: DataSource;
  sourceUrl: string | null;
  sourceName: string;
  dataType: ExposureType;
  dataPreview: string | null;
  severity: Severity;
  status: ExposureStatus;
  isWhitelisted: boolean;
  firstFoundAt: string;
  requiresManualAction: boolean;
  manualActionTaken: boolean;
}

interface AIStats {
  total: number;
  aiTraining: number;
  facialRecognition: number;
  voiceCloning: number;
  optedOut: number;
  pending: number;
}

interface AIProtectionData {
  stats: AIStats;
  exposures: {
    aiTraining: AIExposure[];
    facialRecognition: AIExposure[];
    voiceCloning: AIExposure[];
  };
  userPlan: string;
}

// AI Service info for display
const AI_SERVICES = {
  // AI Training
  SPAWNING_AI: { name: "Spawning AI (Do Not Train)", description: "Universal Do-Not-Train registry honored by major AI companies", icon: Bot, color: "blue" },
  LAION_AI: { name: "LAION AI Dataset", description: "Request removal from LAION-5B dataset", icon: Bot, color: "blue" },
  STABILITY_AI: { name: "Stability AI", description: "Opt out of Stable Diffusion training", icon: Bot, color: "blue" },
  OPENAI: { name: "OpenAI", description: "Request data deletion from OpenAI models", icon: Bot, color: "blue" },
  MIDJOURNEY: { name: "Midjourney", description: "Opt out of Midjourney image training", icon: Bot, color: "blue" },
  META_AI: { name: "Meta AI", description: "Opt out of Meta AI training for FB/Instagram", icon: Bot, color: "blue" },
  GOOGLE_AI: { name: "Google AI", description: "Manage Google AI training settings", icon: Bot, color: "blue" },
  LINKEDIN_AI: { name: "LinkedIn AI", description: "Opt out of LinkedIn AI training", icon: Bot, color: "blue" },
  ADOBE_AI: { name: "Adobe Firefly/AI", description: "Adobe AI training opt-out", icon: Bot, color: "blue" },
  AMAZON_AI: { name: "Amazon AI", description: "Opt out of Amazon AI improvements", icon: Bot, color: "blue" },
  // Facial Recognition
  CLEARVIEW_AI: { name: "Clearview AI", description: "Remove face from law enforcement database", icon: Scan, color: "orange" },
  PIMEYES: { name: "PimEyes", description: "Remove face from search results", icon: Scan, color: "orange" },
  FACECHECK_ID: { name: "FaceCheck.ID", description: "Opt out of facial matching", icon: Scan, color: "orange" },
  SOCIAL_CATFISH: { name: "Social Catfish", description: "Remove from identity search", icon: Scan, color: "orange" },
  TINEYE: { name: "TinEye", description: "Request image removal", icon: Scan, color: "orange" },
  YANDEX_IMAGES: { name: "Yandex Images", description: "Remove from Yandex image search", icon: Scan, color: "orange" },
  // Voice Cloning
  ELEVENLABS: { name: "ElevenLabs", description: "Request voice sample removal", icon: Mic, color: "pink" },
  RESEMBLE_AI: { name: "Resemble AI", description: "Remove voice data", icon: Mic, color: "pink" },
  MURF_AI: { name: "Murf AI", description: "Opt out of voice training", icon: Mic, color: "pink" },
};

export default function AIProtectionPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AIProtectionData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAIProtectionData();
  }, []);

  const fetchAIProtectionData = async () => {
    try {
      const response = await fetch("/api/ai-protection");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch AI protection data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptOut = async (exposureId: string) => {
    try {
      const allExposures = [
        ...(data?.exposures.aiTraining || []),
        ...(data?.exposures.facialRecognition || []),
        ...(data?.exposures.voiceCloning || []),
      ];
      const exposure = allExposures.find(e => e.id === exposureId);
      const response = await fetch("/api/removals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId }),
      });

      if (response.ok) {
        // Track AI removal request
        if (exposure) {
          trackRemovalRequested(exposure.sourceName, exposure.dataType);
        }
        toast.success("Opt-out request submitted");
        fetchAIProtectionData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to submit opt-out request");
      }
    } catch (error) {
      toast.error("Failed to submit opt-out request");
    }
  };

  const handleMarkDone = async (exposureId: string) => {
    try {
      const allExposures = [
        ...(data?.exposures.aiTraining || []),
        ...(data?.exposures.facialRecognition || []),
        ...(data?.exposures.voiceCloning || []),
      ];
      const exposure = allExposures.find(e => e.id === exposureId);
      const response = await fetch("/api/exposures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId, action: "markDone" }),
      });

      if (response.ok) {
        // Track AI manual review completion
        if (exposure) {
          trackManualReviewCompleted(exposure.sourceName);
        }
        toast.success("Marked as done");
        fetchAIProtectionData();
      }
    } catch (error) {
      toast.error("Failed to mark as done");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const isEnterprise = data?.userPlan === "ENTERPRISE";
  const stats = data?.stats || { total: 0, aiTraining: 0, facialRecognition: 0, voiceCloning: 0, optedOut: 0, pending: 0 };

  // Non-Enterprise view
  if (!isEnterprise) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bot className="h-7 w-7 text-purple-400" />
            AI Shield
          </h1>
          <p className="text-slate-400 mt-1">
            Protect yourself from AI training datasets, facial recognition, and voice cloning
          </p>
        </div>

        {/* Upgrade CTA */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900 border-purple-500/30">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-purple-500/20 rounded-full">
                <Lock className="h-12 w-12 text-purple-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-white mb-2">
                  Enterprise Feature
                </h2>
                <p className="text-slate-300 max-w-xl">
                  AI Shield scans 50+ sources including AI training datasets,
                  facial recognition databases, and voice cloning services to protect your
                  identity from unauthorized AI use.
                </p>
              </div>
              <Link href="/pricing">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Upgrade to Enterprise
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Feature Preview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Bot className="h-5 w-5 text-blue-400" />
                </div>
                <CardTitle className="text-white">AI Training Datasets</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                Check if your images or data are being used to train AI models without consent.
              </p>
              <div className="space-y-2">
                {AI_TRAINING_SOURCES.slice(0, 5).map(source => (
                  <div key={source} className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {AI_SERVICES[source as keyof typeof AI_SERVICES]?.name || source}
                  </div>
                ))}
                <div className="text-xs text-slate-600">+{AI_TRAINING_SOURCES.length - 5} more</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Scan className="h-5 w-5 text-orange-400" />
                </div>
                <CardTitle className="text-white">Facial Recognition</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                Remove your face from facial recognition databases used for surveillance.
              </p>
              <div className="space-y-2">
                {FACIAL_RECOGNITION_SOURCES.map(source => (
                  <div key={source} className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    {AI_SERVICES[source as keyof typeof AI_SERVICES]?.name || source}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Mic className="h-5 w-5 text-pink-400" />
                </div>
                <CardTitle className="text-white">Voice Cloning</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                Protect your voice from being cloned for deepfake audio and fraud.
              </p>
              <div className="space-y-2">
                {VOICE_CLONING_SOURCES.map(source => (
                  <div key={source} className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    {AI_SERVICES[source as keyof typeof AI_SERVICES]?.name || source}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why It Matters */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Why AI Protection Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Deepfake Risk</h4>
                  <p className="text-sm text-slate-400">
                    Your face and voice can be used to create convincing deepfakes for fraud,
                    identity theft, or harassment.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Unauthorized Training</h4>
                  <p className="text-sm text-slate-400">
                    AI companies scrape billions of images without consent. Your photos may
                    already be in training datasets.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Facial Surveillance</h4>
                  <p className="text-sm text-slate-400">
                    Companies like Clearview AI have scraped social media to build massive
                    facial recognition databases.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Voice Fraud</h4>
                  <p className="text-sm text-slate-400">
                    Voice cloning technology can replicate your voice from just seconds of
                    audio for phone scams.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enterprise view with full functionality
  const allExposures = [
    ...(data?.exposures.aiTraining || []),
    ...(data?.exposures.facialRecognition || []),
    ...(data?.exposures.voiceCloning || []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bot className="h-7 w-7 text-purple-400" />
            AI Shield
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Enterprise
            </Badge>
          </h1>
          <p className="text-slate-400 mt-1">
            Monitor and protect your data from AI training, facial recognition, and voice cloning
          </p>
        </div>
        <Link href="/dashboard/scan">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Search className="mr-2 h-4 w-4" />
            Run AI Scan
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-sm text-slate-400">Total Sources Checked</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-400" />
              <div className="text-2xl font-bold text-blue-400">{stats.aiTraining}</div>
            </div>
            <p className="text-sm text-slate-400">AI Training</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 border-orange-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-orange-400" />
              <div className="text-2xl font-bold text-orange-400">{stats.facialRecognition}</div>
            </div>
            <p className="text-sm text-slate-400">Facial Recognition</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 border-pink-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-pink-400" />
              <div className="text-2xl font-bold text-pink-400">{stats.voiceCloning}</div>
            </div>
            <p className="text-sm text-slate-400">Voice Cloning</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 border-emerald-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <div className="text-2xl font-bold text-emerald-400">{stats.optedOut}</div>
            </div>
            <p className="text-sm text-slate-400">Opted Out</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">AI Protection Progress</span>
              <span className="text-sm text-white">
                {stats.optedOut} / {stats.total} sources protected
              </span>
            </div>
            <Progress
              value={(stats.optedOut / stats.total) * 100}
              className="h-2 bg-slate-700"
            />
          </CardContent>
        </Card>
      )}

      {/* Tabs for Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="ai-training" className="data-[state=active]:bg-blue-600">
            <Bot className="h-4 w-4 mr-1" />
            AI Training ({data?.exposures.aiTraining?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="facial" className="data-[state=active]:bg-orange-600">
            <Scan className="h-4 w-4 mr-1" />
            Facial Recognition ({data?.exposures.facialRecognition?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="voice" className="data-[state=active]:bg-pink-600">
            <Mic className="h-4 w-4 mr-1" />
            Voice Cloning ({data?.exposures.voiceCloning?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {allExposures.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No AI Exposures Found</h3>
                <p className="text-slate-400 mb-4">
                  Run a Full scan to check for your data in AI training datasets,
                  facial recognition databases, and voice cloning services.
                </p>
                <Link href="/dashboard/scan">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Search className="mr-2 h-4 w-4" />
                    Start Full Scan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {allExposures.map((exposure) => (
                <ExposureCard
                  key={exposure.id}
                  id={exposure.id}
                  source={exposure.source}
                  sourceName={exposure.sourceName}
                  sourceUrl={exposure.sourceUrl}
                  dataType={exposure.dataType}
                  dataPreview={exposure.dataPreview}
                  severity={exposure.severity}
                  status={exposure.status}
                  isWhitelisted={exposure.isWhitelisted}
                  firstFoundAt={new Date(exposure.firstFoundAt)}
                  requiresManualAction={exposure.requiresManualAction}
                  manualActionTaken={exposure.manualActionTaken}
                  onRemove={() => handleOptOut(exposure.id)}
                  onMarkDone={() => handleMarkDone(exposure.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-training">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400" />
                AI Training Datasets
              </CardTitle>
              <CardDescription className="text-slate-400">
                Check if your images or data are being used to train AI models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(data?.exposures.aiTraining?.length || 0) === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No AI training exposures found. Run a scan to check.
                </p>
              ) : (
                <div className="space-y-4">
                  {data?.exposures.aiTraining?.map((exposure) => (
                    <ExposureCard
                      key={exposure.id}
                      id={exposure.id}
                      source={exposure.source}
                      sourceName={exposure.sourceName}
                      sourceUrl={exposure.sourceUrl}
                      dataType={exposure.dataType}
                      dataPreview={exposure.dataPreview}
                      severity={exposure.severity}
                      status={exposure.status}
                      isWhitelisted={exposure.isWhitelisted}
                      firstFoundAt={new Date(exposure.firstFoundAt)}
                      requiresManualAction={exposure.requiresManualAction}
                      manualActionTaken={exposure.manualActionTaken}
                      onRemove={() => handleOptOut(exposure.id)}
                      onMarkDone={() => handleMarkDone(exposure.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facial">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scan className="h-5 w-5 text-orange-400" />
                Facial Recognition Databases
              </CardTitle>
              <CardDescription className="text-slate-400">
                Remove your face from facial recognition and surveillance databases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(data?.exposures.facialRecognition?.length || 0) === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No facial recognition exposures found. Run a scan to check.
                </p>
              ) : (
                <div className="space-y-4">
                  {data?.exposures.facialRecognition?.map((exposure) => (
                    <ExposureCard
                      key={exposure.id}
                      id={exposure.id}
                      source={exposure.source}
                      sourceName={exposure.sourceName}
                      sourceUrl={exposure.sourceUrl}
                      dataType={exposure.dataType}
                      dataPreview={exposure.dataPreview}
                      severity={exposure.severity}
                      status={exposure.status}
                      isWhitelisted={exposure.isWhitelisted}
                      firstFoundAt={new Date(exposure.firstFoundAt)}
                      requiresManualAction={exposure.requiresManualAction}
                      manualActionTaken={exposure.manualActionTaken}
                      onRemove={() => handleOptOut(exposure.id)}
                      onMarkDone={() => handleMarkDone(exposure.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mic className="h-5 w-5 text-pink-400" />
                Voice Cloning Services
              </CardTitle>
              <CardDescription className="text-slate-400">
                Protect your voice from being cloned for deepfake audio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(data?.exposures.voiceCloning?.length || 0) === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No voice cloning exposures found. Run a scan to check.
                </p>
              ) : (
                <div className="space-y-4">
                  {data?.exposures.voiceCloning?.map((exposure) => (
                    <ExposureCard
                      key={exposure.id}
                      id={exposure.id}
                      source={exposure.source}
                      sourceName={exposure.sourceName}
                      sourceUrl={exposure.sourceUrl}
                      dataType={exposure.dataType}
                      dataPreview={exposure.dataPreview}
                      severity={exposure.severity}
                      status={exposure.status}
                      isWhitelisted={exposure.isWhitelisted}
                      firstFoundAt={new Date(exposure.firstFoundAt)}
                      requiresManualAction={exposure.requiresManualAction}
                      manualActionTaken={exposure.manualActionTaken}
                      onRemove={() => handleOptOut(exposure.id)}
                      onMarkDone={() => handleMarkDone(exposure.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
