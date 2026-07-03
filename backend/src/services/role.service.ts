import { prisma } from "../config/db.ts";

// Company ke sabhi roles
export const getCompanyRoles = async (companyId: string | null, isSuperAdmin: boolean) => {
    return await prisma.role.findMany({
        where: isSuperAdmin ? {} : { companyId },
        include: {
            permissions: { include: { module: true, } },
            _count: { select: { user: true } },
            company: { select: { id: true, name: true } }
        },
        orderBy: { id: "asc" },
    });
};

// Naya role banao
export const createRole = async (
    companyId: string,
    data: {
        name: string;
        description?: string;
    }
) => {
    // Same name already exist?
    const existing = await prisma.role.findFirst({
        where: {
            name: data.name,
            companyId,
        },
    });

    if (existing) throw new Error("Role already exists");

    // Role banao
    const role = await prisma.role.create({
        data: {
            name: data.name,
            description: data.description ?? null,
            isActive: true,
            companyId,
        }
    });

    // Default permissions - sab false
    const allModules = await prisma.module.findMany({
        include: { children: true },
    });

    await prisma.permission.createMany({
        data: allModules.map((mod) => ({
            roleId: role.id,
            moduleId: mod.id,
            companyId,
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false,
        })),
        skipDuplicates: true,
    });

    return role;
};

// Role ki permissions dekho
export const getRolePermissions = async (
    roleId: number,
    companyId: string | null
) => {
    const role = await prisma.role.findFirst({
        where: {
            id: roleId,
            companyId,
        },
        include: {
            permissions: {
                include: {
                    module: {
                        include: {
                            children: true, // Sub modules bhi
                        },
                    },
                },
                orderBy: {
                    moduleId: "asc",
                },
            },
        },
    });

    if (!role) throw new Error("Role not found");

    return role;
};

// Permissions update karo
export const updateRolePermissions = async (
    roleId: number,
    companyId: string | null,
    permissions: {
        moduleId: number;
        canView: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
    }[]
) => {
    // Role is company ka hai?
    const role = await prisma.role.findFirst({
        where: { id: roleId },
    });

    if (!role) throw new Error("Role not found");

    // Ager Company admin hai to apni hi company ka role edit kr sake 
    if (companyId !== null && role.companyId !== companyId) {
        throw new Error("Access denied - this role doesn't belong to your company")
    }

    const targetCompanyId = role.companyId;
    // Ensure every module has a permission record
    const allModules = await prisma.module.findMany();

    for (const mod of allModules) {
        await prisma.permission.upsert({
            where: {
                roleId_moduleId_companyId: {
                    roleId,
                    moduleId: mod.id,
                    companyId: targetCompanyId!,
                },
            },
            update: {},
            create: {
                roleId,
                moduleId: mod.id,
                companyId: targetCompanyId,
                canView: false,
                canCreate: false,
                canEdit: false,
                canDelete: false,
            },
        });
    }

    // Permission ka companyId — role ka companyId
    // Har permission update karo
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: {
                roleId_moduleId_companyId: {
                    roleId,
                    moduleId: perm.moduleId,
                    companyId: targetCompanyId!,
                },
            },
            update: {
                canView: perm.canView,
                canCreate: perm.canCreate,
                canEdit: perm.canEdit,
                canDelete: perm.canDelete,
            },
            create: {
                roleId,
                moduleId: perm.moduleId,
                companyId: targetCompanyId,
                canView: perm.canView,
                canCreate: perm.canCreate,
                canEdit: perm.canEdit,
                canDelete: perm.canDelete,
            },
        });
    }

    return await getRolePermissions(roleId, targetCompanyId);
};

// Role delete karo
export const deleteRole = async (roleId: number, companyId: string) => {
    const role = await prisma.role.findFirst({
        where: { id: roleId, companyId },
    });

    if (!role) throw new Error("Role not found");

    // Pehle permissions delete karo
    await prisma.permission.deleteMany({
        where: { roleId, companyId },
    });

    // Phir role delete karo
    await prisma.role.delete({
        where: { id: roleId },
    });

    return { message: "Role deleted successfully" };
};