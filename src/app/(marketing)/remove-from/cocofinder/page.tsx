import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from Cocofinder (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from Cocofinder. Learn the opt-out process and how to permanently delete your listing.",
  keywords: [
    "remove from cocofinder",
    "cocofinder opt out",
    "cocofinder removal",
    "delete cocofinder listing",
    "cocofinder privacy",
    "remove cocofinder profile",
    "how to remove yourself from cocofinder",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/cocofinder",
  },
  openGraph: {
    title: "How to Remove Yourself from Cocofinder (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from Cocofinder.",
    url: "https://ghostmydata.com/remove-from/cocofinder",
    type: "article",
  },
};

const cocofinderInfo: BrokerInfo = {
  name: "Cocofinder",
  slug: "cocofinder",
  description:
    "Cocofinder is a people search engine that aggregates public records, phone lookups, and address data into searchable profiles.",
  dataCollected: [
    "Full name",
    "Addresses",
    "Phone numbers",
    "Email addresses",
    "Age",
    "Relatives",
    "Social media profiles",
  ],
  risks: [
    "Identity theft",
    "Unwanted contact",
    "Privacy invasion",
    "Stalking",
    "Spam calls",
  ],
  optOutUrl: "https://cocofinder.com/remove-my-info",
  optOutTime: "PT48H",
  difficulty: "Easy",
  steps: [
    {
      name: "Search for Your Listing",
      text: "Go to cocofinder.com and search for your name to find your profile in the results.",
      url: "https://cocofinder.com",
    },
    {
      name: "Review Your Profile",
      text: "Click on your listing to review the personal information displayed, including phone numbers, addresses, and social media links.",
    },
    {
      name: "Visit the Removal Page",
      text: "Go to the Cocofinder removal page to start the opt-out process.",
      url: "https://cocofinder.com/remove-my-info",
    },
    {
      name: "Submit Your Removal Request",
      text: "Fill out the removal form with the required information. Provide the URL of your Cocofinder profile and your email address for verification.",
    },
    {
      name: "Verify and Confirm",
      text: "Check your email for a verification message. Click the confirmation link, then wait up to 48 hours for the removal to process. Search again to confirm your listing is gone.",
    },
  ],
  faqs: [
    {
      question: "How long does Cocofinder removal take?",
      answer: "Cocofinder typically processes removal requests within 48 hours. Search for yourself again after two days to confirm your listing has been removed.",
    },
    {
      question: "Can my data reappear on Cocofinder?",
      answer: "Yes. Cocofinder continuously scrapes public records and other sources. If new data is found, a new profile may be created. Regular monitoring is recommended.",
    },
    {
      question: "Does Cocofinder show my social media profiles?",
      answer: "Yes. Cocofinder links social media accounts to personal profiles. Removing your listing also removes these associations from their search results.",
    },
    {
      question: "Can GhostMyData remove me from Cocofinder?",
      answer: "Yes. GhostMyData automatically removes your data from Cocofinder and 2,100+ other data brokers, with continuous monitoring to catch re-listings.",
    },
    {
      question: "Is the Cocofinder opt-out free?",
      answer: "Yes. The Cocofinder removal process is completely free. You should never have to pay to remove your personal information from a data broker site.",
    },
  ],
  relatedBrokers: [
    { name: "Spokeo", slug: "spokeo" },
    { name: "TruePeopleSearch", slug: "truepeoplesearch" },
    { name: "SearchPeopleFree", slug: "searchpeoplefree" },
    { name: "Nuwber", slug: "nuwber" },
    { name: "PeopleFinder", slug: "peoplefinder" },
  ],
  lastUpdated: "February 15, 2026",
};

export default function CocofinderRemovalPage() {
  return <BrokerRemovalTemplate broker={cocofinderInfo} />;
}
