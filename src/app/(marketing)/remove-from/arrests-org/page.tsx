import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from Arrests.org (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your mugshot and arrest record from Arrests.org. Learn the removal process, what data they publish, and how to get your listing deleted.",
  keywords: [
    "remove from arrests.org",
    "arrests.org opt out",
    "arrests.org removal",
    "delete arrests.org listing",
    "arrests.org mugshot removal",
    "remove mugshot from arrests.org",
    "how to remove yourself from arrests.org",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/arrests-org",
  },
  openGraph: {
    title: "How to Remove Yourself from Arrests.org (2026 Guide)",
    description: "Step-by-step instructions to remove your mugshot and arrest record from Arrests.org.",
    url: "https://ghostmydata.com/remove-from/arrests-org",
    type: "article",
  },
};

const arrestsOrgInfo: BrokerInfo = {
  name: "Arrests.org",
  slug: "arrests-org",
  description:
    "Arrests.org publishes mugshots and arrest records from law enforcement agencies across the United States.",
  dataCollected: [
    "Full name",
    "Mugshot photos",
    "Arrest date and charges",
    "Booking information",
    "County and state",
    "Physical description",
  ],
  risks: [
    "Reputation damage",
    "Employment discrimination",
    "Relationship harm",
    "Public embarrassment",
    "Outdated arrest records showing",
  ],
  optOutUrl: "https://arrests.org",
  optOutTime: "PT720H",
  difficulty: "Hard",
  steps: [
    {
      name: "Find Your Record",
      text: "Go to arrests.org and search for your name. Find your listing and note the exact URL.",
      url: "https://arrests.org",
    },
    {
      name: "Copy Your Listing URL",
      text: "Copy the full URL of your arrest record page. You&apos;ll need this for the removal request.",
    },
    {
      name: "Email the Removal Request",
      text: "Send an email to remove@arrests.org with your listing URL and a request to remove your record.",
    },
    {
      name: "Include Verification",
      text: "Include your full name and a government-issued ID for identity verification in your email.",
    },
    {
      name: "Follow Up",
      text: "If you don&apos;t receive a response within 14 days, send a follow-up email referencing your original request.",
    },
    {
      name: "Wait for Processing",
      text: "Wait 7-30 days for your removal to be processed. Check back periodically to confirm the listing is gone.",
    },
  ],
  faqs: [
    {
      question: "Why is it so hard to remove records from Arrests.org?",
      answer: "Arrests.org publishes publicly available arrest records and considers them newsworthy. They have a slow and manual removal process that requires identity verification.",
    },
    {
      question: "Does it cost money to remove my record?",
      answer: "Arrests.org does not charge for removal. Be cautious of third-party sites that claim to remove records for a fee but may be scams.",
    },
    {
      question: "Can my record be re-posted after removal?",
      answer: "It&apos;s possible. If new arrest data is published by law enforcement, Arrests.org may create a new listing. Ongoing monitoring helps catch re-postings.",
    },
    {
      question: "What legal options do I have if they won&apos;t remove it?",
      answer: "You may be able to pursue legal action under state laws governing mugshot publication. Some states have enacted laws requiring free removal of mugshots. Consult a privacy attorney.",
    },
    {
      question: "Can GhostMyData help with Arrests.org removal?",
      answer: "Yes. We handle the removal process for Arrests.org and 2,100+ other data broker sites. We also monitor for re-postings and remove them again.",
    },
    {
      question: "Why does the removal take so long?",
      answer: "Arrests.org processes removals manually and may have a large backlog. The verification step also adds time. Most removals complete within 30 days.",
    },
  ],
  lastUpdated: "February 15, 2026",
};

export default function ArrestsOrgRemovalPage() {
  return <BrokerRemovalTemplate broker={arrestsOrgInfo} />;
}
