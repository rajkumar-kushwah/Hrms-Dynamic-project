import { prisma } from "../config/db.ts";


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
    }
) => {

    //  Code auto generate karo
    const branchCount = await prisma.branch.count({ where: { companyId } });
    const code = `BR${String(branchCount + 1).padStart(3, "0")}`;

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

