import "dotenv/config";
import { db, seedDeltaForce } from "./index";
import { deltaForceTable } from "./db/schema";

async function main() {
  await db.delete(deltaForceTable);
  console.log("Cleared delta force members.");

  await seedDeltaForce();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
