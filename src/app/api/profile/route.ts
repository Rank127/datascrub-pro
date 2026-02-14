import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encryptArray, encryptObject, hashSSN, encrypt, safeDecrypt, decryptArray, decryptObject } from "@/lib/encryption/crypto";
import { captureError } from "@/lib/error-reporting";
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.personalProfile.findFirst({
      where: { userId: session.user.id },
    });

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
    captureError("[Profile GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if profile exists
    const existingProfile = await prisma.personalProfile.findFirst({
      where: { userId: session.user.id },
      select: { id: true, ssnHash: true },
    });

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
      profile = await prisma.personalProfile.update({
        where: { id: existingProfile.id },
        data: encryptedData,
      });
    } else {
      profile = await prisma.personalProfile.create({
        data: {
          userId: session.user.id,
          ...encryptedData,
        },
      });
    }

    return NextResponse.json({
      message: "Profile saved successfully",
      profileId: profile.id,
    });
  } catch (error) {
    captureError("[Profile POST]", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
