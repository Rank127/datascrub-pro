import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from Intelius (2026 Guide) | GhostMyData",
  description:
    "Complete guide to remove your personal information from Intelius background check service. Step-by-step opt-out instructions.",
  keywords: [
    "remove from intelius",
    "intelius opt out",
    "intelius removal",
    "delete intelius record",
    "intelius background check removal",
    "intelius privacy",
    "how to remove yourself from intelius",
    "intelius opt-out guide",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/intelius",
  },
};

const inteliusInfo: BrokerInfo = {
  name: "Intelius",
  slug: "intelius",
  description:
    "Intelius is a comprehensive background check and people search service owned by PeopleConnect, providing detailed personal information reports.",
  dataCollected: [
    "Full name and date of birth",
    "Current and historical addresses",
    "Phone numbers",
    "Email addresses",
    "Criminal records",
    "Civil court records",
    "Bankruptcy filings",
    "Property ownership",
    "Professional licenses",
    "Social media accounts",
  ],
  risks: [
    "Detailed background reports available to anyone",
    "Criminal records may contain errors",
    "Address history reveals your movement patterns",
    "Financial difficulties exposed through bankruptcy records",
    "Professional licenses and workplace history visible",
  ],
  optOutUrl: "https://www.intelius.com/opt-out",
  optOutTime: "P14D",
  difficulty: "Medium",
  steps: [
    {
      name: "Go to Intelius Opt-Out Page",
      text: "Navigate to the official Intelius opt-out page to begin the removal process.",
      url: "https://www.intelius.com/opt-out",
    },
    {
      name: "Search for Your Record",
      text: "Enter your first name, last name, and state to find your listing in their database.",
    },
    {
      name: "Select Your Profile",
      text: "Review the results and select the profile that matches your information.",
    },
    {
      name: "Provide Contact Information",
      text: "Enter your email address and complete any required verification steps.",
    },
    {
      name: "Submit Removal Request",
      text: "Complete the opt-out form and submit your request. Keep the confirmation for your records.",
    },
    {
      name: "Wait for Processing",
      text: "Intelius takes 7-14 days to process removals. Check back to verify your record is removed.",
    },
  ],
  faqs: [
    {
      question: "Does removing from Intelius remove from other PeopleConnect sites?",
      answer: "No, PeopleConnect owns multiple sites (Intelius, USSearch, ZabaSearch). Each requires separate removal requests.",
    },
    {
      question: "Why does Intelius take so long?",
      answer: "Intelius processes removals in batches, which takes 7-14 days. This is longer than many competitors.",
    },
    {
      question: "Can I expedite my Intelius removal?",
      answer: "There is no official expedited process. Using an automated service like GhostMyData can help track and manage the request.",
    },
    {
      question: "Will my Intelius information reappear?",
      answer: "Possibly. Intelius updates from public records regularly. Continuous monitoring is recommended.",
    },
  ],
  relatedBrokers: [
    { name: "BeenVerified", slug: "beenverified" },
    { name: "TruthFinder", slug: "truthfinder" },
    { name: "USSearch", slug: "ussearch" },
    { name: "Instant Checkmate", slug: "instant-checkmate" },
    { name: "Spokeo", slug: "spokeo" },
  ],
  lastUpdated: "January 24, 2026",
};

export default function InteliusRemovalPage() {
  return <BrokerRemovalTemplate broker={inteliusInfo} />;
}
