import { prisma } from "../../src/config/db.ts";

export const seedSuperAdminRole = async () => {
    // Super Admin Role banao
    const superAdminRole = await prisma.role.upsert({
        where: { name: "super_admin" },
        update: {},
        create: {
            name: "super_admin",
            description: "Full access to everything",
            isActive: true,
            companyId: null,
        },
    });

    console.log(" Super Admin role created!");

    // Pehle check karo permissions already hain kya
    const existingPermissions = await prisma.permission.count({
        where: { roleId: superAdminRole.id },
    });

    if (existingPermissions > 0) {
        console.log(" Super Admin permissions already exist!");
        return superAdminRole;
    }

    // Saare modules lo
    const allModules = await prisma.module.findMany();

    // Ek saath saari permissions create karo
    await prisma.permission.createMany({
        data: allModules.map((mod) => ({
            roleId: superAdminRole.id,
            moduleId: mod.id,
            canView: true,
            canCreate: true,
            canEdit: true,
            canDelete: true,
        })),
        skipDuplicates: true, //  Duplicate hone pe skip karo
    });

    console.log(" Super Admin permissions seeded!");

    return superAdminRole;
};