import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import {
  OrganizationSchema,
  WebsiteSchema,
  SoftwareApplicationSchema,
  ServiceSchema,
} from "@/components/seo/structured-data";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { MicrosoftClarity } from "@/components/analytics/microsoft-clarity";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://ghostmydata.com";
const siteName = "GhostMyData";
const siteDescription = "Find and remove your personal data from data brokers, breach databases, and the dark web. Automated privacy protection with CCPA/GDPR compliance. Take control of your digital footprint today.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10b981",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GhostMyData - Remove Your Personal Data From The Internet",
    template: "%s | GhostMyData",
  },
  description: siteDescription,
  keywords: [
    "data removal service",
    "remove personal data from internet",
    "data broker removal",
    "privacy protection",
    "personal data removal",
    "CCPA removal request",
    "GDPR data deletion",
    "breach monitoring",
    "dark web monitoring",
    "identity protection",
    "opt out service",
    "people search removal",
    "Spokeo removal",
    "WhitePages removal",
    "BeenVerified removal",
    "data privacy",
    "digital footprint removal",
    "online privacy protection",
    "personal information removal",
    "data broker opt out",
  ],
  authors: [{ name: "GhostMyData", url: siteUrl }],
  creator: "GhostMyData",
  publisher: "GhostMyData",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": [{ url: `${siteUrl}/feed.xml`, title: "GhostMyData Blog RSS Feed" }],
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: "GhostMyData - Remove Your Personal Data From The Internet",
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "GhostMyData - Personal Data Removal Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostMyData - Remove Your Personal Data From The Internet",
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
    creator: "@ghostmydata",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  category: "technology",
  classification: "Privacy & Security",
  referrer: "origin-when-cross-origin",
  verification: {
    // Google verification done via Cloudflare DNS
    other: {
      "msvalidate.01": ["EB8B76BA0A76EF68700EDBCC7434AA48"],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="msvalidate.01" content="EB8B76BA0A76EF68700EDBCC7434AA48" />
        <OrganizationSchema />
        <WebsiteSchema />
        <SoftwareApplicationSchema />
        <ServiceSchema />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white`}
      >
        <GoogleAnalytics />
        <MicrosoftClarity />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
