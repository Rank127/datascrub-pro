import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from TruthFinder (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from TruthFinder. Learn the opt-out process, what data TruthFinder collects, and how to permanently delete your listing.",
  keywords: [
    "remove from truthfinder",
    "truthfinder opt out",
    "truthfinder removal",
    "delete truthfinder listing",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/truthfinder",
  },
  openGraph: {
    title: "How to Remove Yourself from TruthFinder (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from TruthFinder.",
    url: "https://ghostmydata.com/remove-from/truthfinder",
    type: "article",
  },
};

const truthfinderInfo: BrokerInfo = {
  name: "TruthFinder",
  slug: "truthfinder",
  description:
    "TruthFinder is a people-search and background check site. It compiles public records, social media, and contact data into detailed reports.",
  dataCollected: [
    "Full name",
    "Current and past addresses",
    "Phone numbers",
    "Email addresses",
    "Criminal records",
    "Social media profiles",
    "Property records",
    "Relatives and associates",
    "Employment history",
    "Education",
  ],
  risks: [
    "Identity theft from detailed profiles",
    "Stalkers finding your address",
    "Employers seeing old records",
    "Scammers targeting you",
    "Background check inaccuracies",
  ],
  optOutUrl: "https://www.truthfinder.com/opt-out/",
  optOutTime: "PT336H",
  difficulty: "Medium",
  steps: [
    {
      name: "Search for Your Listing",
      text: "Go to truthfinder.com and search for your name. Find your profile in the results.",
      url: "https://www.truthfinder.com",
    },
    {
      name: "Copy Your Profile URL",
      text: "Click on your profile and copy the full URL from your browser&apos;s address bar.",
    },
    {
      name: "Go to the Opt-Out Page",
      text: "Visit truthfinder.com/opt-out/ to start the removal process.",
      url: "https://www.truthfinder.com/opt-out/",
    },
    {
      name: "Submit Your Information",
      text: "Paste your profile URL and enter your email address in the opt-out form.",
    },
    {
      name: "Complete the CAPTCHA",
      text: "Complete the CAPTCHA verification to prove you are a real person.",
    },
    {
      name: "Confirm via Email",
      text: "Check your email and click the confirmation link from TruthFinder.",
    },
    {
      name: "Verify Removal",
      text: "Wait 7-14 days, then search for yourself again to confirm your listing has been removed.",
    },
  ],
  faqs: [
    {
      question: "How long does TruthFinder removal take?",
      answer: "TruthFinder removal typically takes 7-14 days after you confirm the opt-out via email.",
    },
    {
      question: "Can my data reappear after removal?",
      answer: "Yes. TruthFinder may re-list your data if they receive updated public records. Regular monitoring helps catch re-listings.",
    },
    {
      question: "Is TruthFinder opt-out free?",
      answer: "Yes. The opt-out process is completely free. Be cautious of third-party sites that charge for this service.",
    },
    {
      question: "What if I have multiple listings on TruthFinder?",
      answer: "You may have multiple profiles under different name variations or addresses. You need to submit a separate opt-out request for each listing.",
    },
    {
      question: "Can GhostMyData remove me from TruthFinder?",
      answer: "Yes. GhostMyData handles TruthFinder removal along with 2,100+ other data broker sites. We also monitor for re-listings.",
    },
    {
      question: "Why does TruthFinder have my data?",
      answer: "TruthFinder aggregates data from public records, court filings, social media, and other publicly available sources to build people-search profiles.",
    },
  ],
  lastUpdated: "February 15, 2026",
};

export default function TruthFinderRemovalPage() {
  return <BrokerRemovalTemplate broker={truthfinderInfo} />;
}
