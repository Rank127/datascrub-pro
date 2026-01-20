import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encryptArray, encryptObject, hashSSN, encrypt } from "@/lib/encryption/crypto";
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
  emails: z.array(z.string().email()).optional(),
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

    // Return profile without decrypting sensitive fields
    // (decryption happens client-side or when needed for scanning)
    return NextResponse.json({
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        hasAliases: !!profile.aliases,
        hasEmails: !!profile.emails,
        hasPhones: !!profile.phones,
        hasAddresses: !!profile.addresses,
        hasDateOfBirth: !!profile.dateOfBirth,
        hasSSN: !!profile.ssnHash,
        hasUsernames: !!profile.usernames,
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

    // Encrypt sensitive data
    const encryptedData = {
      fullName: data.fullName || null,
      aliases: data.aliases?.length ? encryptArray(data.aliases) : null,
      emails: data.emails?.length ? encryptArray(data.emails) : null,
      phones: data.phones?.length ? encryptArray(data.phones) : null,
      addresses: data.addresses?.length ? encryptObject(data.addresses) : null,
      dateOfBirth: data.dateOfBirth ? encrypt(data.dateOfBirth) : null,
      ssnHash: data.ssn ? hashSSN(data.ssn) : null,
      usernames: data.usernames?.length ? encryptArray(data.usernames) : null,
    };

    // Upsert profile
    const profile = await prisma.personalProfile.upsert({
      where: {
        id: (
          await prisma.personalProfile.findFirst({
            where: { userId: session.user.id },
            select: { id: true },
          })
        )?.id || "",
      },
      create: {
        userId: session.user.id,
        ...encryptedData,
      },
      update: encryptedData,
    });

    return NextResponse.json({
      message: "Profile saved successfully",
      profileId: profile.id,
    });
  } catch (error) {
    console.error("Profile save error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
