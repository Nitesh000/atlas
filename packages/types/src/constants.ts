export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PLANS = {
  FREE: "free",
  PRO: "pro",
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];

export const LIMITS = {
  FREE_API_CALLS: 1000,
  FREE_WEBSITES: 100,
  FREE_API_KEYS: 3,
} as const;