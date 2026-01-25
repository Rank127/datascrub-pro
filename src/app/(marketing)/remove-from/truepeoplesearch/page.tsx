import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from TruePeopleSearch (2026 Guide) | GhostMyData",
  description:
    "Step-by-step guide to remove your personal information from TruePeopleSearch for free. Learn the quick opt-out process.",
  keywords: [
    "remove from truepeoplesearch",
    "truepeoplesearch opt out",
    "truepeoplesearch removal",
    "delete truepeoplesearch listing",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/truepeoplesearch",
  },
};

const truepeoplesearchInfo: BrokerInfo = {
  name: "TruePeopleSearch",
  slug: "truepeoplesearch",
  description:
    "TruePeopleSearch is a free people search engine that provides detailed personal information without requiring payment, making it particularly risky for privacy.",
  dataCollected: [
    "Full name",
    "Current and past addresses",
    "Phone numbers",
    "Email addresses",
    "Age",
    "Relatives and associates",
    "Neighbors",
    "Property records",
  ],
  risks: [
    "Completely free access means anyone can look you up",
    "Detailed profiles without payment barrier",
    "Commonly used by stalkers and harassers",
    "Address history fully visible",
    "Family member connections exposed",
  ],
  optOutUrl: "https://www.truepeoplesearch.com/removal",
  optOutTime: "PT72H",
  difficulty: "Easy",
  steps: [
    {
      name: "Find Your Profile",
      text: "Go to TruePeopleSearch.com and search for your name to find your listing.",
      url: "https://www.truepeoplesearch.com",
    },
    {
      name: "Click on Your Record",
      text: "Click 'View Details' on the record that matches your information.",
    },
    {
      name: "Scroll to Remove Option",
      text: "Scroll to the bottom of your profile page and look for the 'Remove This Record' link.",
    },
    {
      name: "Complete CAPTCHA",
      text: "Solve the CAPTCHA to verify you're human.",
    },
    {
      name: "Confirm Removal",
      text: "Click confirm to submit your removal request. No email verification required.",
    },
  ],
  faqs: [
    {
      question: "Is TruePeopleSearch removal really free?",
      answer: "Yes, TruePeopleSearch offers free removal directly on their site. No payment or account required.",
    },
    {
      question: "Why is TruePeopleSearch more dangerous than paid sites?",
      answer: "Because there's no payment barrier, anyone can access your information for free, including bad actors.",
    },
    {
      question: "How quickly does TruePeopleSearch remove records?",
      answer: "Removal typically takes 24-72 hours after submitting the request.",
    },
    {
      question: "Do I need to provide my email for TruePeopleSearch removal?",
      answer: "No, TruePeopleSearch is one of the few sites that doesn't require email verification for opt-out.",
    },
  ],
  lastUpdated: "January 24, 2026",
};

export default function TruePeopleSearchRemovalPage() {
  return <BrokerRemovalTemplate broker={truepeoplesearchInfo} />;
}
