export interface BlacklistedTokenFamily {
  familyId: string;
  // Useful for a CRON cleanup?
  blacklistedAt: number;
}

export interface UsedToken {
  token: string;
  familyId: string;
  // Useful for a CRON cleanup?
  usedAt: number;
}