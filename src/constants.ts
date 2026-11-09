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

export const staffRoles = [
  "company",
  "nightWatch",
  "infoDesk",
  "photographer",
  "electricity",
  "logistics",
  "amenities",
  "kitchen",
  "entrance",
] as const;

export type StaffRole = (typeof staffRoles)[number];

export type StaffQuizQuestion = {
  id: string;
  yes: readonly StaffRole[];
  no: readonly StaffRole[];
};

// Yes/no → role mapping, verbatim from the design spec (Banquet removed).
export const staffQuiz: readonly StaffQuizQuestion[] = [
  {
    id: "team",
    yes: ["logistics", "amenities"],
    no: [
      "nightWatch",
      "infoDesk",
      "company",
      "electricity",
      "photographer",
      "kitchen",
    ],
  },
  {
    id: "companyContact",
    yes: ["company", "amenities", "infoDesk", "logistics", "entrance"],
    no: ["nightWatch", "electricity"],
  },
  {
    id: "service",
    yes: ["entrance", "company", "infoDesk", "amenities"],
    no: ["nightWatch", "logistics", "electricity"],
  },
  {
    id: "varied",
    yes: ["amenities", "logistics"],
    no: ["infoDesk", "company", "nightWatch"],
  },
  {
    id: "physical",
    yes: ["logistics", "electricity", "kitchen"],
    no: ["infoDesk", "photographer", "company"],
  },
  {
    id: "tech",
    yes: ["electricity", "logistics", "photographer"],
    no: ["kitchen", "company", "infoDesk", "amenities"],
  },
  {
    id: "creative",
    yes: ["photographer", "kitchen"],
    no: ["logistics", "electricity", "nightWatch"],
  },
  {
    id: "social",
    yes: ["infoDesk", "company", "amenities", "entrance"],
    no: ["nightWatch", "electricity", "kitchen"],
  },
];

/** Top `count` roles by points; each answer scores every role in its list.
 * Ties keep `staffRoles` order. Unanswered questions score nothing. */
export function matchStaffRoles(
  answers: Record<string, boolean>,
  count = 3,
): StaffRole[] {
  const scores = new Map<StaffRole, number>(staffRoles.map((r) => [r, 0]));
  for (const question of staffQuiz) {
    const answer = answers[question.id];
    if (answer === undefined) continue;
    for (const role of answer ? question.yes : question.no) {
      scores.set(role, (scores.get(role) ?? 0) + 1);
    }
  }
  return [...staffRoles]
    .sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0))
    .slice(0, count);
}
