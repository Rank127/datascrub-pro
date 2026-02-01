import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encryptArray, encryptObject, hashSSN, encrypt, safeDecrypt, decryptArray, decryptObject } from "@/lib/encryption/crypto";
import { z } from "zod";

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  isCurrent: z.boolean().optional(),
});

const profileSchema = z.object({
  fullName: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  emails: z.array(z.string()).optional(), // Removed .email() - accept any string
  phones: z.array(z.string()).optional(),
  addresses: z.array(addressSchema).optional(),
  dateOfBirth: z.string().optional(),
  ssn: z.string().optional(),
  usernames: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    console.log("[Profile GET] Session:", session?.user?.id ? `User ${session.user.id}` : "No session");

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.personalProfile.findFirst({
      where: { userId: session.user.id },
    });
    console.log("[Profile GET] Found profile:", profile?.id || "NONE");

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    // Decrypt and return profile data
    return NextResponse.json({
      profile: {
        id: profile.id,
        fullName: profile.fullName || "",
        aliases: profile.aliases ? decryptArray(profile.aliases) : [],
        emails: profile.emails ? decryptArray(profile.emails) : [],
        phones: profile.phones ? decryptArray(profile.phones) : [],
        addresses: profile.addresses ? decryptObject(profile.addresses) : [],
        dateOfBirth: safeDecrypt(profile.dateOfBirth),
        hasSSN: !!profile.ssnHash, // SSN is hashed, can't be decrypted - just indicate if it exists
        usernames: profile.usernames ? decryptArray(profile.usernames) : [],
        updatedAt: profile.updatedAt,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    console.log("[Profile POST] Session:", session?.user?.id ? `User ${session.user.id}` : "No session");

    if (!session?.user?.id) {
      console.log("[Profile POST] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("[Profile POST] Body received:", JSON.stringify(body).substring(0, 200));
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      console.log("[Profile POST] Validation failed:", result.error.issues[0].message);
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;
    console.log("[Profile POST] Validated data - emails:", data.emails?.length, "phones:", data.phones?.length);

    // Check if profile exists
    const existingProfile = await prisma.personalProfile.findFirst({
      where: { userId: session.user.id },
      select: { id: true, ssnHash: true },
    });
    console.log("[Profile POST] Existing profile:", existingProfile?.id || "NONE");

    // Encrypt sensitive data
    const encryptedData = {
      fullName: data.fullName || null,
      aliases: data.aliases?.length ? encryptArray(data.aliases) : null,
      emails: data.emails?.length ? encryptArray(data.emails) : null,
      phones: data.phones?.length ? encryptArray(data.phones) : null,
      addresses: data.addresses?.length ? encryptObject(data.addresses) : null,
      dateOfBirth: data.dateOfBirth ? encrypt(data.dateOfBirth) : null,
      // Only update SSN if a new one is provided, otherwise preserve existing
      ssnHash: data.ssn ? hashSSN(data.ssn) : (existingProfile?.ssnHash || null),
      usernames: data.usernames?.length ? encryptArray(data.usernames) : null,
    };

    let profile;

    if (existingProfile) {
      // Update existing profile
      console.log("[Profile POST] Updating existing profile...");
      profile = await prisma.personalProfile.update({
        where: { id: existingProfile.id },
        data: encryptedData,
      });
      console.log("[Profile POST] Updated profile:", profile.id);
    } else {
      // Create new profile
      console.log("[Profile POST] Creating new profile...");
      profile = await prisma.personalProfile.create({
        data: {
          userId: session.user.id,
          ...encryptedData,
        },
      });
      console.log("[Profile POST] Created profile:", profile.id);
    }

    return NextResponse.json({
      message: "Profile saved successfully",
      profileId: profile.id,
    });
  } catch (error) {
    console.error("[Profile POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
