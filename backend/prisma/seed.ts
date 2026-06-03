/// <reference types="node" />

import { prisma } from "../src/config/db.ts";
import bcrypt from "bcrypt";

// super_admin  create function call 

export const seedSuperAdmin = async () => {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: "admin@hrms.com",
    },
  });

  if (existingAdmin) {
    console.log("Super Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@hrms.com",
      password: hashedPassword,
      isActive: true,
    },
  });

  console.log("Super Admin created successfully");
};

async function main() {
  await seedSuperAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

