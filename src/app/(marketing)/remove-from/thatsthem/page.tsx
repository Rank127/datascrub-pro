import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from That\u0027s Them (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from That's Them. Learn the opt-out process and how to permanently delete your listing.",
  keywords: [
    "remove from thatsthem",
    "thatsthem opt out",
    "that's them removal",
    "delete thatsthem listing",
    "thatsthem privacy",
    "remove thatsthem profile",
    "how to remove yourself from that's them",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/thatsthem",
  },
  openGraph: {
    title: "How to Remove Yourself from That's Them (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from That's Them.",
    url: "https://ghostmydata.com/remove-from/thatsthem",
    type: "article",
  },
};

const thatSThemInfo: BrokerInfo = {
  name: "That\u0027s Them",
  slug: "thatsthem",
  description:
    "That\u0027s Them is a free people search site that provides addresses, phone numbers, emails, and IP addresses linked to individuals.",
  dataCollected: [
    "Full name",
    "Addresses",
    "Phone numbers",
    "Email addresses",
    "IP addresses",
    "Age",
    "Associated people",
  ],
  risks: [
    "IP address exposure",
    "Identity theft",
    "Unwanted contact",
    "Digital tracking",
    "Privacy invasion",
  ],
  optOutUrl: "https://thatsthem.com/optout",
  optOutTime: "PT72H",
  difficulty: "Easy",
  steps: [
    {
      name: "Search for Your Listing",
      text: "Go to thatsthem.com and search for yourself using your name, phone number, or email address.",
      url: "https://thatsthem.com",
    },
    {
      name: "Find Your Record",
      text: "Locate your listing in the search results. Note the personal information displayed including your IP address, phone, and email.",
    },
    {
      name: "Go to the Opt-Out Page",
      text: "Visit the That\u0027s Them opt-out page to begin the removal process.",
      url: "https://thatsthem.com/optout",
    },
    {
      name: "Submit Your Removal Request",
      text: "Enter the required details and submit your opt-out request. You may need to provide your email for verification.",
    },
    {
      name: "Verify Removal",
      text: "Wait up to 72 hours, then search for yourself again to confirm your listing has been removed.",
    },
  ],
  faqs: [
    {
      question: "How long does That\u0027s Them removal take?",
      answer: "That\u0027s Them typically processes removal requests within 72 hours. Check back after a few days to confirm your listing is gone.",
    },
    {
      question: "Can my data reappear on That\u0027s Them?",
      answer: "Yes. That\u0027s Them aggregates data from public sources. New data can lead to a new listing being created. Ongoing monitoring is recommended.",
    },
    {
      question: "Why does That\u0027s Them show my IP address?",
      answer: "That\u0027s Them collects IP addresses from data breaches, public Wi-Fi logs, and other publicly available sources. Removing your listing helps protect this sensitive information.",
    },
    {
      question: "Can GhostMyData remove me from That\u0027s Them?",
      answer: "Yes. GhostMyData automatically removes your data from That\u0027s Them and 2,100+ other data brokers, with continuous monitoring to catch re-listings.",
    },
    {
      question: "Is the That\u0027s Them opt-out free?",
      answer: "Yes. The opt-out process on That\u0027s Them is completely free. Beware of third-party sites that charge fees for the same service.",
    },
  ],
  lastUpdated: "February 15, 2026",
};

export default function ThatSThemRemovalPage() {
  return <BrokerRemovalTemplate broker={thatSThemInfo} />;
}
