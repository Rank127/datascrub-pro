import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog/posts";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Remove .png extension if present
  const cleanSlug = slug.replace(/\.png$/, "");

  // Try to get blog post data
  const post = getPostBySlug(cleanSlug);

  const title = post?.title || "GhostMyData - Personal Data Removal Service";
  const description = post?.description || "Remove your personal data from the internet automatically";
  const category = post?.category || "Privacy Protection";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          padding: "60px",
        }}
      >
        {/* Top section with logo and category */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Ghost icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60px",
                height: "60px",
                backgroundColor: "#10b981",
                borderRadius: "12px",
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 10h.01" />
                <path d="M15 10h.01" />
                <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
              </svg>
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              GhostMyData
            </span>
          </div>
          {post && (
            <span
              style={{
                fontSize: "20px",
                color: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                padding: "8px 20px",
                borderRadius: "999px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              {category}
            </span>
          )}
        </div>

        {/* Title section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            paddingTop: "40px",
            paddingBottom: "40px",
          }}
        >
          <h1
            style={{
              fontSize: post ? "56px" : "72px",
              fontWeight: "bold",
              color: "#ffffff",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "1000px",
            }}
          >
            {title}
          </h1>
          {post && (
            <p
              style={{
                fontSize: "26px",
                color: "#94a3b8",
                marginTop: "24px",
                lineHeight: 1.5,
                maxWidth: "900px",
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Bottom section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              color: "#64748b",
            }}
          >
            ghostmydata.com
          </span>
          {post && (
            <span
              style={{
                fontSize: "20px",
                color: "#64748b",
              }}
            >
              {post.readTime}
            </span>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
