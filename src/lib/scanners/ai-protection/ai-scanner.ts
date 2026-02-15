import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import type { DataSource, ExposureType } from "@/lib/types";
// DATA_BROKER_DIRECTORY is imported for potential future use with AI source scanning

type AICategory = "AI_TRAINING" | "FACIAL_RECOGNITION" | "VOICE_CLONING" | "DEEPFAKE_VIDEO" | "AI_AVATAR";

/**
 * Source category determines how exposures are created:
 * - DATA_BROKER: Actually indexes/sells personal data - CREATE EXPOSURE with removal
 * - OPT_OUT_RECOMMENDED: Major platforms with opt-out options - INFORMATIONAL only (no removal sent)
 * - MONITORING_ONLY: Generic datasets, no direct personal data - SKIP entirely
 */
type AISourceCategory = "DATA_BROKER" | "OPT_OUT_RECOMMENDED" | "MONITORING_ONLY";

interface AIService {
  source: DataSource;
  name: string;
  category: AICategory;
  sourceCategory: AISourceCategory; // NEW: Determines exposure creation behavior
  checkUrl: (input: ScanInput) => string | null;
  exposureType: ExposureType;
  description: string;
}

/**
 * AI Shield Scanner (formerly AI Protection Scanner)
 *
 * This scanner checks for potential exposure of user data in:
 * - AI Training Datasets (LAION, OpenAI, Anthropic, etc.)
 * - Facial Recognition Databases (Clearview AI, PimEyes, etc.)
 * - Voice Cloning Services (ElevenLabs, Resemble AI, etc.)
 * - Deepfake Video Generators (D-ID, HeyGen, Synthesia, etc.)
 * - AI Avatar Services (Ready Player Me, Lensa, etc.)
 *
 * Enterprise-only feature for comprehensive AI & deepfake protection.
 * 50+ sources across 5 categories.
 */
