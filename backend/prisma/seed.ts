import { prisma } from "../src/config/db.ts";
import { seedModules } from "./seeds/modules.seed.ts";
import { seedSuperAdminRole } from "./seeds/roles.seed.ts";
import { seedSuperAdmin } from "./seeds/admin.seed.ts";

async function main() {
  console.log(" Seeding started...\n");

  await seedModules();        //  Pehle modules
  await seedSuperAdminRole(); //  Phir role + permissions
  await seedSuperAdmin();     //  Aakhir mein user

  console.log("\n All seeding done!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });