import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from SearchPeopleFree (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from SearchPeopleFree. Learn the opt-out process, what data they collect, and how to permanently delete your listing.",
  keywords: [
    "remove from searchpeoplefree",
    "searchpeoplefree opt out",
    "searchpeoplefree removal",
    "delete searchpeoplefree listing",
    "searchpeoplefree privacy",
    "remove searchpeoplefree profile",
    "how to remove yourself from searchpeoplefree",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/searchpeoplefree",
  },
  openGraph: {
    title: "How to Remove Yourself from SearchPeopleFree (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from SearchPeopleFree.",
    url: "https://ghostmydata.com/remove-from/searchpeoplefree",
    type: "article",
  },
};

const searchPeopleFreeInfo: BrokerInfo = {
  name: "SearchPeopleFree",
  slug: "searchpeoplefree",
  description:
    "SearchPeopleFree is a free people search website that aggregates public records, phone numbers, addresses, and more.",
  dataCollected: [
    "Full name",
    "Addresses",
    "Phone numbers",
    "Email addresses",
    "Age",
    "Relatives",
    "Property records",
  ],
  risks: [
    "Identity theft",
    "Unwanted calls",
    "Stalking",
    "Privacy invasion",
    "Spam",
  ],
  optOutUrl: "https://www.searchpeoplefree.com/opt-out",
  optOutTime: "PT48H",
  difficulty: "Easy",
  steps: [
    {
      name: "Find Your Listing",
      text: "Go to searchpeoplefree.com and search for your name. Find your profile and copy the URL.",
      url: "https://www.searchpeoplefree.com",
    },
    {
      name: "Visit the Opt-Out Page",
      text: "Go to the SearchPeopleFree opt-out page to begin the removal process.",
      url: "https://www.searchpeoplefree.com/opt-out",
    },
    {
      name: "Submit Your Information",
      text: "Enter your profile URL and email address into the opt-out form to submit your removal request.",
    },
    {
      name: "Confirm via Email",
      text: "Check your inbox for a verification email from SearchPeopleFree. Click the confirmation link to finalize your removal.",
    },
    {
      name: "Verify Removal",
      text: "Wait 24-48 hours, then search for yourself again on SearchPeopleFree to confirm your listing has been removed.",
    },
  ],
  faqs: [
    {
      question: "How long does SearchPeopleFree removal take?",
      answer: "Most removals are processed within 24-48 hours after you confirm via email. This is one of the faster opt-out processes available.",
    },
    {
      question: "Is SearchPeopleFree opt-out free?",
      answer: "Yes. The removal process is completely free. Do not pay any third-party site that claims to charge for SearchPeopleFree removal.",
    },
    {
      question: "Will my data come back on SearchPeopleFree?",
      answer: "It can. SearchPeopleFree continuously aggregates public records. Your profile may reappear if new data is found. Regular monitoring is recommended.",
    },
    {
      question: "Can I remove multiple listings?",
      answer: "Yes. If you have multiple profiles under different name variations or addresses, you need to submit a separate opt-out request for each one.",
    },
    {
      question: "Can GhostMyData handle this for me?",
      answer: "Yes. We remove you from SearchPeopleFree and 2,100+ other data broker sites. We also monitor for new listings and remove them automatically.",
    },
  ],
  lastUpdated: "February 15, 2026",
};

export default function SearchPeopleFreeRemovalPage() {
  return <BrokerRemovalTemplate broker={searchPeopleFreeInfo} />;
}
