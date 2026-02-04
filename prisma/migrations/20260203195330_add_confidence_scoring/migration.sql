-- Add confidence scoring fields to Exposure table
-- This enables validation of scan results against user profiles
-- to prevent false positives and block auto-removals for uncertain matches

-- AlterTable
ALTER TABLE "Exposure" ADD COLUMN     "confidenceFactors" TEXT,
ADD COLUMN     "confidenceReasoning" TEXT,
ADD COLUMN     "confidenceScore" INTEGER,
ADD COLUMN     "matchClassification" TEXT,
ADD COLUMN     "userConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "validatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Exposure_userId_userConfirmed_idx" ON "Exposure"("userId", "userConfirmed");

-- CreateIndex
CREATE INDEX "Exposure_confidenceScore_idx" ON "Exposure"("confidenceScore");
