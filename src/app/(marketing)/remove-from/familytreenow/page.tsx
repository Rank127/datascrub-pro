import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from FamilyTreeNow (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from FamilyTreeNow. Learn the opt-out process and how to permanently delete your listing.",
  keywords: [
    "remove from familytreenow",
    "familytreenow opt out",
    "familytreenow removal",
    "delete familytreenow listing",
    "familytreenow privacy",
    "remove familytreenow profile",
    "how to remove yourself from familytreenow",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/familytreenow",
  },
  openGraph: {
    title: "How to Remove Yourself from FamilyTreeNow (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from FamilyTreeNow.",
    url: "https://ghostmydata.com/remove-from/familytreenow",
    type: "article",
  },
};

const familyTreeNowInfo: BrokerInfo = {
  name: "FamilyTreeNow",
  slug: "familytreenow",
  description:
    "FamilyTreeNow is a genealogy site that exposes personal records including addresses, phone numbers, relatives, and birth dates.",
  dataCollected: [
    "Full name",
    "Current and past addresses",
    "Phone numbers",
    "Birth date",
    "Relatives and family connections",
    "Associated people",
  ],
  risks: [
    "Stalking through family connections",
    "Identity theft with birth dates",
    "Physical safety from exposed addresses",
    "Social engineering using family names",
    "Privacy invasion",
  ],
  optOutUrl: "https://www.familytreenow.com/optout",
  optOutTime: "PT24H",
  difficulty: "Easy",
  steps: [
    {
      name: "Search Your Name",
      text: "Go to familytreenow.com and search your name. Browse the results to find your listing.",
      url: "https://www.familytreenow.com",
    },
    {
      name: "Note Your Listing Details",
      text: "Find your listing and note the details displayed, including your address, relatives, and other personal information.",
    },
    {
      name: "Visit the Opt-Out Page",
      text: "Visit familytreenow.com/optout. This is the official removal page.",
      url: "https://www.familytreenow.com/optout",
    },
    {
      name: "Search for Yourself",
      text: "Search for yourself on the opt-out page using your name and state.",
    },
    {
      name: "Select and Opt Out",
      text: "Select your record from the results and click the opt-out button to submit your removal request.",
    },
    {
      name: "Verify Removal",
      text: "Verify removal after 24 hours by searching for yourself again. Your listing should be gone.",
    },
  ],
  faqs: [
    {
      question: "How long does FamilyTreeNow removal take?",
      answer: "FamilyTreeNow typically processes opt-out requests within 24 hours. Check back after a day to confirm your listing has been removed.",
    },
    {
      question: "Can my data reappear on FamilyTreeNow?",
      answer: "Yes. FamilyTreeNow pulls data from public records. If new records are published, a new listing may be created. Regular monitoring is recommended.",
    },
    {
      question: "Can I remove my relatives from FamilyTreeNow?",
      answer: "Each person must submit their own opt-out request. You cannot remove another person\u0027s listing on their behalf.",
    },
    {
      question: "Can GhostMyData remove me from FamilyTreeNow?",
      answer: "Yes. GhostMyData automatically removes your data from FamilyTreeNow and 2,100+ other data brokers, with continuous monitoring to catch re-listings.",
    },
    {
      question: "Why does FamilyTreeNow have my data?",
      answer: "FamilyTreeNow aggregates publicly available records including property records, census data, and other government databases to build genealogy profiles.",
    },
  ],
  lastUpdated: "February 15, 2026",
};

export default function FamilyTreeNowRemovalPage() {
  return <BrokerRemovalTemplate broker={familyTreeNowInfo} />;
}
