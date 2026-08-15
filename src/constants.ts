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
