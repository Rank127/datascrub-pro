import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from BeenVerified (2026 Guide) | GhostMyData",
  description:
    "Step-by-step guide to remove your personal information from BeenVerified. Learn the opt-out process and protect your privacy from background checks.",
  keywords: [
    "remove from beenverified",
    "beenverified opt out",
    "beenverified removal",
    "delete beenverified listing",
    "beenverified background check removal",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/beenverified",
  },
};

const beenverifiedInfo: BrokerInfo = {
  name: "BeenVerified",
  slug: "beenverified",
  description:
    "BeenVerified is a popular background check service that aggregates public records, social media data, and other personal information into searchable profiles.",
  dataCollected: [
    "Full name and aliases",
    "Current and past addresses",
    "Phone numbers and emails",
    "Criminal records",
    "Court records",
    "Property records",
    "Social media profiles",
    "Relatives and associates",
    "Employment history",
    "Education records",
  ],
  risks: [
    "Background checks by employers may surface outdated information",
    "Criminal record data may be inaccurate or belong to someone else",
    "Landlords use this for tenant screening",
    "Personal relationships exposed through associate data",
    "Financial records visible to anyone paying for a report",
  ],
  optOutUrl: "https://www.beenverified.com/app/optout/search",
  optOutTime: "PT24H",
  difficulty: "Easy",
  steps: [
    {
      name: "Find Your BeenVerified Profile",
      text: "Visit the BeenVerified opt-out page and search for your name and state to find your listing.",
      url: "https://www.beenverified.com/app/optout/search",
    },
    {
      name: "Select Your Record",
      text: "Review the search results and click on the record that matches your information.",
    },
    {
      name: "Enter Your Email",
      text: "Provide a valid email address where you can receive the verification link.",
    },
    {
      name: "Verify Your Email",
      text: "Check your inbox for an email from BeenVerified and click the verification link to confirm your opt-out request.",
    },
    {
      name: "Confirm Removal",
      text: "Your record should be removed within 24 hours. Search for yourself again to verify removal.",
    },
  ],
  faqs: [
    {
      question: "How long does BeenVerified removal take?",
      answer: "BeenVerified is one of the fastest - removals typically complete within 24 hours after email verification.",
    },
    {
      question: "Does BeenVerified removal affect other sites?",
      answer: "No, BeenVerified shares data with affiliated sites. You may need separate removals for PeopleLooker, NumberGuru, and others.",
    },
    {
      question: "Is BeenVerified opt-out permanent?",
      answer: "The opt-out is permanent for that record, but new records may be created from updated public data sources.",
    },
    {
      question: "Can employers still run background checks?",
      answer: "Yes, employers use different databases. Removing from BeenVerified only affects their consumer-facing search.",
    },
  ],
  lastUpdated: "January 24, 2026",
};

export default function BeenVerifiedRemovalPage() {
  return <BrokerRemovalTemplate broker={beenverifiedInfo} />;
}
