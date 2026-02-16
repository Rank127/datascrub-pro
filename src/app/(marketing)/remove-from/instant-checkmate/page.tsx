import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from Instant Checkmate (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from Instant Checkmate. Learn the opt-out process, what data Instant Checkmate collects, and how to permanently delete your listing.",
  keywords: [
    "remove from instant checkmate",
    "instant checkmate opt out",
    "instant checkmate removal",
    "delete instant checkmate listing",
    "instant checkmate privacy",
    "how to remove yourself from instant checkmate",
    "instant checkmate opt-out guide",
    "instant checkmate data removal",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/instant-checkmate",
  },
  openGraph: {
    title: "How to Remove Yourself from Instant Checkmate (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from Instant Checkmate.",
    url: "https://ghostmydata.com/remove-from/instant-checkmate",
    type: "article",
  },
};

const instantCheckmateInfo: BrokerInfo = {
  name: "Instant Checkmate",
  slug: "instant-checkmate",
  description:
    "Instant Checkmate is a background check service that aggregates public records, criminal data, and contact information into searchable reports.",
  dataCollected: [
    "Full name",
    "Addresses",
    "Phone numbers",
    "Email addresses",
    "Criminal records",
    "Court records",
    "Sex offender status",
    "Relatives",
    "Social media",
    "Property records",
  ],
  risks: [
    "Criminal record exposure",
    "Identity theft",
    "Stalking risk",
    "Employment discrimination",
    "Reputation damage",
  ],
  optOutUrl: "https://www.instantcheckmate.com/opt-out/",
  optOutTime: "PT336H",
  difficulty: "Medium",
  steps: [
    {
      name: "Find Your Listing",
      text: "Go to instantcheckmate.com and search for your name. Locate your profile in the results.",
      url: "https://www.instantcheckmate.com",
    },
    {
      name: "Copy Your Profile URL",
      text: "Click on your profile and copy the full URL from your browser&apos;s address bar.",
    },
    {
      name: "Visit the Opt-Out Page",
      text: "Go to the Instant Checkmate opt-out page to begin the removal process.",
      url: "https://www.instantcheckmate.com/opt-out/",
    },
    {
      name: "Submit Your Request",
      text: "Paste your profile URL, enter your email address, and complete the form.",
    },
    {
      name: "Confirm via Email",
      text: "Check your email for a confirmation message from Instant Checkmate. Click the link to confirm your opt-out.",
    },
    {
      name: "Verify Removal",
      text: "Wait 7-14 days, then search for yourself again to confirm your listing has been removed.",
    },
  ],
  faqs: [
    {
      question: "How long does Instant Checkmate removal take?",
      answer: "Removal typically takes 7-14 days after email confirmation. Some requests may take longer depending on volume.",
    },
    {
      question: "Can my data come back after removal?",
      answer: "Yes. Instant Checkmate may re-add your data if new public records become available. Ongoing monitoring is recommended.",
    },
    {
      question: "Is the opt-out process free?",
      answer: "Yes. Opting out of Instant Checkmate is completely free. Do not pay any third-party site claiming to charge for this.",
    },
    {
      question: "What if I have multiple listings?",
      answer: "You may have multiple profiles under different name spellings or addresses. Each one requires a separate opt-out request.",
    },
    {
      question: "Can GhostMyData handle this for me?",
      answer: "Yes. GhostMyData automates removal from Instant Checkmate and 2,100+ other data broker sites, with ongoing monitoring.",
    },
    {
      question: "Why does Instant Checkmate have my information?",
      answer: "Instant Checkmate compiles data from public records, court filings, government databases, and other publicly available sources.",
    },
  ],
  relatedBrokers: [
    { name: "TruthFinder", slug: "truthfinder" },
    { name: "BeenVerified", slug: "beenverified" },
    { name: "Intelius", slug: "intelius" },
    { name: "Smart Background Checks", slug: "smartbackgroundchecks" },
    { name: "Checkpeople", slug: "checkpeople" },
  ],
  lastUpdated: "February 15, 2026",
};

export default function InstantCheckmateRemovalPage() {
  return <BrokerRemovalTemplate broker={instantCheckmateInfo} />;
}
