import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from PeopleFinder (2026 Guide) | GhostMyData",
  description:
    "Complete guide to remove your personal information from PeopleFinder. Step-by-step opt-out instructions.",
  keywords: [
    "remove from peoplefinder",
    "peoplefinder opt out",
    "peoplefinder removal",
    "delete peoplefinder listing",
    "peoplefinder privacy",
    "how to remove yourself from peoplefinder",
    "peoplefinder opt-out guide",
    "peoplefinder data removal",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/peoplefinder",
  },
};

const peoplefinderInfo: BrokerInfo = {
  name: "PeopleFinder",
  slug: "peoplefinder",
  description:
    "PeopleFinder is a people search service that provides access to public records, contact information, and background data for individuals across the US.",
  dataCollected: [
    "Full name",
    "Current and past addresses",
    "Phone numbers",
    "Email addresses",
    "Age and date of birth",
    "Relatives",
    "Associates",
    "Property records",
    "Court records",
  ],
  risks: [
    "Personal contact information publicly searchable",
    "Address history reveals movement patterns",
    "Family connections exposed",
    "Court records visible",
    "Used for skip tracing and debt collection",
  ],
  optOutUrl: "https://www.peoplefinder.com/optout.php",
  optOutTime: "P5D",
  difficulty: "Easy",
  steps: [
    {
      name: "Visit Opt-Out Page",
      text: "Go to PeopleFinder's official opt-out page to begin the removal process.",
      url: "https://www.peoplefinder.com/optout.php",
    },
    {
      name: "Search for Your Listing",
      text: "Enter your name and state to find your record in their database.",
    },
    {
      name: "Select Your Record",
      text: "Click on the record that matches your information.",
    },
    {
      name: "Complete the Opt-Out Form",
      text: "Fill out the required fields including your email address.",
    },
    {
      name: "Verify via Email",
      text: "Check your inbox for a verification email and click the link to confirm.",
    },
    {
      name: "Confirm Removal",
      text: "Your record should be removed within 3-5 business days.",
    },
  ],
  faqs: [
    {
      question: "How long does PeopleFinder removal take?",
      answer: "PeopleFinder typically processes removals within 3-5 business days after email verification.",
    },
    {
      question: "Is PeopleFinder different from PeopleFinders?",
      answer: "Yes, PeopleFinder and PeopleFinders are different companies with separate databases. Check both.",
    },
    {
      question: "Will my data stay removed from PeopleFinder?",
      answer: "The removal is permanent for that record, but monitoring is recommended as new records may appear.",
    },
    {
      question: "Can I remove family members from PeopleFinder?",
      answer: "Each person needs to submit their own opt-out request with their own email verification.",
    },
  ],
  relatedBrokers: [
    { name: "Spokeo", slug: "spokeo" },
    { name: "WhitePages", slug: "whitepages" },
    { name: "TruePeopleSearch", slug: "truepeoplesearch" },
    { name: "FastPeopleSearch", slug: "fastpeoplesearch" },
    { name: "Nuwber", slug: "nuwber" },
  ],
  lastUpdated: "January 24, 2026",
};

export default function PeopleFinderRemovalPage() {
  return <BrokerRemovalTemplate broker={peoplefinderInfo} />;
}
