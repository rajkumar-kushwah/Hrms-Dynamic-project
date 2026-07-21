import { prisma } from "../config/db.js";


// create branch
export const createBranch = async (
    companyId: string,
    data: {
        name: string;
        code: string;
        address?: string;
        phone?: string;
        email?: string;
        city?: string;
        state?: string;
        pincode?: string;
        managerName?: string;
        latitude?: number;
        longitude?: number;
        geoRadius?: number;
        locationName?: string;
    }
) => {

    const lastBranch = await prisma.branch.findFirst({
        where: { companyId },
        orderBy: {
            code: "desc",
        },
        select: {
            code: true,
        },
    });

    let nextNumber = 1;

    if (lastBranch?.code) {
        nextNumber =
            parseInt(lastBranch.code.replace("BR", "")) + 1;
    }

    const code = `BR${String(nextNumber).padStart(3, "0")}`;

    // code duplicat chek same company mein
    const codeCheck = await prisma.branch.findUnique({
        where: {
            code_companyId: {
                code,
                companyId,
            }
        }
    });
    if (codeCheck) throw new Error("Branch code already exists in this company.");

    // Branch banao
    const branch = await prisma.branch.create({
        data: {
            ...data,
            code,
            companyId,
        }
    });

    return branch;
}

// Get all branches
export const getAllBranches = async (companyId: string | null) => {
    return await prisma.branch.findMany({
        where: {
            ...(companyId ? { companyId } : {}),
        },
        include: {
            company: {
                select: { id: true, name: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });
};

// Get single branch
export const getBranchById = async (id: string) => {
    const branch = await prisma.branch.findUnique({
        where: { id },
        include: {
            company: {
                select: { id: true, name: true }
            }
        }
    });
    if (!branch) throw new Error("Branch not found");
    return branch;

}

// Update Branch
export const updateBranch = async (
    id: string,
    data: {
        name?: string;
        address?: string;
        phone?: string;
        email?: string;
        city?: string;
        state?: string;
        pincode?: string;
        managerName?: string;
        latitude?: number;
        longitude?: number;
        geoRadius?: number;
        isActive?: boolean;
        locationName?: string;
    }
) => {
    const exiting = await prisma.branch.findUnique({ where: { id } });
    if (!exiting) throw new Error("Branch not found");

    return await prisma.branch.update({
        where: { id },
        data,
    });
};

// Delete Branch
export const deleteBranch = async (id: string) => {
    const existing = await prisma.branch.findUnique({ where: { id } });
    if (!existing) throw new Error("Branch not found");

    await prisma.branch.update({
        where: { id },
        data: { isActive: false }
    });

    return { message: "Branch deactivated successfully" };
}

// Danger Zone - Delete branch permanently
export const permanentDeleteBranch = async (id: string) => {
    const branch = await prisma.branch.findUnique({
        where: { id },
        include: {
            _count: { select: { users: true } }
        }
    });

    if (!branch) throw new Error("Branch not found");

    // Ager Employee hai to delete mat kro
    if (branch._count.users > 0) {
        throw new Error(`Branch delete - ${branch._count.users} employees Assigned to this branch`);
    }

    // Category check 
    const categoryCount = await prisma.category.count({
        where: { branchId: id }
    });
    if (categoryCount > 0) {
        throw new Error(`Category delete - ${categoryCount} category exits under this branch`);
    }
    await prisma.branch.delete({ where: { id } });
    return { message: "Branch permanently deleted" };
}

// getGeoFencingOverview
export const getGeoFencingOverview = async (companyId: string | null) => {
    const branches = await prisma.branch.findMany({
        where: {
            ...(companyId ? { companyId } : {}),
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            city: true,
            latitude: true,
            longitude: true,
            geoRadius: true,
            locationName: true,
            _count: { select: { users: true } }
        }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayattendance = await prisma.attendance.findMany({
        where: {
            branchId: { in: branches.map((branch) => branch.id) },
            date: today,
            punchInTime: { not: null },
        },
        select: {
            branchId: true,
            isWithinGeoFence: true
        }
    });

    return branches.map((branch) => {
        const branchAttendance = todayattendance.filter((a) => a.branchId === branch.id);
        return {
            id: branch.id,
            name: branch.name,
            city: branch.city,
            latitude: branch.latitude,
            longitude: branch.longitude,
            geoRadius: branch.geoRadius,
            locationName: branch.locationName,
            totalEmployees: branch._count.users,
            insideFence: branchAttendance.filter(a => a.isWithinGeoFence).length,
            outsideFence: branchAttendance.filter(a => !a.isWithinGeoFence).length,
            totalPunchedInToday: branchAttendance.length,
        };
    });
};
