import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { deltaForceTable } from "@/db/schema";
import { env } from "@/envvars";

const client = createClient({ url: env.DB_FILE_NAME! });
export const db = drizzle({ client });

export async function seedDeltaForce() {
  const deltaForce: (typeof deltaForceTable.$inferInsert)[] = [
    {
      studentId: "ha3602bo-s",
      firstName: "Hannes",
      lastName: "Bolmehag",
      role: "it",
      sortOrder: 3,
      email: "hannes@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/hannesbolmehag/",
    },
    {
      studentId: "ch3285ga-s",
      firstName: "Christofer",
      lastName: "Gartner",
      role: "it",
      sortOrder: 1,
      email: "christofer@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/christofer-gartner/",
    },
    {
      studentId: "ru4786ko-s",
      firstName: "Rufus",
      lastName: "Kogg Röjder",
      role: "it",
      sortOrder: 2,
      email: "rufus@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/rufus-kogg-rojder/",
    },
    {
      studentId: "ti1186jo-s",
      firstName: "Tim",
      lastName: "Johansson",
      role: "general",
      sortOrder: 2,
      email: "tim@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/tim-johansson-699474429/",
    },
    {
      studentId: "me5081wi-s",
      firstName: "Melker",
      lastName: "Widén",
      role: "general",
      sortOrder: 1,
      email: "melker@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/memagu/",
    },
    {
      studentId: "ab5671ni-s",
      firstName: "Abbe",
      lastName: "Nilsson",
      role: "staff",
      email: "abbe@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/abbe-nilsson-823a823b4/",
    },
    {
      studentId: "al8821pe-s",
      firstName: "Alfred",
      lastName: "Pettersson",
      role: "relations",
      sortOrder: 2,
      email: "alfred@delta.dsek.se",
      linkedin: "#",
    },
    {
      studentId: "er0811ni-s",
      firstName: "Erik",
      lastName: "Nicander",
      role: "relations",
      sortOrder: 1,
      email: "erik@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/erik-nicander-051516154/",
    },
    {
      studentId: "er7677we-s",
      firstName: "Erling",
      lastName: "Wesser",
      role: "logistics",
      sortOrder: 2,
      email: "erling@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/erling-wesser/",
    },
    {
      studentId: "li6371an-s",
      firstName: "Lilly",
      lastName: "Andersson",
      role: "finance",
      email: "lilly@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/lilly-andersson-96a489349/",
    },
    {
      studentId: "ma6884wa-s",
      firstName: "Maximilian",
      lastName: "Waldenfeldt Uggla",
      role: "marketing",
      email: "maximilian@delta.dsek.se",
      linkedin:
        "https://www.linkedin.com/in/maximilian-waldenfeldt-uggla-15b938290/",
    },
    {
      studentId: "th6028ha-s",
      firstName: "Thea",
      lastName: "Hartzell",
      role: "logistics",
      sortOrder: 1,
      email: "thea@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/thea-hartzell-041829347/",
    },
    {
      studentId: "vi3803ro-s",
      firstName: "Vidar",
      lastName: "Ljungberg",
      role: "event",
      email: "vidar@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/vidar-ljungberg-b62650245/",
    },
    {
      studentId: "ma2456ot-s",
      firstName: "Maja",
      lastName: "Ottosson",
      role: "relations",
      sortOrder: 3,
      email: "maja@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/maja-ottosson-907205289/",
    },
    {
      studentId: "lo8561no-s",
      firstName: "Loe",
      lastName: "Norrby",
      role: "relations",
      sortOrder: 5,
      email: "loe@delta.dsek.se",
      linkedin: "#",
    },
    {
      studentId: "jo6554we-s",
      firstName: "John",
      lastName: "Wennerholm",
      role: "relations",
      sortOrder: 4,
      email: "john@delta.dsek.se",
      linkedin: "https://www.linkedin.com/in/john-wennerholm-3aa2a13a5/",
    },
  ];

  const existing = await db
    .select({ studentId: deltaForceTable.studentId })
    .from(deltaForceTable);

  const existingIds = new Set(existing.map((row) => row.studentId));
  const missing = deltaForce.filter(
    (member) => !existingIds.has(member.studentId),
  );

  if (missing.length === 0) {
    console.log("Seed already applied.");
    return;
  }

  await db.insert(deltaForceTable).values(missing);
  console.log(`Seeded ${missing.length} delta force members.`);
}

if (import.meta.main) {
  seedDeltaForce().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
