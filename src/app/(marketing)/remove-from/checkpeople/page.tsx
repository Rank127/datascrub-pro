import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from Checkpeople (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from Checkpeople. Learn the opt-out process, what data Checkpeople collects, and how to permanently delete your listing.",
  keywords: [
    "remove from checkpeople",
    "checkpeople opt out",
    "checkpeople removal",
    "delete checkpeople listing",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/checkpeople",
  },
  openGraph: {
    title: "How to Remove Yourself from Checkpeople (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from Checkpeople.",
    url: "https://ghostmydata.com/remove-from/checkpeople",
    type: "article",
  },
};

const checkpeopleInfo: BrokerInfo = {
  name: "Checkpeople",
  slug: "checkpeople",
  description:
    "Checkpeople is a free people search engine that provides access to public records, addresses, phone numbers, and more.",
  dataCollected: [
    "Full name",
    "Addresses",
    "Phone numbers",
    "Email addresses",
    "Relatives",
    "Age",
    "Social media links",
  ],
  risks: [
    "Unwanted contact",
    "Identity theft",
    "Stalking",
    "Privacy invasion",
    "Spam",
  ],
  optOutUrl: "https://www.checkpeople.com/opt-out",
  optOutTime: "PT48H",
  difficulty: "Easy",
  steps: [
    {
      name: "Search for Your Listing",
      text: "Go to checkpeople.com and search for your name. Find your profile in the results.",
      url: "https://www.checkpeople.com",
    },
    {
      name: "Copy Your Profile URL",
      text: "Click on your profile and copy the full URL from your browser&apos;s address bar.",
    },
    {
      name: "Visit the Opt-Out Page",
      text: "Go to the Checkpeople opt-out page to start the removal process.",
      url: "https://www.checkpeople.com/opt-out",
    },
    {
      name: "Submit Your Request",
      text: "Enter your information and paste your profile URL into the opt-out form.",
    },
    {
      name: "Verify Removal",
      text: "Wait 24-48 hours, then search for yourself again to confirm your listing has been removed.",
    },
  ],
  faqs: [
    {
      question: "How long does Checkpeople removal take?",
      answer: "Checkpeople removals are typically processed within 24-48 hours.",
    },
    {
      question: "Can my data reappear on Checkpeople?",
      answer: "Yes. Checkpeople may re-list your information if they receive updated data from their sources. Regular monitoring helps catch this.",
    },
    {
      question: "Is the opt-out process free?",
      answer: "Yes. Opting out of Checkpeople is completely free. Do not pay any site claiming to charge for this.",
    },
    {
      question: "Can GhostMyData remove me from Checkpeople?",
      answer: "Yes. GhostMyData handles Checkpeople removal along with 2,100+ other data broker sites, with ongoing monitoring for re-listings.",
    },
    {
      question: "Why does Checkpeople have my information?",
      answer: "Checkpeople collects data from public records, government databases, and other publicly available sources to build their people search profiles.",
    },
  ],
  lastUpdated: "February 15, 2026",
};

export default function CheckpeopleRemovalPage() {
  return <BrokerRemovalTemplate broker={checkpeopleInfo} />;
}
