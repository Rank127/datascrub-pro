/**
 * Source Grouping System
 *
 * Groups related data sources together so users can submit one removal request
 * that covers multiple related brokers. This reduces friction and ensures
 * comprehensive data removal.
 *
 * Groups are based on:
 * - Same parent company ownership
 * - Shared data sources
 * - API/data partnerships
 * - Subsidiary relationships
 */

export interface SourceGroup {
  id: string;
  name: string;
  description: string;
  primarySource: string;  // The main source to target for removal
  relatedSources: string[];  // Additional sources that share data
  removalNote: string;  // Explanation for users
  singleRemovalCovers: boolean;  // If true, removing from primary removes from all
}

// Source groups based on company ownership and data sharing
export const SOURCE_GROUPS: SourceGroup[] = [
  // ==========================================
  // DATA BROKER CONGLOMERATES
  // ==========================================
  {
    id: "pdl-network",
    name: "People Data Labs Network",
    description: "BeenVerified, Instant Checkmate, and PeopleLooker are owned by the same parent company",
    primarySource: "BEENVERIFIED",
    relatedSources: ["INSTANTCHECKMATE", "PEOPLELOOKER"],
    removalNote: "Removing from BeenVerified typically removes from Instant Checkmate and PeopleLooker within 7-14 days",
    singleRemovalCovers: true,
  },
  {
    id: "whitepages-network",
    name: "Whitepages Network",
    description: "Whitepages owns multiple people search properties",
    primarySource: "WHITEPAGES",
    relatedSources: ["ADDRESSES_COM", "NEIGHBORWHO"],
    removalNote: "Whitepages opt-out covers their network of sites",
    singleRemovalCovers: true,
  },
  {
    id: "intelius-network",
    name: "Intelius/PeopleConnect Network",
    description: "Intelius, USSearch, and related sites are owned by PeopleConnect",
    primarySource: "INTELIUS",
    relatedSources: ["USSEARCH", "CLASSMATES", "ZABASEARCH"],
    removalNote: "Intelius opt-out covers USSearch and related PeopleConnect properties",
    singleRemovalCovers: true,
  },
  {
    id: "truthfinder-network",
    name: "TruthFinder Network",
    description: "TruthFinder and related background check sites",
    primarySource: "TRUTHFINDER",
    relatedSources: ["PUBLICRECORDSNOW"],
    removalNote: "TruthFinder shares data with related sites",
    singleRemovalCovers: false,
  },

  // ==========================================
  // AI TRAINING CONSOLIDATION
  // ==========================================
  {
    id: "spawning-do-not-train",
    name: "Spawning.ai Do Not Train Registry",
    description: "Spawning.ai registry is honored by multiple AI companies",
    primarySource: "SPAWNING_AI",
    relatedSources: ["STABILITY_AI", "LAION_AI", "HUGGINGFACE"],
    removalNote: "Registering with Spawning.ai's Do Not Train registry opts you out from Stability AI, LAION, and participating AI companies",
    singleRemovalCovers: true,
  },
  {
    id: "openai-ecosystem",
    name: "OpenAI Ecosystem",
    description: "OpenAI's connected services",
    primarySource: "OPENAI",
    relatedSources: ["DALL_E"],
    removalNote: "OpenAI privacy request covers ChatGPT, DALL-E, and associated services",
    singleRemovalCovers: true,
  },
  {
    id: "meta-ai-ecosystem",
    name: "Meta AI Ecosystem",
    description: "Meta's AI training across Facebook, Instagram, WhatsApp",
    primarySource: "META_AI",
    relatedSources: ["FACEBOOK", "INSTAGRAM"],
    removalNote: "Meta AI opt-out applies to Facebook, Instagram, and WhatsApp data usage",
    singleRemovalCovers: true,
  },
  {
    id: "google-ai-ecosystem",
    name: "Google AI Ecosystem",
    description: "Google's AI training and image services",
    primarySource: "GOOGLE_AI",
    relatedSources: ["GOOGLE_IMAGES", "YOUTUBE"],
    removalNote: "Google account privacy settings control AI training across all Google services",
    singleRemovalCovers: true,
  },
  {
    id: "microsoft-ai-ecosystem",
    name: "Microsoft AI Ecosystem",
    description: "Microsoft's AI and Copilot services",
    primarySource: "MICROSOFT_AI",
    relatedSources: ["BING_IMAGES", "LINKEDIN_AI"],
    removalNote: "Microsoft privacy dashboard controls Copilot, Bing, and LinkedIn AI data usage",
    singleRemovalCovers: true,
  },
  {
    id: "amazon-ai-ecosystem",
    name: "Amazon AI Ecosystem",
    description: "Amazon's AI services including Alexa and AWS",
    primarySource: "AMAZON_AI",
    relatedSources: ["AMAZON_REKOGNITION"],
    removalNote: "Amazon privacy settings control Alexa and AWS AI data usage",
    singleRemovalCovers: true,
  },

  // ==========================================
  // FACIAL RECOGNITION NETWORKS
  // ==========================================
  {
    id: "social-catfish-network",
    name: "Social Catfish & Reverse Image",
    description: "Identity verification services that share facial data",
    primarySource: "SOCIAL_CATFISH",
    relatedSources: ["TINEYE"],
    removalNote: "These services aggregate public images - opt out from both for full coverage",
    singleRemovalCovers: false,
  },

  // ==========================================
  // VOICE CLONING CLUSTERS
  // ==========================================
  {
    id: "ai-voice-labs",
    name: "AI Voice Generation Services",
    description: "Major AI voice platforms that may train on public audio",
    primarySource: "ELEVENLABS",
    relatedSources: ["RESEMBLE_AI", "PLAY_HT"],
    removalNote: "Each voice service requires separate opt-out, but they often source from similar public datasets",
    singleRemovalCovers: false,
  },

  // ==========================================
  // DEEPFAKE VIDEO PLATFORMS
  // ==========================================
  {
    id: "avatar-video-platforms",
    name: "AI Avatar Video Platforms",
    description: "Commercial deepfake/avatar video services",
    primarySource: "D_ID",
    relatedSources: ["HEYGEN", "SYNTHESIA"],
    removalNote: "Each platform requires separate removal if your likeness was used",
    singleRemovalCovers: false,
  },
  {
    id: "face-swap-apps",
    name: "Face Swap Mobile Apps",
    description: "Consumer face swap applications",
    primarySource: "REFACE",
    relatedSources: ["FACEAPP", "WOMBO"],
    removalNote: "Mobile apps store face data separately - remove from each app used",
    singleRemovalCovers: false,
  },

  // ==========================================
  // B2B DATA BROKERS
  // ==========================================
  {
    id: "zoominfo-network",
    name: "B2B Data Network",
    description: "Professional data brokers that share business contact information",
    primarySource: "ZOOMINFO",
    relatedSources: ["APOLLO", "LUSHA", "ROCKETREACH", "CLEARBIT"],
    removalNote: "B2B data brokers often share sources - remove from each for complete coverage",
    singleRemovalCovers: false,
  },

  // ==========================================
  // MARKETING DATA BROKERS
  // ==========================================
  {
    id: "marketing-data-giants",
    name: "Marketing Data Giants",
    description: "Major marketing data aggregators",
    primarySource: "ACXIOM",
    relatedSources: ["ORACLE_DATACLOUD", "EXPERIAN_MARKETING", "EPSILON"],
    removalNote: "Large marketing databases - each requires separate opt-out",
    singleRemovalCovers: false,
  },
];

