// Family Plan Types
// Enterprise feature: 5 users per family group

export const FamilyRole = {
  OWNER: "OWNER",
  MEMBER: "MEMBER",
} as const;
export type FamilyRole = (typeof FamilyRole)[keyof typeof FamilyRole];

export const InvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;
export type InvitationStatus =
  (typeof InvitationStatus)[keyof typeof InvitationStatus];

// Member info for display (owner can see stats)
export interface FamilyMemberInfo {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  role: FamilyRole;
  joinedAt: Date;
  // Stats for owner view
  exposuresCount?: number;
  lastScanAt?: Date | null;
}

// Pending invitation info
export interface FamilyInvitationInfo {
  id: string;
  email: string;
  status: InvitationStatus;
  createdAt: Date;
  expiresAt: Date;
}

// Full family group info
export interface FamilyGroupInfo {
  id: string;
  name: string | null;
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string;
  maxMembers: number;
  memberCount: number;
  members: FamilyMemberInfo[];
  pendingInvitations: FamilyInvitationInfo[];
}

// For family member view (non-owner)
export interface FamilyMembershipInfo {
  familyGroupId: string;
  familyName: string | null;
  ownerName: string | null;
  ownerEmail: string;
  role: FamilyRole;
  joinedAt: Date;
  memberCount: number;
}

// Invitation details (for accept page)
export interface InvitationDetails {
  id: string;
  email: string;
  status: InvitationStatus;
  expiresAt: Date;
  isExpired: boolean;
  familyOwnerName: string | null;
  familyOwnerEmail: string;
  familyName: string | null;
}
