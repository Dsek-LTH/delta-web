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

export function deltaForceRoleDescriptionKey(
  role: (typeof deltaForceRoles)[number],
): `delta-force.${(typeof deltaForceRoles)[number]}.description` {
  return `delta-force.${role}.description`;
}

// Display order for delta force members: lower sortOrder first, unset last.
export const bySortOrder = <T extends { sortOrder: number | null }>(
  a: T,
  b: T,
): number =>
  (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
  (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
