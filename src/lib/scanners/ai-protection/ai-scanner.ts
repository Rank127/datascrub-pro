import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import type { DataSource, ExposureType } from "@/lib/types";
import { DATA_BROKER_DIRECTORY } from "@/lib/removers/data-broker-directory";

interface AIService {
  source: DataSource;
  name: string;
  category: "AI_TRAINING" | "FACIAL_RECOGNITION" | "VOICE_CLONING";
  checkUrl: (input: ScanInput) => string | null;
  exposureType: ExposureType;
  description: string;
}

/**
 * AI Protection Scanner
 *
 * This scanner checks for potential exposure of user data in:
 * - AI Training Datasets (LAION, Stable Diffusion, OpenAI, etc.)
 * - Facial Recognition Databases (Clearview AI, PimEyes, etc.)
 * - Voice Cloning Services (ElevenLabs, Resemble AI, etc.)
 *
 * Enterprise-only feature for comprehensive AI deepfake protection.
 */
const AI_SERVICES: AIService[] = [
  // ==========================================
  // AI TRAINING DATASETS
  // ==========================================
  {
    source: "LAION_AI",
    name: "LAION AI Dataset",
    category: "AI_TRAINING",
    exposureType: "AI_TRAINING_DATA",
    description: "Check if your images are in the LAION-5B dataset used to train Stable Diffusion and other AI models",
    checkUrl: (input) => {
      // HaveIBeenTrained allows searching by uploading an image
      // For now, provide the search page - user needs to upload their image
      return "https://haveibeentrained.com/";
    },
  },
  {
    source: "STABILITY_AI",
    name: "Stability AI",
    category: "AI_TRAINING",
    exposureType: "AI_TRAINING_DATA",
    description: "Opt out of Stable Diffusion training - register with Spawning.ai to prevent your images from being used",
    checkUrl: () => "https://spawning.ai/",
  },
  {
    source: "OPENAI",
    name: "OpenAI",
    category: "AI_TRAINING",
    exposureType: "AI_TRAINING_DATA",
    description: "Request data deletion and opt out of OpenAI training data via their privacy portal",
    checkUrl: () => "https://privacy.openai.com/policies",
  },
  {
    source: "MIDJOURNEY",
    name: "Midjourney",
    category: "AI_TRAINING",
    exposureType: "AI_TRAINING_DATA",
    description: "Contact Midjourney support to opt out of image training",
    checkUrl: () => "https://docs.midjourney.com/docs/terms-of-service",
  },
  {
    source: "META_AI",
    name: "Meta AI",
    category: "AI_TRAINING",
    exposureType: "AI_TRAINING_DATA",
    description: "Opt out of Meta AI training for your Facebook and Instagram data",
    checkUrl: () => "https://www.facebook.com/help/contact/540404257914453",
  },
  {
    source: "GOOGLE_AI",
    name: "Google AI",
    category: "AI_TRAINING",
    exposureType: "AI_TRAINING_DATA",
    description: "Manage AI training settings in your Google account privacy settings",
    checkUrl: () => "https://myaccount.google.com/data-and-privacy",
  },
  {
    source: "LINKEDIN_AI",
    name: "LinkedIn AI Training",
    category: "AI_TRAINING",
    exposureType: "AI_TRAINING_DATA",
    description: "Opt out of LinkedIn using your data for AI training and generative AI improvements",
    checkUrl: () => "https://www.linkedin.com/mypreferences/d/settings/data-for-generative-ai-improvement",
  },
  {
    source: "ADOBE_AI",
    name: "Adobe Firefly/AI",
    category: "AI_TRAINING",
    exposureType: "AI_TRAINING_DATA",
    description: "Only uses Adobe Stock content - check if you've submitted to Adobe Stock",
    checkUrl: () => "https://www.adobe.com/go/privacy_your_choices",
  },
  {
    source: "AMAZON_AI",
    name: "Amazon AI",
    category: "AI_TRAINING",
    exposureType: "AI_TRAINING_DATA",
    description: "Opt out of Amazon using your data for AI improvements",
    checkUrl: () => "https://www.amazon.com/gp/help/customer/display.html?nodeId=GXPU3YPMBZQRWZK2",
  },

  // ==========================================
  // FACIAL RECOGNITION DATABASES
  // ==========================================
  {
    source: "CLEARVIEW_AI",
    name: "Clearview AI",
    category: "FACIAL_RECOGNITION",
    exposureType: "FACE_DATA",
    description: "Large facial recognition database used by law enforcement - opt out to remove your face from searches",
    checkUrl: () => "https://clearview.ai/privacy/requests",
  },
  {
    source: "PIMEYES",
    name: "PimEyes",
    category: "FACIAL_RECOGNITION",
    exposureType: "FACE_DATA",
    description: "Face search engine - submit opt-out request to remove your face from search results",
    checkUrl: () => "https://pimeyes.com/en/opt-out-request",
  },
  {
    source: "FACECHECK_ID",
    name: "FaceCheck.ID",
    category: "FACIAL_RECOGNITION",
    exposureType: "FACE_DATA",
    description: "Facial recognition search engine - opt out to prevent face matching",
    checkUrl: () => "https://facecheck.id/fc/optout",
  },
  {
    source: "SOCIAL_CATFISH",
    name: "Social Catfish",
    category: "FACIAL_RECOGNITION",
    exposureType: "FACE_DATA",
    description: "Reverse image and identity search with facial recognition capabilities",
    checkUrl: (input) => {
      // Social Catfish has reverse image search
      return "https://socialcatfish.com/opt-out/";
    },
  },
  {
    source: "TINEYE",
    name: "TinEye",
    category: "FACIAL_RECOGNITION",
    exposureType: "FACE_DATA",
    description: "Reverse image search engine - can request image removal",
    checkUrl: () => "https://tineye.com/removal",
  },
  {
    source: "YANDEX_IMAGES",
    name: "Yandex Images",
    category: "FACIAL_RECOGNITION",
    exposureType: "FACE_DATA",
    description: "Yandex reverse image search - request removal via support",
    checkUrl: () => "https://yandex.com/support/images/troubleshooting.html",
  },

  // ==========================================
  // VOICE CLONING PROTECTION
  // ==========================================
  {
    source: "ELEVENLABS",
    name: "ElevenLabs",
    category: "VOICE_CLONING",
    exposureType: "VOICE_DATA",
    description: "AI voice cloning service - request voice sample removal if your voice was uploaded without consent",
    checkUrl: () => "https://elevenlabs.io/privacy",
  },
  {
    source: "RESEMBLE_AI",
    name: "Resemble AI",
    category: "VOICE_CLONING",
    exposureType: "VOICE_DATA",
    description: "Voice cloning platform - contact for voice data removal",
    checkUrl: () => "https://www.resemble.ai/privacy",
  },
  {
    source: "MURF_AI",
    name: "Murf AI",
    category: "VOICE_CLONING",
    exposureType: "VOICE_DATA",
    description: "AI voice generator - opt out of voice training data",
    checkUrl: () => "https://murf.ai/privacy",
  },
];

