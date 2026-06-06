import { exit } from "node:process";
import { prisma } from "../../src/config/db.ts";


// Create role

export const createRoleService = async (data: {
    name: string;
    description: string;
    companyId?: string;
    permissions: {
        moduleId: number;
        canView: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
    }[];

}) => {


    // check duplicate role name same company mein
    const exitingRole = await prisma.role.findFirst({
        where: {
            name: data.name,
            companyId: data.companyId ?? null,
        },
    });

    if (exitingRole) {
        throw new Error("Role already exists");
    }

    const role = await prisma.role.create({
        data: {
            name: data.name,
            description: data.description,
            companyId: data.companyId ?? null,
            permissions: {
                create: data.permissions.map((permission) => ({
                    moduleId: permission.moduleId,
                    canView: permission.canView,
                    canCreate: permission.canCreate,
                    canEdit: permission.canEdit,
                    canDelete: permission.canDelete,
                })),
            },
        },
        include: {
            permissions: {
                include: {
                    module: true
                },
            },
        },
    })

    return role;


}

//  Get All Roles

export const getAllRolesService = async (companyId?: string) => {
    const roles = await prisma.role.findMany({
        where: {
            companyId: companyId ?? null,
        },
        include: {
            permissions: {
                include: { module: true },
            },
            _count: {
                select: { user: true }, // Kitne users hain is role pe
            },
        },
        orderBy: { id: "asc" },
    });

    return roles;
};

// Get Single Role
export const getRoleByIdService = async (id: number) => {
    const role = await prisma.role.findFirst({
        where: { id },
        include: {
            permissions: {
                include: { module: true },
            },
            _count: {
                select: { user: true },
            },
        },
    });

    if (!role) {
        throw new Error('Role not found');
    }
    return role;
}

// Update Role
export const updateRoleService = async (
    id: number,
    data: {
        name?: string;
        description?: string;
        isActive?: boolean;
        permissions: {
            moduleId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        }[];
    }) => {

    // Check karo role exist karta hai
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) throw new Error('Role not found');

    // Permissions update karni hain to pehle delete karo phir recreate
    if (data.permissions) {
        await prisma.permission.deleteMany({ where: { roleId: id } })
    }

    const role = await prisma.role.update({
        where: { id },
        data: {
            //  Sirf wahi fields pass karo jo actually hain
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
            ...(data.permissions && {
                permissions: {
                    create: data.permissions.map((p) => ({
                        moduleId: p.moduleId,
                        canView: p.canView,
                        canCreate: p.canCreate,
                        canEdit: p.canEdit,
                        canDelete: p.canDelete,
                    })),
                },
            }),
        },
        include: {
            permissions: {
                include: { module: true },
            },
        },
    });

    return role

}

// Delete Role

export const deleteRoleService = async (id: number) => {
    const existing = await prisma.role.findUnique({
        where: { id },
        include: { _count: { select: { user: true } } },
    });

    if (!existing) throw new Error("Role not found");

    // Super admin delete nahi hoga
    if (existing.name === "super_admin") {
        throw new Error("Super Admin role cannot be deleted");
    }

    // Agar users assigned hain to delete mat karo
    if (existing._count.user > 0) {
        throw new Error(`Cannot delete — ${existing._count.user} users assigned to this role`);
    }

    // Pehle permissions delete karo phir role

    await prisma.permission.deleteMany({ where: { roleId: id } });
    await prisma.role.delete({ where: { id } });

    return { message: "Role deleted successfully" };
    
}