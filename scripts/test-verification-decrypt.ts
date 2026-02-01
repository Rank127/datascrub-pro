import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { decrypt, safeDecrypt } from "../src/lib/encryption/crypto";

const prisma = new PrismaClient();

async function testDecryption() {
  console.log("\n" + "═".repeat(60));
  console.log("           TESTING DECRYPTION FOR VERIFICATION");
  console.log("═".repeat(60));

  // Get a few personal profiles to test
  const profiles = await prisma.personalProfile.findMany({
    take: 5,
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  console.log(`\nFound ${profiles.length} profiles to test\n`);

  for (const profile of profiles) {
    console.log(`Testing profile for: ${profile.user.email}`);

    // Test dateOfBirth field specifically (the field that was failing)
    if (profile.dateOfBirth) {
      console.log(`  dateOfBirth (raw): ${profile.dateOfBirth.substring(0, 50)}...`);

      // Try unsafe decrypt
      try {
        const unsafeResult = decrypt(profile.dateOfBirth);
        console.log(`  decrypt(): SUCCESS -> "${unsafeResult}"`);
      } catch (error) {
        console.log(`  decrypt(): FAILED -> ${error instanceof Error ? error.message : "Unknown error"}`);
      }

      // Try safe decrypt
      const safeResult = safeDecrypt(profile.dateOfBirth);
      console.log(`  safeDecrypt(): "${safeResult}"`);
    } else {
      console.log(`  dateOfBirth: (not set)`);
    }

    // Test other encrypted fields
    if (profile.aliases) {
      try {
        const decrypted = decrypt(profile.aliases);
        const parsed = JSON.parse(decrypted);
        console.log(`  aliases: ${parsed.length} items`);
      } catch {
        console.log(`  aliases: FAILED to decrypt`);
      }
    }

    if (profile.emails) {
      try {
        const decrypted = decrypt(profile.emails);
        const parsed = JSON.parse(decrypted);
        console.log(`  emails: ${parsed.length} items`);
      } catch {
        console.log(`  emails: FAILED to decrypt`);
      }
    }

    console.log("");
  }

  // Now test the verification service's prepareScanInputForUser indirectly
  console.log("\n" + "═".repeat(60));
  console.log("           TESTING VERIFICATION SERVICE");
  console.log("═".repeat(60));

  // Get a removal request that's due for verification
  const removalWithUser = await prisma.removalRequest.findFirst({
    where: {
      status: { in: ["SUBMITTED", "IN_PROGRESS"] },
    },
    include: {
      user: {
        select: { id: true, email: true },
      },
      exposure: {
        select: { source: true, sourceName: true },
      },
    },
  });

  if (removalWithUser) {
    console.log(`\nTesting verification for: ${removalWithUser.user.email}`);
    console.log(`  Exposure: ${removalWithUser.exposure.sourceName}`);

    const profile = await prisma.personalProfile.findFirst({
      where: { userId: removalWithUser.user.id },
    });

    if (profile) {
      console.log(`  Has profile: YES`);

      // Simulate what prepareScanInputForUser does
      const safeDecryptValue = (encrypted: string | null): string | undefined => {
        if (!encrypted) return undefined;
        try {
          return decrypt(encrypted);
        } catch {
          return encrypted;
        }
      };

      const safeDecryptAndParse = <T>(encrypted: string | null): T | undefined => {
        if (!encrypted) return undefined;
        try {
          const decrypted = decrypt(encrypted);
          return JSON.parse(decrypted) as T;
        } catch {
          try {
            return JSON.parse(encrypted) as T;
          } catch {
            return undefined;
          }
        }
      };

      const scanInput = {
        fullName: profile.fullName || undefined,
        aliases: safeDecryptAndParse<string[]>(profile.aliases),
        emails: safeDecryptAndParse<string[]>(profile.emails),
        phones: safeDecryptAndParse<string[]>(profile.phones),
        dateOfBirth: safeDecryptValue(profile.dateOfBirth),
        usernames: safeDecryptAndParse<string[]>(profile.usernames),
      };

      console.log(`\n  Prepared scan input:`);
      console.log(`    fullName: ${scanInput.fullName || "(not set)"}`);
      console.log(`    aliases: ${scanInput.aliases?.length || 0} items`);
      console.log(`    emails: ${scanInput.emails?.length || 0} items`);
      console.log(`    phones: ${scanInput.phones?.length || 0} items`);
      console.log(`    dateOfBirth: ${scanInput.dateOfBirth || "(not set)"}`);
      console.log(`    usernames: ${scanInput.usernames?.length || 0} items`);

      console.log(`\n  ✅ Scan input prepared successfully!`);
    } else {
      console.log(`  Has profile: NO`);
    }
  }

  await prisma.$disconnect();
  console.log("\n✅ All tests completed successfully!\n");
}

testDecryption().catch(console.error);