export class AIProtectionScanner extends BaseScanner {
  name = "AI Protection Scanner";
  source: DataSource = "OTHER";

  async isAvailable(): Promise<boolean> {
    return true; // Always available - provides manual check links
  }

  async scan(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    console.log("[AIProtectionScanner] Generating AI protection check links");

    for (const service of AI_SERVICES) {
      const checkUrl = service.checkUrl(input);

      if (!checkUrl) {
        continue;
      }

      // Get broker info for opt-out details
      const brokerInfo = DATA_BROKER_DIRECTORY[service.source];

      // Determine severity based on category
      const severity = this.getSeverityForCategory(service.category);

      results.push({
        source: service.source,
        sourceName: service.name,
        sourceUrl: checkUrl,
        dataType: service.exposureType,
        dataPreview: "AI exposure check - click to verify",
        severity,
        rawData: {
          manualCheckRequired: true,
          category: service.category,
          checkUrl,
          optOutUrl: brokerInfo?.optOutUrl || checkUrl,
          optOutEmail: brokerInfo?.privacyEmail,
          estimatedDays: brokerInfo?.estimatedDays || 30,
          description: service.description,
          notes: brokerInfo?.notes,
          reason: `${service.description}. Click the link to check your exposure and submit an opt-out request.`,
        },
      });
    }

    console.log(`[AIProtectionScanner] Generated ${results.length} AI protection check links`);
    return results;
  }

  private getSeverityForCategory(category: "AI_TRAINING" | "FACIAL_RECOGNITION" | "VOICE_CLONING"): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    switch (category) {
      case "FACIAL_RECOGNITION":
        return "HIGH"; // Facial recognition is high risk for identity theft
      case "VOICE_CLONING":
        return "HIGH"; // Voice cloning enables deepfake fraud
      case "AI_TRAINING":
        return "MEDIUM"; // AI training data is concerning but less immediate risk
      default:
        return "MEDIUM";
    }
  }

  // Get services by category for UI filtering
  static getServicesByCategory(category: "AI_TRAINING" | "FACIAL_RECOGNITION" | "VOICE_CLONING"): AIService[] {
    return AI_SERVICES.filter(s => s.category === category);
  }

  // Get all AI service sources
  static getAllSources(): DataSource[] {
    return AI_SERVICES.map(s => s.source);
  }

  // Get service count by category
  static getCategoryCount(): { aiTraining: number; facialRecognition: number; voiceCloning: number } {
    return {
      aiTraining: AI_SERVICES.filter(s => s.category === "AI_TRAINING").length,
      facialRecognition: AI_SERVICES.filter(s => s.category === "FACIAL_RECOGNITION").length,
      voiceCloning: AI_SERVICES.filter(s => s.category === "VOICE_CLONING").length,
    };
  }
}

// Export the list for use in other parts of the application
export { AI_SERVICES };
export type { AIService };
