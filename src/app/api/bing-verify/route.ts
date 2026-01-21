import { NextResponse } from "next/server";

export async function GET() {
  const xml = `<?xml version="1.0"?>
<users>
	<user>EB8B76BA0A76EF68700EDBCC7434AA48</user>
</users>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
