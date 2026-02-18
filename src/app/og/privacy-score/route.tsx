import { ImageResponse } from "next/og";

export const runtime = "edge";

const levelColors: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

const levelLabels: Record<string, string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
  critical: "Critical Risk",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const rawScore = parseInt(searchParams.get("score") || "50", 10);
  const score = Math.max(0, Math.min(100, isNaN(rawScore) ? 50 : rawScore));
  const level = ["low", "medium", "high", "critical"].includes(
    searchParams.get("level") || ""
  )
    ? searchParams.get("level")!
    : "medium";

  const color = levelColors[level];
  const label = levelLabels[level];

  // Arc calculations for the score ring (270 degree arc)
  const arcAngle = (score / 100) * 270;
  const startAngle = 135; // Start from bottom-left
  const endAngle = startAngle + arcAngle;
  const cx = 600;
  const cy = 300;
  const r = 140;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  const largeArc = arcAngle > 180 ? 1 : 0;

  // Background arc (full 270 degrees)
  const bgEndAngle = startAngle + 270;
  const bgEndRad = (bgEndAngle * Math.PI) / 180;
  const bgX2 = cx + r * Math.cos(bgEndRad);
  const bgY2 = cy + r * Math.sin(bgEndRad);

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
          padding: "50px 60px",
        }}
      >
        {/* Top section with logo and badge */}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                backgroundColor: "#10b981",
                borderRadius: "12px",
              }}
            >
              <svg
                width="32"
                height="32"
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
                fontSize: "26px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              GhostMyData
            </span>
          </div>
          <span
            style={{
              fontSize: "18px",
              color: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              padding: "8px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            Privacy Score Quiz
          </span>
        </div>

        {/* Center section with score ring */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            flex: 1,
            gap: "80px",
          }}
        >
          {/* Score ring */}
          <div
            style={{
              display: "flex",
              position: "relative",
              width: "320px",
              height: "320px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="320"
              height="320"
              viewBox="360 100 480 400"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              {/* Background arc */}
              <path
                d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${bgX2} ${bgY2}`}
                fill="none"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Score arc */}
              {score > 0 && (
                <path
                  d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="16"
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "80px",
                  fontWeight: "bold",
                  color: color,
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: "20px",
                  color: "#94a3b8",
                  marginTop: "4px",
                }}
              >
                out of 100
              </span>
            </div>
          </div>

          {/* Right side text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                color: color,
                backgroundColor: `${color}18`,
                padding: "6px 18px",
                borderRadius: "999px",
                border: `1px solid ${color}40`,
                fontWeight: 600,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#ffffff",
                lineHeight: 1.3,
                maxWidth: "380px",
              }}
            >
              What&apos;s YOUR privacy score?
            </span>
            <span
              style={{
                fontSize: "20px",
                color: "#94a3b8",
                maxWidth: "380px",
              }}
            >
              Take the free 2-minute quiz to find out how exposed your data is.
            </span>
          </div>
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
              fontSize: "20px",
              color: "#64748b",
            }}
          >
            ghostmydata.com/privacy-score
          </span>
          <span
            style={{
              fontSize: "18px",
              color: "#64748b",
            }}
          >
            Free Privacy Tool
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
