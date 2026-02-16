import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from ClustrMaps (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from ClustrMaps. Learn the opt-out process and how to permanently delete your listing.",
  keywords: [
    "remove from clustrmaps",
    "clustrmaps opt out",
    "clustrmaps removal",
    "delete clustrmaps listing",
    "clustrmaps privacy",
    "remove clustrmaps profile",
    "how to remove yourself from clustrmaps",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/clustrmaps",
  },
  openGraph: {
    title: "How to Remove Yourself from ClustrMaps (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from ClustrMaps.",
    url: "https://ghostmydata.com/remove-from/clustrmaps",
    type: "article",
  },
};

const clustrMapsInfo: BrokerInfo = {
  name: "ClustrMaps",
  slug: "clustrmaps",
  description:
    "ClustrMaps is a people search and data aggregation site that maps personal information to geographic locations.",
  dataCollected: [
    "Full name",
    "Addresses",
    "Phone numbers",
    "Email addresses",
    "Age",
    "Relatives",
    "Mapped locations",
  ],
  risks: [
    "Location tracking",
    "Identity theft",
    "Stalking",
    "Geographic profiling",
    "Privacy invasion",
  ],
  optOutUrl: "https://clustrmaps.com/bl/opt-out",
  optOutTime: "PT168H",
  difficulty: "Medium",
  steps: [
    {
      name: "Search for Your Listing",
      text: "Go to clustrmaps.com and search for your name to find your profile.",
      url: "https://clustrmaps.com",
    },
    {
      name: "Review Your Profile",
      text: "Click on your listing to see the full details. Note what personal information is displayed, including mapped locations.",
    },
    {
      name: "Navigate to the Opt-Out Page",
      text: "Visit the ClustrMaps opt-out page to begin the removal process.",
      url: "https://clustrmaps.com/bl/opt-out",
    },
    {
      name: "Enter Your Information",
      text: "Provide the required details on the opt-out form, including your name and the URL of your ClustrMaps listing.",
    },
    {
      name: "Submit and Verify",
      text: "Submit your opt-out request. You may receive a verification email - click the link to confirm your request.",
    },
    {
      name: "Confirm Removal",
      text: "Wait up to 7 days (168 hours), then search for yourself again on ClustrMaps to confirm your listing has been removed.",
    },
  ],
  faqs: [
    {
      question: "How long does ClustrMaps removal take?",
      answer: "ClustrMaps removal typically takes up to 7 days (168 hours). The process may take longer during high-volume periods.",
    },
    {
      question: "Why does ClustrMaps map my location?",
      answer: "ClustrMaps aggregates public records and plots addresses on maps, creating a visual representation of where people live. This makes location data particularly easy to find.",
    },
    {
      question: "Can my data reappear on ClustrMaps?",
      answer: "Yes. ClustrMaps continuously collects data from public sources. Your listing may reappear if new records are found. Ongoing monitoring helps catch re-listings.",
    },
    {
      question: "Can GhostMyData remove me from ClustrMaps?",
      answer: "Yes. GhostMyData automatically removes your data from ClustrMaps and 2,100+ other data brokers, with continuous monitoring to prevent re-listings.",
    },
    {
      question: "Is the ClustrMaps opt-out free?",
      answer: "Yes. The opt-out process on ClustrMaps is free. You should never have to pay to remove your own personal information from a data broker.",
    },
  ],
  relatedBrokers: [
    { name: "Spokeo", slug: "spokeo" },
    { name: "TruePeopleSearch", slug: "truepeoplesearch" },
    { name: "FamilyTreeNow", slug: "familytreenow" },
    { name: "WhitePages", slug: "whitepages" },
    { name: "Nuwber", slug: "nuwber" },
  ],
  lastUpdated: "February 15, 2026",
};

export default function ClustrMapsRemovalPage() {
  return <BrokerRemovalTemplate broker={clustrMapsInfo} />;
}
