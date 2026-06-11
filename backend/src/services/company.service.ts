import bcrypt from "bcrypt";
import { prisma } from "../config/db.ts";


// Auto company code generate krna 
const generateCompanyCode = async (): Promise<string> => {
    const lastCompany = await prisma.company.findFirst({
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            code: true
        }
    })
   const number = lastCompany?.code?.split("_")[1]
    const newNumber = String(Number(number) + 1).padStart(3, "0");
    return `COMP_${newNumber}`

    // const count = await prisma.company.count();
    // const number = String(count + 1).padStart(3, "0");
    // return `COMP_${number}`;
}

// company create
export const createCompanyService = async (data: {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    logo?: string;
    gstNumber?: string;
    subscriptionPlan?: string;
    maxBranches?: number;
    maxEmployees?: number;
}) => {
    const companyCode = await generateCompanyCode();
    const company = await prisma.company.create({
        data: {
            ...data,
            code: companyCode,
            isActive: true
        }
    })
    return company
}

// all companies
export const getAllCompanies = async () => {
    const companies = await prisma.company.findMany({
        orderBy: {
            createdAt: 'desc'
        },
    })

    return companies
}

// single company 
export const getCompanyById = async (id: string) => {
    const company = await prisma.company.findUnique({
        where: {
            id,
        },
    });

    if (!company) throw new Error("Company not found");

    return company
}

// Company Update

export const updateCompany = async (id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    gstNumber?: string;
    subscriptionPlan?: string;
    maxBranches?: number;
    maxEmployees?: number;
    isActive?: boolean;
}) => {
    const company = await prisma.company.update({
        where: { id },
        data,
    });

    return company
}

// Company Delete
export const deleteCompany = async (id: string) => {
    await prisma.company.delete({
        where: { id },
    });

    return { message: "Company deleted successfully" };
};



const passwordgenerated = (email: string) => {
    const prefix = email.slice(0, 3);
    return `${prefix}@123`;
}

// company assignCompanyAdmin 
export const assignCompanyAdmin = async (companyId: string, data: {
    name: string;
    email: string;
    password: string;
},
    createdBy?: string
) => {

    const company = await prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company) throw new Error("Company not found");

    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) throw new Error("User already exists");

    // Role lo ya banao
    let companyAdminRole = await prisma.role.findFirst({
        where: { name: "company_admin", companyId: company.id },
    });

    if (!companyAdminRole) {
        companyAdminRole = await prisma.role.create({
            data: {
                name: "company_admin",
                description: "Company level admin",
                isActive: true,
                companyId: companyId,
            },
        });

        // Permissions banao
        const allModules = await prisma.module.findMany();
        await prisma.permission.createMany({
            data: allModules.map((module) => ({
                roleId: companyAdminRole!.id,
                moduleId: module.id,
                companyId: companyId,
                canView: true,
                canCreate: module.name !== "company",
                canEdit: module.name !== "company",
                canDelete: false,
            })),
            skipDuplicates: true,
        });
    }

    //  User banao — if block ke bahar
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            isActive: true,
            companyId: companyId,
            roleId: companyAdminRole.id,
            createdBy: createdBy ?? null
        },
    });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            companyId: user.companyId,
            role: "company_admin",
        },
        company: {
            id: company.id,
            name: company.name,
            code: company.code,
        },
    };
};

// get my company
export const getMyCompany = async (companyId: string) => {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
    });

    if (!company) throw new Error("Company not found");

    return company
}

