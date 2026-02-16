import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from ZoomInfo (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from ZoomInfo. Learn the opt-out process and how to permanently delete your listing.",
  keywords: [
    "remove from zoominfo",
    "zoominfo opt out",
    "zoominfo removal",
    "delete zoominfo listing",
    "zoominfo privacy",
    "remove zoominfo profile",
    "how to remove yourself from zoominfo",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/zoominfo",
  },
  openGraph: {
    title: "How to Remove Yourself from ZoomInfo (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from ZoomInfo.",
    url: "https://ghostmydata.com/remove-from/zoominfo",
    type: "article",
  },
};

const zoomInfoInfo: BrokerInfo = {
  name: "ZoomInfo",
  slug: "zoominfo",
  description:
    "ZoomInfo is a B2B data platform that collects professional and business contact information, widely used for sales prospecting and recruiting.",
  dataCollected: [
    "Full name",
    "Work email",
    "Direct phone number",
    "Job title",
    "Company name",
    "Professional history",
    "LinkedIn profile",
    "Business address",
  ],
  risks: [
    "Unwanted sales calls",
    "Professional privacy invasion",
    "Recruiter spam",
    "Data sold to third parties",
    "Corporate espionage",
  ],
  optOutUrl: "https://www.zoominfo.com/about-zoominfo/privacy/manage-profile",
  optOutTime: "PT336H",
  difficulty: "Hard",
  steps: [
    {
      name: "Search for Your Profile",
      text: "Go to zoominfo.com and search for your name or company. Find your professional profile in the results.",
      url: "https://www.zoominfo.com",
    },
    {
      name: "Visit the Privacy Management Page",
      text: "Navigate to ZoomInfo\u0027s privacy management page to begin the opt-out process.",
      url: "https://www.zoominfo.com/about-zoominfo/privacy/manage-profile",
    },
    {
      name: "Submit an Opt-Out Request",
      text: "Fill out the opt-out form with your personal details. You will need to provide your name, email, company, and job title to identify your record.",
    },
    {
      name: "Email Privacy Team",
      text: "For faster processing, send a removal request email to privacy@zoominfo.com. Include your full name, company, job title, and a clear request to delete your profile.",
    },
    {
      name: "Respond to Verification",
      text: "ZoomInfo may send a verification email to confirm your identity. Respond promptly to avoid delays in processing your removal.",
    },
    {
      name: "Confirm Removal",
      text: "Wait up to 14 days (336 hours) for full processing. Search for yourself again on ZoomInfo to confirm your profile has been removed.",
    },
  ],
  faqs: [
    {
      question: "How long does ZoomInfo removal take?",
      answer: "ZoomInfo removal can take up to 14 days (336 hours). The process is slower than most data brokers because they verify your identity before removing records.",
    },
    {
      question: "Why is ZoomInfo removal marked as Hard?",
      answer: "ZoomInfo requires identity verification and may require you to email their privacy team directly. The process involves multiple steps and a longer wait time than most brokers.",
    },
    {
      question: "Can my data reappear on ZoomInfo?",
      answer: "Yes. ZoomInfo continuously collects professional data from public sources, business directories, and partnerships. Your profile may be recreated if new data is found.",
    },
    {
      question: "Does ZoomInfo sell my data?",
      answer: "Yes. ZoomInfo\u0027s business model is built on selling contact data to sales teams, recruiters, and marketers. Removing your profile stops further distribution of your information.",
    },
    {
      question: "Can GhostMyData remove me from ZoomInfo?",
      answer: "Yes. GhostMyData handles ZoomInfo\u0027s complex removal process automatically, along with 2,100+ other data brokers, and monitors for re-listings.",
    },
    {
      question: "What if ZoomInfo doesn\u0027t respond to my request?",
      answer: "If you don\u0027t hear back within 14 days, send a follow-up email to privacy@zoominfo.com referencing your original request. You may also file a complaint under CCPA or GDPR depending on your location.",
    },
  ],
  relatedBrokers: [
    { name: "Pipl", slug: "pipl" },
    { name: "Intelius", slug: "intelius" },
    { name: "Radaris", slug: "radaris" },
    { name: "USSearch", slug: "ussearch" },
  ],
  lastUpdated: "February 15, 2026",
};

export default function ZoomInfoRemovalPage() {
  return <BrokerRemovalTemplate broker={zoomInfoInfo} />;
}
