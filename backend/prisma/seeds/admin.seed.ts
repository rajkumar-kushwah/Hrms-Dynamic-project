/// 
// <reference types="node" />

import { prisma } from "../../src/config/db.ts";
import bcrypt from "bcrypt";

// super_admin  create function call 


export const seedSuperAdmin = async () => {

    // pahle role lo
    const superAdminRole = await prisma.role.findFirst({
        where: {
            name: "super_admin"
        },
    });

    if (!superAdminRole) {
        console.log("Super Admin role not found");
        return;
    }


    const existingAdmin = await prisma.user.findUnique({
        where: {
            email: "admin@hrms.com",
        },
    });

    if (existingAdmin) {
        await prisma.user.update({
            where: { email: "admin@hrms.com" },
            data: { roleId: superAdminRole.id },
        })
        console.log("Super Admin role updated!");
        return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await prisma.user.create({
        data: {
            name: "Super Admin",
            email: "admin@hrms.com",
            password: hashedPassword,
            isActive: true,
            roleId: superAdminRole.id,     //Role assign
            companyId: null,
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

