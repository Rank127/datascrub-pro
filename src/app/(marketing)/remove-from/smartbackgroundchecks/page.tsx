import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from Smart Background Checks (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from Smart Background Checks. Learn the opt-out process, what data they collect, and how to permanently delete your listing.",
  keywords: [
    "remove from smart background checks",
    "smart background checks opt out",
    "smart background checks removal",
    "delete smart background checks listing",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/smartbackgroundchecks",
  },
  openGraph: {
    title: "How to Remove Yourself from Smart Background Checks (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from Smart Background Checks.",
    url: "https://ghostmydata.com/remove-from/smartbackgroundchecks",
    type: "article",
  },
};

const smartBackgroundChecksInfo: BrokerInfo = {
  name: "Smart Background Checks",
  slug: "smartbackgroundchecks",
  description:
    "Smart Background Checks aggregates public records and background check data into profiles that anyone can search.",
  dataCollected: [
    "Full name",
    "Addresses",
    "Phone numbers",
    "Email addresses",
    "Criminal records",
    "Court records",
    "Relatives",
    "Property records",
  ],
  risks: [
    "Background check issues",
    "Identity theft",
    "Stalking",
    "Spam",
    "Employment problems",
  ],
  optOutUrl: "https://www.smartbackgroundchecks.com/optout",
  optOutTime: "PT168H",
  difficulty: "Medium",
  steps: [
    {
      name: "Find Your Listing",
      text: "Go to smartbackgroundchecks.com and search for your name. Find your profile in the results.",
      url: "https://www.smartbackgroundchecks.com",
    },
    {
      name: "Copy Your Profile URL",
      text: "Click on your profile and copy the full URL from your browser&apos;s address bar.",
    },
    {
      name: "Visit the Opt-Out Page",
      text: "Go to the Smart Background Checks opt-out page to begin the removal process.",
      url: "https://www.smartbackgroundchecks.com/optout",
    },
    {
      name: "Submit Your Request",
      text: "Enter your information and paste your profile URL into the opt-out form. Complete the CAPTCHA if required.",
    },
    {
      name: "Confirm via Email",
      text: "Check your email for a confirmation message and click the verification link to complete the opt-out.",
    },
    {
      name: "Verify Removal",
      text: "Wait 5-7 days, then search for yourself again to confirm your listing has been removed.",
    },
  ],
  faqs: [
    {
      question: "How long does Smart Background Checks removal take?",
      answer: "Removal typically takes 5-7 days after you confirm the opt-out request via email.",
    },
    {
      question: "Can my data reappear after removal?",
      answer: "Yes. Smart Background Checks may re-list your data if new public records become available. Ongoing monitoring is recommended.",
    },
    {
      question: "Is the opt-out process free?",
      answer: "Yes. Opting out of Smart Background Checks is completely free.",
    },
    {
      question: "Can GhostMyData remove me from Smart Background Checks?",
      answer: "Yes. GhostMyData handles removal from Smart Background Checks and 2,100+ other data broker sites, with ongoing monitoring.",
    },
    {
      question: "Why does Smart Background Checks have my data?",
      answer: "Smart Background Checks compiles data from public records, court filings, government databases, and other publicly available sources.",
    },
  ],
  lastUpdated: "February 15, 2026",
};

export default function SmartBackgroundChecksRemovalPage() {
  return <BrokerRemovalTemplate broker={smartBackgroundChecksInfo} />;
}
