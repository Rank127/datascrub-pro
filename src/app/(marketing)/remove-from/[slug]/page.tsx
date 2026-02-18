import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrokerRemovalTemplate } from "@/components/broker-removal-template";
import {
  getRemovableBrokerSlugs,
  getBrokerPageData,
  EXISTING_MANUAL_PAGES,
} from "@/lib/broker-pages/broker-page-data";

export async function generateStaticParams() {
  return getRemovableBrokerSlugs()
    .filter(slug => !EXISTING_MANUAL_PAGES.has(slug))
    .map(slug => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const broker = getBrokerPageData(slug);
  if (!broker) return {};

  const title = `Remove Yourself from ${broker.name} (2026 Guide) | GhostMyData`;
  const description = `Step-by-step guide to remove your personal information from ${broker.name}. ${broker.difficulty} difficulty, takes ${broker.optOutTime.replace(/^PT(\d+)H$/, (_, h) => {
    const days = Math.round(parseInt(h) / 24);
    return days <= 1 ? "24 hours" : `${days} days`;
  })}. Protect your privacy today.`;

  return {
    title,
    description,
    keywords: [
      `remove from ${broker.name.toLowerCase()}`,
      `${broker.name.toLowerCase()} opt out`,
      `${broker.name.toLowerCase()} removal`,
      `${broker.name.toLowerCase()} delete my data`,
      `how to remove yourself from ${broker.name.toLowerCase()}`,
      "data broker removal",
      "privacy protection",
      "opt out guide",
    ],
    alternates: {
      canonical: `https://ghostmydata.com/remove-from/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://ghostmydata.com/remove-from/${slug}`,
      type: "article",
      images: [
        {
          url: "https://ghostmydata.com/og-image.png",
          width: 1200,
          height: 630,
          alt: `Remove from ${broker.name}`,
        },
      ],
    },
  };
}

export default async function BrokerRemovalPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const broker = getBrokerPageData(slug);

  if (!broker) {
    notFound();
  }

  return <BrokerRemovalTemplate broker={broker} />;
}
