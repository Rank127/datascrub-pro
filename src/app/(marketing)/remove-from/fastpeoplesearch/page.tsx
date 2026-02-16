import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from FastPeopleSearch (2026 Guide) | GhostMyData",
  description:
    "Quick guide to remove your personal information from FastPeopleSearch. Simple opt-out process with step-by-step instructions.",
  keywords: [
    "remove from fastpeoplesearch",
    "fastpeoplesearch opt out",
    "fastpeoplesearch removal",
    "delete fastpeoplesearch listing",
    "fastpeoplesearch privacy",
    "how to remove yourself from fastpeoplesearch",
    "fastpeoplesearch opt-out guide",
    "fastpeoplesearch data removal",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/fastpeoplesearch",
  },
};

const fastpeoplesearchInfo: BrokerInfo = {
  name: "FastPeopleSearch",
  slug: "fastpeoplesearch",
  description:
    "FastPeopleSearch is a free people lookup service that provides quick access to personal information including addresses, phone numbers, and relatives.",
  dataCollected: [
    "Full name",
    "Current address",
    "Previous addresses",
    "Phone numbers",
    "Email addresses",
    "Age",
    "Relatives",
    "Associates",
  ],
  risks: [
    "Free access to anyone searching",
    "Quick lookup makes harassment easy",
    "Address history visible",
    "Family connections exposed",
    "No payment barrier for access",
  ],
  optOutUrl: "https://www.fastpeoplesearch.com/removal",
  optOutTime: "PT48H",
  difficulty: "Easy",
  steps: [
    {
      name: "Go to Removal Page",
      text: "Navigate directly to FastPeopleSearch's removal page to begin the opt-out process.",
      url: "https://www.fastpeoplesearch.com/removal",
    },
    {
      name: "Find Your Record",
      text: "Search for your name and locate the record you want to remove from their database.",
    },
    {
      name: "Click Remove",
      text: "Select your record and click the remove button to initiate the opt-out.",
    },
    {
      name: "Complete Verification",
      text: "Complete any CAPTCHA or verification steps required.",
    },
    {
      name: "Confirm Removal",
      text: "Your record should be removed within 24-48 hours. Check back to verify.",
    },
  ],
  faqs: [
    {
      question: "How long does FastPeopleSearch removal take?",
      answer: "FastPeopleSearch typically processes removals within 24-48 hours, making it one of the faster data brokers.",
    },
    {
      question: "Do I need an account to remove from FastPeopleSearch?",
      answer: "No, FastPeopleSearch allows removal without creating an account.",
    },
    {
      question: "Is FastPeopleSearch removal permanent?",
      answer: "The removal is permanent for that record, but new records may appear from updated public data.",
    },
    {
      question: "How is FastPeopleSearch different from TruePeopleSearch?",
      answer: "They are separate companies with different databases. You need to remove from both separately.",
    },
  ],
  relatedBrokers: [
    { name: "TruePeopleSearch", slug: "truepeoplesearch" },
    { name: "Spokeo", slug: "spokeo" },
    { name: "SearchPeopleFree", slug: "searchpeoplefree" },
    { name: "PeopleFinder", slug: "peoplefinder" },
    { name: "WhitePages", slug: "whitepages" },
  ],
  lastUpdated: "January 24, 2026",
};

export default function FastPeopleSearchRemovalPage() {
  return <BrokerRemovalTemplate broker={fastpeoplesearchInfo} />;
}
