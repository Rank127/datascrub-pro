export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GhostMyData",
    url: "https://ghostmydata.com",
    logo: "https://ghostmydata.com/logo.png",
    description:
      "GhostMyData helps you find and remove your personal data from data brokers, breach databases, and the dark web.",
    foundingDate: "2024",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@ghostmydata.com",
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "legal@ghostmydata.com",
        availableLanguage: ["English"],
      },
    ],
    sameAs: [
      "https://twitter.com/ghostmydata",
      "https://linkedin.com/company/ghostmydata",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GhostMyData",
    url: "https://ghostmydata.com",
    description:
      "Remove your personal data from the internet. Find and delete your information from data brokers, breach databases, and the dark web.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://ghostmydata.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GhostMyData",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    description:
      "Personal data removal service that finds and removes your information from data brokers, breach databases, and the dark web.",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "49.99",
      priceCurrency: "USD",
      offerCount: "3",
    },
    featureList: [
      "Data broker removal",
      "Breach monitoring",
      "Dark web monitoring",
      "Automated opt-out requests",
      "CCPA/GDPR compliance",
      "Privacy dashboard",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Data Removal Service",
    provider: {
      "@type": "Organization",
      name: "GhostMyData",
      url: "https://ghostmydata.com",
    },
    name: "Personal Data Removal Service",
    description:
      "Comprehensive personal data removal service that scans data brokers, breach databases, and the dark web to find and remove your personal information.",
    areaServed: {
      "@type": "Country",
      name: "Worldwide",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Data Removal Plans",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Free Plan",
            description: "Basic scan and manual removal guides",
          },
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Pro Plan",
            description: "Automated removals, weekly monitoring, priority support",
          },
          price: "19.99",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "119.88",
            priceCurrency: "USD",
            billingDuration: "P1Y",
            description: "50% OFF annual price",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Enterprise Plan",
            description: "Dark web monitoring, family plan, continuous monitoring, custom removal requests",
          },
          price: "49.99",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "269.95",
            priceCurrency: "USD",
            billingDuration: "P1Y",
            description: "55% OFF annual price",
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PricingSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "GhostMyData Data Removal Service",
    description:
      "Personal data removal service that automatically finds and removes your information from data brokers, breach databases, and the dark web.",
    brand: {
      "@type": "Brand",
      name: "GhostMyData",
    },
    image: "https://ghostmydata.com/logo.png",
    url: "https://ghostmydata.com/pricing",
    category: "Privacy Software",
    audience: {
      "@type": "Audience",
      audienceType: "Individuals and Families",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Free Plan",
        description: "Basic data discovery with 1 email and 1 phone scan per month",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://ghostmydata.com/register",
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        itemCondition: "https://schema.org/NewCondition",
      },
      {
        "@type": "Offer",
        name: "Pro Plan",
        description: "Full protection with unlimited scans, automated removal requests, and weekly monitoring. 50% OFF annual plan.",
        price: "19.99",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://ghostmydata.com/register",
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        itemCondition: "https://schema.org/NewCondition",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "119.88",
          priceCurrency: "USD",
          billingDuration: "P1Y",
          unitText: "year",
          description: "50% OFF annual price ($9.99/mo effective)",
        },
      },
      {
        "@type": "Offer",
        name: "Enterprise Plan",
        description: "Complete protection with dark web monitoring, family plan for 5 profiles, and daily monitoring. 55% OFF annual plan.",
        price: "49.99",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://ghostmydata.com/register",
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        itemCondition: "https://schema.org/NewCondition",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "269.95",
          priceCurrency: "USD",
          billingDuration: "P1Y",
          unitText: "year",
          description: "55% OFF annual price ($22.50/mo effective)",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export function HowToSchema({
  name,
  description,
  totalTime,
  steps,
}: {
  name: string;
  description: string;
  totalTime: string;
  steps: HowToStep[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      url: step.url,
      image: step.image,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
}

export function ReviewSchema({ reviews }: { reviews: Review[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "GhostMyData",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
      reviewCount: reviews.length,
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      datePublished: review.date,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating.toString(),
        bestRating: "5",
      },
      reviewBody: review.text,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BlogPostingSchema({ post }: { post: { title: string; description: string; slug: string; publishedAt: string; updatedAt?: string; author: string; tags: string[]; content: string; } }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "GhostMyData",
      url: "https://ghostmydata.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://ghostmydata.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    wordCount: post.content.split(/\s+/).length,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "GhostMyData",
    image: "https://ghostmydata.com/logo.png",
    url: "https://ghostmydata.com",
    telephone: "",
    email: "support@ghostmydata.com",
    description:
      "Professional data removal service helping individuals protect their privacy by removing personal information from data brokers and the internet.",
    priceRange: "$0 - $269.95/year",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
