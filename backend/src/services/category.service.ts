import { prisma } from "../config/db.ts";


// create category
export const createCategory = async (
    companyId: string,
    data: {
        name: string;
        description: string;
        branchId: string;
    }

) => {
    // duplicate same branch
    const existing = await prisma.category.findUnique({
        where: {
            name_branchId: {
                name: data.name,
                branchId: data.branchId,
            }
        }
    });

    if (existing) throw new Error("Category already exists");

    const category = await prisma.category.create({
        data: {
            ...data,
            companyId,
        },
        include: {
            company: { select: { id: true, name: true } }
        }
    });

    return category;
};

// Get All Categories
export const getCategories = async (companyId: string | null) => {
    return await prisma.category.findMany({
        where: {
            ...(companyId ? { companyId } : {}),
        },
        include: {
            branch: { select: { id: true, name: true } },
            company: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" }
    })
}

// get sinlge category
export const getCategoryById = async (id: string) => {
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            branch: { select: { id: true, name: true } },
            company: { select: { id: true, name: true } }
        }
    });
    if (!category) throw new Error("Category not found");
    return category;
};

// Update category
export const updateCategory = async (id: string, 
    data: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }
) => {
    const existing = await prisma.category.findUnique({
        where: { id },
    })

    if (!existing) throw new Error("Category not found");

    return await prisma.category.update({
        where: { id },
        data,
    });
}

// Delete category
export const deleteCategory = async (id: string) => {
    const existing = await prisma.category.findUnique({
        where: { id },
    })

    if (!existing) throw new Error("Category not found");

    await prisma.category.update({
        where: { id },
        data: { isActive: false }
    });

    return { message: "Category deactivated successfully" };
}

