import { prisma } from "../config/db.js";

export const createLeaveType = async (companyId: string, data: { name: string; description?: string; daysPerYear?: number; }) => {
    const existing = await prisma.leaveType.findFirst({ where: { name: data.name, companyId } });
    if (existing) throw new Error("Leave type already exists");

    const leaveType = await prisma.leaveType.create({ data: { ...data, companyId } });
    return leaveType;
}

// getleavetypes
export const getLeaveTypes = async (companyId: string | null) => {
    return await prisma.leaveType.findMany({
        where: {
            ...(companyId ? { companyId } : {}),
            isActive: true,
        },
        orderBy: { createdAt: "asc" }
    });

}

// UpdateLeaveType
export const updateLeaveType = async (id: string, data: { name?: string; description?: string; daysPerYear?: number; }) => {
    const existing = await prisma.leaveType.findUnique({ where: { id } });
    if (!existing) throw new Error("Leave type not found");

    return await prisma.leaveType.update({ where: { id }, data });
}

// DeleteLeaveType
export const deleteLeaveType = async (id: string) => {
    const existing = await prisma.leaveType.findUnique({ where: { id } });
    if (!existing) throw new Error("Leave type not found");

    await prisma.leaveType.update({ where: { id }, data: { isActive: false } });
    return { message: "Leave type deactivated successfully" };
}
