import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from Radaris (2026 Guide) | GhostMyData",
  description:
    "Complete guide to remove your personal information from Radaris. Learn the complex opt-out process for this difficult data broker.",
  keywords: [
    "remove from radaris",
    "radaris opt out",
    "radaris removal",
    "delete radaris profile",
    "radaris privacy",
    "how to remove yourself from radaris",
    "radaris data removal",
    "radaris opt-out guide",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/radaris",
  },
};

const radarisInfo: BrokerInfo = {
  name: "Radaris",
  slug: "radaris",
  description:
    "Radaris is a comprehensive people search site that aggregates public records, property data, court records, and more into detailed profiles. Known for having one of the more difficult opt-out processes.",
  dataCollected: [
    "Full name and aliases",
    "Date of birth",
    "Current and past addresses",
    "Phone numbers",
    "Email addresses",
    "Property records",
    "Court records",
    "Criminal records",
    "Business affiliations",
    "Social media profiles",
    "Professional history",
  ],
  risks: [
    "Extremely detailed profiles available publicly",
    "Court and criminal records prominently displayed",
    "Property ownership reveals your assets",
    "Business affiliations exposed",
    "Difficult and slow removal process",
  ],
  optOutUrl: "https://radaris.com/control/privacy",
  optOutTime: "P30D",
  difficulty: "Hard",
  steps: [
    {
      name: "Create a Radaris Account",
      text: "Unfortunately, Radaris requires you to create an account to opt out. Go to their privacy control page and register.",
      url: "https://radaris.com/control/privacy",
    },
    {
      name: "Verify Your Email",
      text: "Check your email for a verification link from Radaris and click it to activate your account.",
    },
    {
      name: "Find Your Profile",
      text: "Once logged in, search for your name and locate your profile in their database.",
    },
    {
      name: "Request Profile Removal",
      text: "Click on the privacy/removal option for your profile. You may need to verify ownership of the record.",
    },
    {
      name: "Provide Additional Verification",
      text: "Radaris may request additional verification such as ID verification or phone verification.",
    },
    {
      name: "Wait for Processing",
      text: "Radaris takes 7-30 days to process removals. Monitor your profile and follow up if not removed.",
    },
  ],
  faqs: [
    {
      question: "Why is Radaris removal so difficult?",
      answer: "Radaris requires account creation and sometimes additional verification, making it one of the most challenging data brokers to remove from.",
    },
    {
      question: "Is it safe to create a Radaris account for opt-out?",
      answer: "While required for removal, you're providing them more data. Consider using a temporary email and deleting the account after removal.",
    },
    {
      question: "Why does Radaris take so long?",
      answer: "Radaris processes removals slowly, sometimes taking up to 30 days. Multiple follow-ups may be needed.",
    },
    {
      question: "Can GhostMyData help with Radaris removal?",
      answer: "Yes, GhostMyData automates Radaris removal and handles the account creation and verification process for you.",
    },
  ],
  relatedBrokers: [
    { name: "MyLife", slug: "mylife" },
    { name: "Arrests.org", slug: "arrests-org" },
    { name: "USSearch", slug: "ussearch" },
    { name: "BeenVerified", slug: "beenverified" },
  ],
  lastUpdated: "January 24, 2026",
};

export default function RadarisRemovalPage() {
  return <BrokerRemovalTemplate broker={radarisInfo} />;
}
