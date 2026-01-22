import { getAllPosts } from "@/lib/blog/posts";

export async function GET() {
  const posts = getAllPosts();
  const baseUrl = "https://ghostmydata.com";
  const currentDate = new Date().toISOString();

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>GhostMyData Blog - Privacy Protection &amp; Data Removal</title>
    <description>Expert guides on removing your personal data from data brokers, protecting your privacy online, and staying safe from identity theft.</description>
    <link>${baseUrl}/blog</link>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>GhostMyData Blog</title>
      <link>${baseUrl}/blog</link>
    </image>
    <copyright>Copyright ${new Date().getFullYear()} GhostMyData. All rights reserved.</copyright>
    <managingEditor>support@ghostmydata.com (GhostMyData Team)</managingEditor>
    <webMaster>support@ghostmydata.com (GhostMyData Team)</webMaster>
    <category>Privacy</category>
    <category>Data Protection</category>
    <category>Cybersecurity</category>
    <ttl>60</ttl>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <author>support@ghostmydata.com (${post.author})</author>
      <category>${post.category}</category>
      ${post.tags.map((tag) => `<category>${tag}</category>`).join("\n      ")}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
