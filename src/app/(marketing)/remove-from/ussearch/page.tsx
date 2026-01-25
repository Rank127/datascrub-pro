import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from USSearch (2026 Guide) | GhostMyData",
  description:
    "Step-by-step guide to remove your personal information from USSearch background check service.",
  keywords: [
    "remove from ussearch",
    "ussearch opt out",
    "ussearch removal",
    "delete ussearch record",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/ussearch",
  },
};

const ussearchInfo: BrokerInfo = {
  name: "USSearch",
  slug: "ussearch",
  description:
    "USSearch is a background check and people search service owned by PeopleConnect, providing comprehensive personal information reports similar to Intelius.",
  dataCollected: [
    "Full name",
    "Date of birth",
    "Current and past addresses",
    "Phone numbers",
    "Email addresses",
    "Criminal records",
    "Court records",
    "Property ownership",
    "Bankruptcy records",
    "Relatives and associates",
  ],
  risks: [
    "Comprehensive background reports available",
    "Criminal history exposed",
    "Financial records visible",
    "Part of larger data broker network",
    "Employment screening risk",
  ],
  optOutUrl: "https://www.ussearch.com/opt-out/submit/",
  optOutTime: "P7D",
  difficulty: "Medium",
  steps: [
    {
      name: "Go to USSearch Opt-Out Page",
      text: "Navigate to the official USSearch opt-out submission page.",
      url: "https://www.ussearch.com/opt-out/submit/",
    },
    {
      name: "Search for Your Record",
      text: "Enter your first name, last name, and state to find your listing.",
    },
    {
      name: "Select Your Profile",
      text: "Review the search results and select the profile that matches your information.",
    },
    {
      name: "Submit Opt-Out Request",
      text: "Complete the opt-out form with your email address for verification.",
    },
    {
      name: "Verify via Email",
      text: "Check your inbox and click the verification link to confirm your removal request.",
    },
    {
      name: "Wait for Processing",
      text: "USSearch takes 5-7 days to process removals. Check back to verify.",
    },
  ],
  faqs: [
    {
      question: "Is USSearch the same as Intelius?",
      answer: "USSearch and Intelius are both owned by PeopleConnect but maintain separate databases. You need to remove from both.",
    },
    {
      question: "How long does USSearch removal take?",
      answer: "USSearch typically processes removals within 5-7 business days.",
    },
    {
      question: "Will removing from USSearch affect other PeopleConnect sites?",
      answer: "No, each PeopleConnect site requires a separate removal request.",
    },
    {
      question: "Is USSearch opt-out permanent?",
      answer: "The opt-out is permanent for that record, but new records may appear from updated data sources.",
    },
  ],
  lastUpdated: "January 24, 2026",
};

export default function USSearchRemovalPage() {
  return <BrokerRemovalTemplate broker={ussearchInfo} />;
}