const AI_SERVICES: AIService[] = [
  // ==========================================
  // AI TRAINING DATASETS (20 sources)
  // sourceCategory determines behavior:
  // - OPT_OUT_RECOMMENDED: Show opt-out link, informational only
  // - MONITORING_ONLY: Skip - generic datasets without personal data index
  // ==========================================
  {
    source: "SPAWNING_AI",
    name: "Spawning AI (Do Not Train Registry)",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Central registry, informational
    exposureType: "AI_TRAINING_DATA",
    description: "Register for the Do-Not-Train registry honored by Stability AI, LAION, and other AI companies",
    checkUrl: () => "https://spawning.ai/",
  },
  {
    source: "LAION_AI",
    name: "LAION AI Dataset",
    category: "AI_TRAINING",
    sourceCategory: "MONITORING_ONLY", // Generic dataset, no personal data search
    exposureType: "AI_TRAINING_DATA",
    description: "Check if your images are in the LAION-5B dataset used to train Stable Diffusion and other AI models",
    checkUrl: () => "https://haveibeentrained.com/",
  },
  {
    source: "STABILITY_AI",
    name: "Stability AI",
    category: "AI_TRAINING",
    sourceCategory: "MONITORING_ONLY", // Generic AI model provider, no personal data index
    exposureType: "AI_TRAINING_DATA",
    description: "Opt out of Stable Diffusion training - register with Spawning.ai Do Not Train registry",
    checkUrl: () => "https://stability.ai/",
  },
  {
    source: "OPENAI",
    name: "OpenAI",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Major platform with formal opt-out
    exposureType: "AI_TRAINING_DATA",
    description: "Request data deletion and opt out of OpenAI training data via their privacy portal",
    checkUrl: () => "https://privacy.openai.com/",
  },
  {
    source: "ANTHROPIC",
    name: "Anthropic (Claude)",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Major platform with formal opt-out
    exposureType: "AI_TRAINING_DATA",
    description: "Request data deletion from Anthropic's Claude AI training via their privacy form",
    checkUrl: () => "https://www.anthropic.com/privacy",
  },
  {
    source: "MIDJOURNEY",
    name: "Midjourney",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Has account-based opt-out
    exposureType: "AI_TRAINING_DATA",
    description: "Request data deletion via Midjourney account settings or contact support",
    checkUrl: () => "https://docs.midjourney.com/hc/en-us/articles/32084462534541-Data-Deletion-and-Privacy-FAQ",
  },
  {
    source: "META_AI",
    name: "Meta AI",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Major platform with formal opt-out
    exposureType: "AI_TRAINING_DATA",
    description: "Submit an objection request to opt out of Meta AI training for Facebook and Instagram",
    checkUrl: () => "https://www.facebook.com/privacy/center/",
  },
  {
    source: "GOOGLE_AI",
    name: "Google AI (Gemini/Bard)",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Major platform with account settings
    exposureType: "AI_TRAINING_DATA",
    description: "Manage AI training settings in your Google account privacy settings",
    checkUrl: () => "https://myaccount.google.com/data-and-privacy",
  },
  {
    source: "MICROSOFT_AI",
    name: "Microsoft AI (Copilot/Bing)",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Major platform with account settings
    exposureType: "AI_TRAINING_DATA",
    description: "Manage AI data settings in your Microsoft account privacy dashboard",
    checkUrl: () => "https://account.microsoft.com/privacy",
  },
  {
    source: "LINKEDIN_AI",
    name: "LinkedIn AI Training",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Has specific settings page
    exposureType: "AI_TRAINING_DATA",
    description: "Opt out of LinkedIn using your data for AI training and generative AI improvements",
    checkUrl: () => "https://www.linkedin.com/mypreferences/d/settings/data-for-generative-ai-improvement",
  },
  {
    source: "ADOBE_AI",
    name: "Adobe Firefly/AI",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Has opt-out page
    exposureType: "AI_TRAINING_DATA",
    description: "Opt out of content analysis for Adobe products via your account settings",
    checkUrl: () => "https://www.adobe.com/privacy/opt-out.html",
  },
  {
    source: "AMAZON_AI",
    name: "Amazon AI (Alexa/AWS)",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Major platform
    exposureType: "AI_TRAINING_DATA",
    description: "Opt out of Amazon using your data for AI improvements",
    checkUrl: () => "https://www.amazon.com/gp/help/customer/display.html?nodeId=GXPU3YPMBZQRWZK2",
  },
  {
    source: "APPLE_AI",
    name: "Apple Intelligence",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Major platform
    exposureType: "AI_TRAINING_DATA",
    description: "Manage Apple Intelligence and Siri data settings in your Apple ID privacy settings",
    checkUrl: () => "https://privacy.apple.com/",
  },
  {
    source: "X_AI",
    name: "X/Twitter AI (Grok)",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Has specific settings
    exposureType: "AI_TRAINING_DATA",
    description: "Opt out of X using your posts to train Grok AI in Settings > Privacy",
    checkUrl: () => "https://x.com/settings/grok_settings",
  },
  {
    source: "REDDIT_AI",
    name: "Reddit AI Training",
    category: "AI_TRAINING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Has privacy settings
    exposureType: "AI_TRAINING_DATA",
    description: "Reddit licenses user content for AI training - delete posts or request data deletion",
    checkUrl: () => "https://www.reddit.com/settings/privacy",
  },
  {
    source: "SHUTTERSTOCK_AI",
    name: "Shutterstock AI",
    category: "AI_TRAINING",
    sourceCategory: "MONITORING_ONLY", // Only affects contributors, not general public
    exposureType: "AI_TRAINING_DATA",
    description: "Shutterstock uses contributor images for AI training - opt out via contributor portal",
    checkUrl: () => "https://www.shutterstock.com/contributorsupport",
  },
  {
    source: "GETTY_AI",
    name: "Getty Images AI",
    category: "AI_TRAINING",
    sourceCategory: "MONITORING_ONLY", // Only affects contributors
    exposureType: "AI_TRAINING_DATA",
    description: "Getty Images trains AI on contributor content - check contributor agreement",
    checkUrl: () => "https://www.gettyimages.com/company/privacy",
  },
  {
    source: "HUGGINGFACE",
    name: "Hugging Face",
    category: "AI_TRAINING",
    sourceCategory: "MONITORING_ONLY", // Platform for hosting models, not direct data collection
    exposureType: "AI_TRAINING_DATA",
    description: "Request removal from Hugging Face datasets and models",
    checkUrl: () => "https://huggingface.co/privacy",
  },
  {
    source: "COMMON_CRAWL",
    name: "Common Crawl",
    category: "AI_TRAINING",
    sourceCategory: "MONITORING_ONLY", // Web archive, not personal data broker
    exposureType: "AI_TRAINING_DATA",
    description: "Request URL exclusion from Common Crawl web archive used by many AI models",
    checkUrl: () => "https://commoncrawl.org/terms-of-use",
  },
  {
    source: "COHERE_AI",
    name: "Cohere",
    category: "AI_TRAINING",
    sourceCategory: "MONITORING_ONLY", // Enterprise AI, no consumer data collection
    exposureType: "AI_TRAINING_DATA",
    description: "Request data deletion from Cohere's AI training datasets",
    checkUrl: () => "https://cohere.com/privacy",
  },

  // ==========================================
  // FACIAL RECOGNITION DATABASES (12 sources)
  // DATA_BROKER: Actually indexes faces and allows searches
  // OPT_OUT_RECOMMENDED: Search engines with removal process
  // MONITORING_ONLY: API providers that don't store personal data
  // ==========================================
  {
    source: "CLEARVIEW_AI",
    name: "Clearview AI",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "DATA_BROKER", // Actually indexes faces from web scraping
    exposureType: "FACE_DATA",
    description: "Large facial recognition database used by law enforcement - opt out to remove your face from searches",
    checkUrl: () => "https://www.clearview.ai/privacy-and-requests",
  },
  {
    source: "PIMEYES",
    name: "PimEyes",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "DATA_BROKER", // Face search engine with indexed database
    exposureType: "FACE_DATA",
    description: "Face search engine - submit opt-out request to remove your face from search results",
    checkUrl: () => "https://pimeyes.com/en/opt-out-request",
  },
  {
    source: "FACECHECK_ID",
    name: "FaceCheck.ID",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "DATA_BROKER", // Face search engine with indexed database
    exposureType: "FACE_DATA",
    description: "Facial recognition search engine - search for your face and request removal",
    checkUrl: () => "https://facecheck.id/Face-Search/RemoveMyPhotos",
  },
  {
    source: "SOCIAL_CATFISH",
    name: "Social Catfish",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "DATA_BROKER", // Identity search with face matching
    exposureType: "FACE_DATA",
    description: "Reverse image and identity search with facial recognition capabilities",
    checkUrl: () => "https://socialcatfish.com/opt-out/",
  },
  {
    source: "TINEYE",
    name: "TinEye",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Reverse image search, not face-specific
    exposureType: "FACE_DATA",
    description: "Reverse image search engine - request image removal from search results",
    checkUrl: () => "https://tineye.com/image_removal",
  },
  {
    source: "YANDEX_IMAGES",
    name: "Yandex Images",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Search engine with removal process
    exposureType: "FACE_DATA",
    description: "Yandex reverse image search - request removal via support",
    checkUrl: () => "https://yandex.com/support/images/troubleshooting.html",
  },
  {
    source: "GOOGLE_IMAGES",
    name: "Google Images",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Search engine with removal process
    exposureType: "FACE_DATA",
    description: "Request removal of personal images from Google search results",
    checkUrl: () => "https://support.google.com/websearch/troubleshooter/9685456",
  },
  {
    source: "BING_IMAGES",
    name: "Bing Images",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Search engine with removal process
    exposureType: "FACE_DATA",
    description: "Request removal of personal images from Bing search results",
    checkUrl: () => "https://www.bing.com/webmaster/tools/contentremoval",
  },
  {
    source: "AMAZON_REKOGNITION",
    name: "Amazon Rekognition",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "MONITORING_ONLY", // API service, doesn't store personal data
    exposureType: "FACE_DATA",
    description: "AWS facial recognition service - contact AWS if your data was used without consent",
    checkUrl: () => "https://aws.amazon.com/rekognition/",
  },
  {
    source: "FINDFACE",
    name: "FindFace/NTechLab",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "DATA_BROKER", // Russian face search platform
    exposureType: "FACE_DATA",
    description: "Russian facial recognition platform - request data removal via email",
    checkUrl: () => "https://ntechlab.com/privacy-policy/",
  },
  {
    source: "KAIROS",
    name: "Kairos",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "MONITORING_ONLY", // API provider, doesn't store personal data
    exposureType: "FACE_DATA",
    description: "Facial recognition API provider - request data deletion",
    checkUrl: () => "https://www.kairos.com/privacy",
  },
  {
    source: "FACE_PLUS_PLUS",
    name: "Face++",
    category: "FACIAL_RECOGNITION",
    sourceCategory: "MONITORING_ONLY", // API provider, doesn't store personal data
    exposureType: "FACE_DATA",
    description: "Megvii Face++ facial recognition - request data removal",
    checkUrl: () => "https://www.faceplusplus.com/privacy-policy/",
  },

  // ==========================================
  // VOICE CLONING PROTECTION (10 sources)
  // All MONITORING_ONLY - these require account creation and consent
  // User must have uploaded their voice deliberately
  // ==========================================
  {
    source: "ELEVENLABS",
    name: "ElevenLabs",
    category: "VOICE_CLONING",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Has formal opt-out, but requires user account
    exposureType: "VOICE_DATA",
    description: "AI voice cloning service - request voice sample removal if your voice was uploaded without consent",
    checkUrl: () => "https://elevenlabs.io/privacy",
  },
  {
    source: "RESEMBLE_AI",
    name: "Resemble AI",
    category: "VOICE_CLONING",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "VOICE_DATA",
    description: "Voice cloning platform - contact for voice data removal",
    checkUrl: () => "https://www.resemble.ai/privacy",
  },
  {
    source: "MURF_AI",
    name: "Murf AI",
    category: "VOICE_CLONING",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "VOICE_DATA",
    description: "AI voice generator - contact legal@murf.ai to opt out of voice training",
    checkUrl: () => "https://murf.ai/resources/privacy_policy/",
  },
  {
    source: "PLAY_HT",
    name: "PlayHT",
    category: "VOICE_CLONING",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "VOICE_DATA",
    description: "AI voice generation platform - request voice clone deletion",
    checkUrl: () => "https://play.ht/privacy-policy/",
  },
  {
    source: "DESCRIPT",
    name: "Descript Overdub",
    category: "VOICE_CLONING",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "VOICE_DATA",
    description: "Descript's voice cloning feature - request voice model deletion",
    checkUrl: () => "https://www.descript.com/privacy",
  },
  {
    source: "LOVO_AI",
    name: "LOVO AI",
    category: "VOICE_CLONING",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "VOICE_DATA",
    description: "AI voice generator with voice cloning - request data removal",
    checkUrl: () => "https://lovo.ai/privacy",
  },
  {
    source: "REPLICA_STUDIOS",
    name: "Replica Studios",
    category: "VOICE_CLONING",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "VOICE_DATA",
    description: "AI voice actors platform - request voice data deletion",
    checkUrl: () => "https://replicastudios.com/privacy",
  },
  {
    source: "COQUI_AI",
    name: "Coqui AI",
    category: "VOICE_CLONING",
    sourceCategory: "MONITORING_ONLY", // Open-source, no central database
    exposureType: "VOICE_DATA",
    description: "Open-source voice cloning - check if your voice is in training datasets",
    checkUrl: () => "https://coqui.ai/privacy",
  },
  {
    source: "SPEECHIFY",
    name: "Speechify Voice Cloning",
    category: "VOICE_CLONING",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "VOICE_DATA",
    description: "Speechify's voice cloning feature - manage voice data in account settings",
    checkUrl: () => "https://speechify.com/privacy/",
  },
  {
    source: "WELLSAID_LABS",
    name: "WellSaid Labs",
    category: "VOICE_CLONING",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "VOICE_DATA",
    description: "AI voice platform - request removal of voice samples",
    checkUrl: () => "https://wellsaidlabs.com/privacy/",
  },

  // ==========================================
  // DEEPFAKE VIDEO GENERATORS (10 sources)
  // All require account creation and explicit upload
  // ==========================================
  {
    source: "D_ID",
    name: "D-ID",
    category: "DEEPFAKE_VIDEO",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "FACE_DATA",
    description: "AI video generation from photos - request removal if your likeness was used",
    checkUrl: () => "https://www.d-id.com/privacy-policy/",
  },
  {
    source: "HEYGEN",
    name: "HeyGen",
    category: "DEEPFAKE_VIDEO",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "FACE_DATA",
    description: "AI avatar video platform - request avatar and data deletion",
    checkUrl: () => "https://www.heygen.com/privacy-policy",
  },
  {
    source: "SYNTHESIA",
    name: "Synthesia",
    category: "DEEPFAKE_VIDEO",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "FACE_DATA",
    description: "AI video generation platform - request synthetic avatar removal",
    checkUrl: () => "https://www.synthesia.io/privacy",
  },
  {
    source: "REFACE",
    name: "Reface App",
    category: "DEEPFAKE_VIDEO",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Popular consumer app with privacy policy
    exposureType: "FACE_DATA",
    description: "Face swap app - request photo/face data deletion from their servers",
    checkUrl: () => "https://reface.ai/privacy-policy/",
  },
  {
    source: "FACEAPP",
    name: "FaceApp",
    category: "DEEPFAKE_VIDEO",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Popular consumer app with email contact
    exposureType: "FACE_DATA",
    description: "Face editing app with AI - request data deletion via privacy@faceapp.com",
    checkUrl: () => "https://faceapp.com/privacy",
  },
  {
    source: "MYHERITAGE_DEEPNOSTALGIA",
    name: "MyHeritage Deep Nostalgia",
    category: "DEEPFAKE_VIDEO",
    sourceCategory: "MONITORING_ONLY", // Requires account, tied to genealogy service
    exposureType: "FACE_DATA",
    description: "AI-animated photos - manage uploaded photos in account settings",
    checkUrl: () => "https://www.myheritage.com/privacy-policy",
  },
  {
    source: "WOMBO",
    name: "Wombo",
    category: "DEEPFAKE_VIDEO",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "FACE_DATA",
    description: "AI lip-sync and image generation - request data deletion",
    checkUrl: () => "https://www.wombo.ai/privacy",
  },
  {
    source: "DEEP_ART_EFFECTS",
    name: "Deep Art Effects",
    category: "DEEPFAKE_VIDEO",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "FACE_DATA",
    description: "AI art generation from photos - request original photo deletion",
    checkUrl: () => "https://www.deeparteffects.com/privacy",
  },
  {
    source: "ROOP",
    name: "Roop/DeepFaceLab",
    category: "DEEPFAKE_VIDEO",
    sourceCategory: "MONITORING_ONLY", // Open-source tools, no central database
    exposureType: "FACE_DATA",
    description: "Open-source deepfake tools - report unauthorized use to hosting platforms",
    checkUrl: () => "https://github.com/iperov/DeepFaceLab",
  },
  {
    source: "RUNWAY_ML",
    name: "Runway ML",
    category: "DEEPFAKE_VIDEO",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "FACE_DATA",
    description: "AI video generation platform - request data and project deletion",
    checkUrl: () => "https://runwayml.com/privacy/",
  },

  // ==========================================
  // AI AVATAR SERVICES (8 sources)
  // All require account creation and explicit upload
  // ==========================================
  {
    source: "LENSA_AI",
    name: "Lensa AI",
    category: "AI_AVATAR",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Popular consumer app
    exposureType: "FACE_DATA",
    description: "AI avatar generator - request deletion of uploaded photos and generated avatars",
    checkUrl: () => "https://prisma-ai.com/lensa/privacy",
  },
  {
    source: "READY_PLAYER_ME",
    name: "Ready Player Me",
    category: "AI_AVATAR",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "FACE_DATA",
    description: "3D avatar platform using facial data - delete avatars in account settings",
    checkUrl: () => "https://readyplayer.me/privacy",
  },
  {
    source: "ARTBREEDER",
    name: "Artbreeder",
    category: "AI_AVATAR",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "FACE_DATA",
    description: "AI image breeding platform - manage uploaded images and creations",
    checkUrl: () => "https://www.artbreeder.com/privacy",
  },
  {
    source: "DALL_E",
    name: "DALL-E (OpenAI)",
    category: "AI_AVATAR",
    sourceCategory: "OPT_OUT_RECOMMENDED", // Part of OpenAI, covered by their opt-out
    exposureType: "AI_TRAINING_DATA",
    description: "OpenAI's image generation - request data deletion via privacy portal",
    checkUrl: () => "https://privacy.openai.com/",
  },
  {
    source: "STARRY_AI",
    name: "Starry AI",
    category: "AI_AVATAR",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "FACE_DATA",
    description: "AI art generator - request deletion of uploaded reference images",
    checkUrl: () => "https://starryai.com/privacy",
  },
  {
    source: "NIGHTCAFE",
    name: "NightCafe",
    category: "AI_AVATAR",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "FACE_DATA",
    description: "AI art platform - manage and delete uploaded images in account",
    checkUrl: () => "https://nightcafe.studio/privacy",
  },
  {
    source: "PIKA_LABS",
    name: "Pika Labs",
    category: "AI_AVATAR",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "FACE_DATA",
    description: "AI video generation - request removal of generated content",
    checkUrl: () => "https://pika.art/privacy",
  },
  {
    source: "SUNO_AI",
    name: "Suno AI (Music)",
    category: "AI_AVATAR",
    sourceCategory: "MONITORING_ONLY", // Requires account, consent-based
    exposureType: "VOICE_DATA",
    description: "AI music generation - request removal if voice samples were used",
    checkUrl: () => "https://suno.ai/privacy",
  },
];

