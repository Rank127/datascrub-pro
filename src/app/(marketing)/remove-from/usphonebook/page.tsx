import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from USPhonebook (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from USPhonebook. Learn the opt-out process, what data USPhonebook collects, and how to permanently delete your listing.",
  keywords: [
    "remove from usphonebook",
    "usphonebook opt out",
    "usphonebook removal",
    "delete usphonebook listing",
    "usphonebook privacy",
    "how to remove yourself from usphonebook",
    "usphonebook opt-out guide",
    "usphonebook data removal",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/usphonebook",
  },
  openGraph: {
    title: "How to Remove Yourself from USPhonebook (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from USPhonebook.",
    url: "https://ghostmydata.com/remove-from/usphonebook",
    type: "article",
  },
};

const usphonebookInfo: BrokerInfo = {
  name: "USPhonebook",
  slug: "usphonebook",
  description:
    "USPhonebook is a free phone number lookup service that lets anyone search for people by name, phone, or address.",
  dataCollected: [
    "Full name",
    "Phone numbers",
    "Addresses",
    "Carrier information",
    "Connected people",
  ],
  risks: [
    "Unwanted calls",
    "Stalking",
    "Harassment",
    "Spam",
    "Identity theft",
  ],
  optOutUrl: "https://www.usphonebook.com/opt-out",
  optOutTime: "PT48H",
  difficulty: "Easy",
  steps: [
    {
      name: "Search for Your Listing",
      text: "Go to usphonebook.com and search for your name or phone number to find your listing.",
      url: "https://www.usphonebook.com",
    },
    {
      name: "Copy Your Profile URL",
      text: "Click on your listing and copy the full URL from your browser&apos;s address bar.",
    },
    {
      name: "Visit the Opt-Out Page",
      text: "Go to the USPhonebook opt-out page to start the removal process.",
      url: "https://www.usphonebook.com/opt-out",
    },
    {
      name: "Submit Your Removal Request",
      text: "Paste your profile URL, enter your information, and submit the opt-out form.",
    },
    {
      name: "Verify Removal",
      text: "Wait 24-48 hours, then search for yourself again to confirm your listing has been removed.",
    },
  ],
  faqs: [
    {
      question: "How long does USPhonebook removal take?",
      answer: "USPhonebook removals are typically processed within 24-48 hours.",
    },
    {
      question: "Can my data reappear on USPhonebook?",
      answer: "Yes. USPhonebook may re-list your information if they receive updated data from their sources. Regular monitoring helps.",
    },
    {
      question: "Is USPhonebook opt-out free?",
      answer: "Yes. The opt-out process is completely free. Never pay for something you can do yourself at no cost.",
    },
    {
      question: "Can GhostMyData remove me from USPhonebook?",
      answer: "Yes. GhostMyData handles USPhonebook removal along with 2,100+ other data broker sites, with ongoing monitoring for re-listings.",
    },
    {
      question: "Why does USPhonebook have my phone number?",
      answer: "USPhonebook collects data from public records, phone directories, and other publicly available sources to build their database.",
    },
  ],
  relatedBrokers: [
    { name: "Spokeo", slug: "spokeo" },
    { name: "WhitePages", slug: "whitepages" },
    { name: "TruePeopleSearch", slug: "truepeoplesearch" },
    { name: "That's Them", slug: "thatsthem" },
    { name: "Cocofinder", slug: "cocofinder" },
  ],
  lastUpdated: "February 15, 2026",
};

export default function USPhonebookRemovalPage() {
  return <BrokerRemovalTemplate broker={usphonebookInfo} />;
}
