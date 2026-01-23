import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import type { DataSource } from "@/lib/types";

interface SocialPlatform {
  source: DataSource;
  name: string;
  searchUrl: (input: ScanInput) => string | null;
  profileBaseUrl: string;
  optOutUrl?: string;
  optOutInstructions: string;
}

/**
 * Social Media Scanner with Manual Check Links
 *
 * Social media platforms block automated scraping, so this scanner
 * provides direct search links for users to manually verify their presence.
 */
const PLATFORMS: SocialPlatform[] = [
  {
    source: "LINKEDIN",
    name: "LinkedIn",
    profileBaseUrl: "https://www.linkedin.com",
    searchUrl: (input) => {
      if (!input.fullName) return null;
      const name = encodeURIComponent(input.fullName);
      return `https://www.linkedin.com/search/results/people/?keywords=${name}`;
    },
    optOutUrl: "https://www.linkedin.com/help/linkedin/answer/a1339364",
    optOutInstructions:
      "1. Go to Settings & Privacy\n" +
      "2. Click on Visibility\n" +
      "3. Adjust 'Profile viewing options'\n" +
      "4. To delete: Settings > Account > Close account",
  },
  {
    source: "FACEBOOK",
    name: "Facebook",
    profileBaseUrl: "https://www.facebook.com",
    searchUrl: (input) => {
      if (!input.fullName) return null;
      const name = encodeURIComponent(input.fullName);
      return `https://www.facebook.com/search/people/?q=${name}`;
    },
    optOutUrl: "https://www.facebook.com/help/delete_account",
    optOutInstructions:
      "1. Go to Settings & Privacy > Settings\n" +
      "2. Click 'Your Facebook Information'\n" +
      "3. Click 'Deactivation and Deletion'\n" +
      "4. Choose 'Delete Account' and follow prompts",
  },
  {
    source: "TWITTER",
    name: "Twitter/X",
    profileBaseUrl: "https://twitter.com",
    searchUrl: (input) => {
      if (input.usernames?.length) {
        return `https://twitter.com/${input.usernames[0]}`;
      }
      if (!input.fullName) return null;
      const name = encodeURIComponent(input.fullName);
      return `https://twitter.com/search?q=${name}&f=user`;
    },
    optOutUrl: "https://help.twitter.com/en/managing-your-account/how-to-deactivate-twitter-account",
    optOutInstructions:
      "1. Go to Settings and privacy\n" +
      "2. Click 'Your account'\n" +
      "3. Click 'Deactivate your account'\n" +
      "4. Follow the prompts to deactivate",
  },
  {
    source: "INSTAGRAM",
    name: "Instagram",
    profileBaseUrl: "https://www.instagram.com",
    searchUrl: (input) => {
      if (input.usernames?.length) {
        return `https://www.instagram.com/${input.usernames[0]}`;
      }
      // Instagram doesn't have public name search
      return "https://www.instagram.com";
    },
    optOutUrl: "https://help.instagram.com/370452623149242",
    optOutInstructions:
      "1. Go to Settings > Account\n" +
      "2. Scroll down to 'Delete account'\n" +
      "3. Select a reason and re-enter password\n" +
      "4. Click 'Delete account'",
  },
  {
    source: "TIKTOK",
    name: "TikTok",
    profileBaseUrl: "https://www.tiktok.com",
    searchUrl: (input) => {
      if (input.usernames?.length) {
        return `https://www.tiktok.com/@${input.usernames[0]}`;
      }
      if (!input.fullName) return null;
      const name = encodeURIComponent(input.fullName);
      return `https://www.tiktok.com/search/user?q=${name}`;
    },
    optOutUrl: "https://support.tiktok.com/en/account-and-privacy/deleting-an-account",
    optOutInstructions:
      "1. Go to Profile > Menu > Settings\n" +
      "2. Tap 'Manage account'\n" +
      "3. Tap 'Delete account'\n" +
      "4. Follow the prompts",
  },
  {
    source: "REDDIT",
    name: "Reddit",
    profileBaseUrl: "https://www.reddit.com",
    searchUrl: (input) => {
      if (input.usernames?.length) {
        return `https://www.reddit.com/user/${input.usernames[0]}`;
      }
      return null;
    },
    optOutUrl: "https://www.reddit.com/settings/account",
    optOutInstructions:
      "1. Go to User Settings > Account\n" +
      "2. Scroll to 'Delete Account'\n" +
      "3. Enter username and password\n" +
      "4. Click 'Delete'",
  },
  {
    source: "PINTEREST",
    name: "Pinterest",
    profileBaseUrl: "https://www.pinterest.com",
    searchUrl: (input) => {
      if (input.usernames?.length) {
        return `https://www.pinterest.com/${input.usernames[0]}`;
      }
      if (!input.fullName) return null;
      const name = encodeURIComponent(input.fullName);
      return `https://www.pinterest.com/search/users/?q=${name}`;
    },
    optOutUrl: "https://help.pinterest.com/en/article/deactivate-or-close-your-account",
    optOutInstructions:
      "1. Go to Settings > Account settings\n" +
      "2. Click 'Close account'\n" +
      "3. Select a reason\n" +
      "4. Click 'Close account'",
  },
  {
    source: "YOUTUBE",
    name: "YouTube",
    profileBaseUrl: "https://www.youtube.com",
    searchUrl: (input) => {
      if (input.usernames?.length) {
        return `https://www.youtube.com/@${input.usernames[0]}`;
      }
      if (!input.fullName) return null;
      const name = encodeURIComponent(input.fullName);
      return `https://www.youtube.com/results?search_query=${name}&sp=EgIQAg%253D%253D`;
    },
    optOutUrl: "https://support.google.com/youtube/answer/55759",
    optOutInstructions:
      "1. Go to YouTube Studio > Settings\n" +
      "2. Click 'Channel' > 'Advanced settings'\n" +
      "3. Click 'Remove YouTube content'\n" +
      "4. Follow the prompts",
  },
];

export class SocialMediaScanner extends BaseScanner {
  name = "Social Media Scanner";
  source: DataSource = "OTHER";

  async isAvailable(): Promise<boolean> {
    return true; // Always available - provides manual check links
  }

  async scan(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    // Only scan if we have something to search for
    if (!input.fullName && !input.usernames?.length) {
      console.log("[SocialMediaScanner] No name or usernames provided, skipping");
      return results;
    }

    console.log("[SocialMediaScanner] Generating manual check links for social platforms");

    for (const platform of PLATFORMS) {
      const searchUrl = platform.searchUrl(input);

      if (!searchUrl) {
        continue;
      }

      results.push({
        source: platform.source,
        sourceName: platform.name,
        sourceUrl: searchUrl,
        dataType: "USERNAME",
        dataPreview: "Manual check required - click to verify",
        severity: "LOW", // Low severity since we don't know if they're listed
        rawData: {
          manualCheckRequired: true,
          searchUrl,
          profileBaseUrl: platform.profileBaseUrl,
          optOutUrl: platform.optOutUrl,
          optOutInstructions: platform.optOutInstructions,
          reason: "Social media platforms block automated scanning. Click the link to check if you have a profile.",
        },
      });
    }

    console.log(`[SocialMediaScanner] Generated ${results.length} manual check links`);
    return results;
  }
}