// Total: 60 sources across 5 categories

export class AIProtectionScanner extends BaseScanner {
  name = "AI Shield Scanner";
  source: DataSource = "OTHER";

  async isAvailable(): Promise<boolean> {
    return true; // Always available - provides manual check links
  }

  async scan(_input: ScanInput): Promise<ScanResult[]> {
    // AI sources are informational-only - they don't have actual evidence of user data
    // Opt-out resources are still available at /dashboard/ai-protection
    console.log("[AIShieldScanner] AI sources are informational-only - no exposures created");
    console.log("[AIShieldScanner] AI opt-out resources available at /dashboard/ai-protection");

    // Return empty array - AI sources don't have actual evidence of user data
    return [];
  }

  private getSeverityForCategory(category: AICategory): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    switch (category) {
      case "FACIAL_RECOGNITION":
        return "HIGH"; // Facial recognition is high risk for identity theft
      case "VOICE_CLONING":
        return "HIGH"; // Voice cloning enables deepfake fraud
      case "DEEPFAKE_VIDEO":
        return "CRITICAL"; // Deepfake videos are critical risk
      case "AI_AVATAR":
        return "MEDIUM"; // AI avatars are moderate risk
      case "AI_TRAINING":
        return "MEDIUM"; // AI training data is concerning but less immediate risk
      default:
        return "MEDIUM";
    }
  }

  // Get services by category for UI filtering
  static getServicesByCategory(category: AICategory): AIService[] {
    return AI_SERVICES.filter(s => s.category === category);
  }

  // Get all AI service sources
  static getAllSources(): DataSource[] {
    return AI_SERVICES.map(s => s.source);
  }

  // Get service count by category
  static getCategoryCount(): {
    aiTraining: number;
    facialRecognition: number;
    voiceCloning: number;
    deepfakeVideo: number;
    aiAvatar: number;
    total: number;
  } {
    return {
      aiTraining: AI_SERVICES.filter(s => s.category === "AI_TRAINING").length,
      facialRecognition: AI_SERVICES.filter(s => s.category === "FACIAL_RECOGNITION").length,
      voiceCloning: AI_SERVICES.filter(s => s.category === "VOICE_CLONING").length,
      deepfakeVideo: AI_SERVICES.filter(s => s.category === "DEEPFAKE_VIDEO").length,
      aiAvatar: AI_SERVICES.filter(s => s.category === "AI_AVATAR").length,
      total: AI_SERVICES.length,
    };
  }
}

// Export the list for use in other parts of the application
export { AI_SERVICES };
export type { AIService, AICategory, AISourceCategory };
