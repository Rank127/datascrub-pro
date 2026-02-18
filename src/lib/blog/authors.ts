export interface Author {
  name: string;
  slug: string;
  role: string;
  bio: string;
  expertise: string[];
  linkedIn?: string;
}

export const AUTHORS: Record<string, Author> = {
  "rocky-kathuria": {
    name: "Rocky Kathuria",
    slug: "rocky-kathuria",
    role: "Founder & CEO",
    bio: "Rocky Kathuria is the founder and CEO of GhostMyData, a data privacy platform that helps individuals remove their personal information from data brokers and the internet. With deep expertise in CCPA, GDPR, and state privacy laws, Rocky built GhostMyData to automate what was previously a tedious, manual process — submitting opt-out requests to hundreds of data brokers one by one. Under his leadership, GhostMyData has grown to scan 2,100+ data brokers using 24 AI agents, making it one of the most comprehensive data removal services available.",
    expertise: [
      "Data Privacy & CCPA/GDPR Compliance",
      "Data Broker Removal Processes",
      "AI-Powered Privacy Automation",
      "Consumer Data Rights",
      "Cybersecurity & Dark Web Monitoring",
    ],
    linkedIn: "https://linkedin.com/in/rockykathuria",
  },
};

export function getAuthorBySlug(slug: string): Author | undefined {
  return AUTHORS[slug];
}

export function getDefaultAuthor(): Author {
  return AUTHORS["rocky-kathuria"];
}