// Map from source to its group
const sourceToGroupMap = new Map<string, SourceGroup>();
SOURCE_GROUPS.forEach(group => {
  sourceToGroupMap.set(group.primarySource, group);
  group.relatedSources.forEach(source => {
    sourceToGroupMap.set(source, group);
  });
});

/**
 * Get the group for a given source
 */
export function getSourceGroup(source: string): SourceGroup | null {
  return sourceToGroupMap.get(source) || null;
}

/**
 * Get all sources in the same group as the given source
 */
export function getRelatedSources(source: string): string[] {
  const group = getSourceGroup(source);
  if (!group) return [];

  const allSources = [group.primarySource, ...group.relatedSources];
  return allSources.filter(s => s !== source);
}

/**
 * Check if removing from one source covers another
 */
export function removalCoversSource(primarySource: string, relatedSource: string): boolean {
  const group = getSourceGroup(primarySource);
  if (!group) return false;

  if (group.primarySource !== primarySource) return false;
  if (!group.singleRemovalCovers) return false;

  return group.relatedSources.includes(relatedSource);
}

/**
 * Get the primary source for a group (the one to target for removal)
 */
export function getPrimarySource(source: string): string {
  const group = getSourceGroup(source);
  return group ? group.primarySource : source;
}

/**
 * Get grouped sources for display
 * Returns sources organized by their groups
 */
export function groupSourcesForDisplay(sources: string[]): {
  grouped: { group: SourceGroup; sources: string[] }[];
  ungrouped: string[];
} {
  const grouped: { group: SourceGroup; sources: string[] }[] = [];
  const ungrouped: string[] = [];
  const processedGroups = new Set<string>();

  sources.forEach(source => {
    const group = getSourceGroup(source);

    if (group) {
      if (!processedGroups.has(group.id)) {
        processedGroups.add(group.id);
        const groupSources = sources.filter(s => {
          const g = getSourceGroup(s);
          return g && g.id === group.id;
        });
        grouped.push({ group, sources: groupSources });
      }
    } else {
      ungrouped.push(source);
    }
  });

  return { grouped, ungrouped };
}

/**
 * Count how many sources a removal will cover
 */
export function getRemovalCoverage(source: string): {
  directSources: number;
  relatedSources: number;
  total: number;
  note: string | null;
} {
  const group = getSourceGroup(source);

  if (!group) {
    return {
      directSources: 1,
      relatedSources: 0,
      total: 1,
      note: null,
    };
  }

  if (group.primarySource === source && group.singleRemovalCovers) {
    return {
      directSources: 1,
      relatedSources: group.relatedSources.length,
      total: 1 + group.relatedSources.length,
      note: group.removalNote,
    };
  }

  return {
    directSources: 1,
    relatedSources: 0,
    total: 1,
    note: group.removalNote,
  };
}
