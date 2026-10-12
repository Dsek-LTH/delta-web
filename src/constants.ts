export const fairDate: Date = new Date("feb 9, 2027 8:00:00");

export const deltaForceRoles = [
  "general",
  "it",
  "event",
  "finance",
  "logistics",
  "marketing",
  "relations",
  "staff",
] as const;

export function deltaFordeRoleToTranslationKey(
  role: (typeof deltaForceRoles)[number],
  plural: boolean,
): string {
  return `delta-force.${role}${plural ? "s" : ""}`;
}

export const deltaForcePhotoGroups = ["all", ...deltaForceRoles] as const;

export function deltaForceRoleDescriptionKey(
  role: (typeof deltaForceRoles)[number],
): `delta-force.${(typeof deltaForceRoles)[number]}.description` {
  return `delta-force.${role}.description`;
}

// Group contact address shown under each team title on the project group page.
export const deltaForceRoleEmails: Record<
  (typeof deltaForceRoles)[number],
  string
> = {
  general: "general@delta.dsek.se",
  it: "it@delta.dsek.se",
  event: "events@delta.dsek.se",
  finance: "finance@delta.dsek.se",
  logistics: "logistics@delta.dsek.se",
  marketing: "marketing@delta.dsek.se",
  relations: "relations@delta.dsek.se",
  staff: "staff@delta.dsek.se",
};

// Display order for delta force members: lower sortOrder first, unset last.
export const bySortOrder = <T extends { sortOrder: number | null }>(
  a: T,
  b: T,
): number =>
  (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
  (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
