import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";

// Create Employee
export const createEmployee = async (
    companyId: string,
    createdBy: string,
    requestingUserRole: string,
    data: {
        name: string;
        email: string;
        password: string;
        roleId: number;
        branchId?: string;
        categoryId?: string;
        phone?: string;
        dateOfBirth?: string;
        gender?: string;
        bloodGroup?: string;
        maritalStatus?: string;
        currentAddress?: string;
        permanentAddress?: string;
        designation?: string;
        joiningDate?: string;
        employmentType?: string;
        workShift?: string;
        reportingManagerId?: string;
        panNumber?: string;
        aadharNumber?: string;
        bankAccountNumber?: string;
        bankIFSC?: string;
        bankName?: string;
        pfNumber?: string;
        esiNumber?: string;
        emergencyContactName?: string;
        emergencyContactPhone?: string;
    }
) => {
    // Email duplicate check
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) throw new Error("Email already exists");

    const lastcode = await prisma.user.findFirst({
        where: {
            companyId,
            employeeCode: {
                not: null
            },
        },
        orderBy: {
            employeeCode: "desc",
        },
        select: {
            employeeCode: true,
        },
    })

    let nextNumber = 1;
    if (lastcode?.employeeCode) {
        nextNumber = parseInt(lastcode.employeeCode.replace('EMP', '')) + 1;
    }

    // Employee code auto generate
    const employeeCode = `EMP${String(nextNumber).padStart(4, "0")}`;

    if (data.branchId) {
        const branch = await prisma.branch.findUnique({
            where: { id: data.branchId },
        });

        if (!branch) throw new Error("Branch not found");
        if (!branch.isActive) throw new Error("Branch is inactive");
    }

    if (data.categoryId) {
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
        });

        if (!category) throw new Error("Category not found");
        if (!category.isActive) throw new Error("Category is inactive");
    }

    
    // Role validation
    const role = await prisma.role.findUnique({
        where: { id: data.roleId },
    });

    if (!role) {
        throw new Error("Role not found");
    }

    // Company Admin cannot assign system roles
    if (
        requestingUserRole === "company_admin" &&
        role.isSystemRole
    ) {
        throw new Error("Company Admin cannot assign system roles");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const employee = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            isActive: true,
            companyId,
            roleId: data.roleId,
            createdBy,
            employeeCode,
            ...(data.branchId && { branchId: data.branchId }),
            ...(data.categoryId && { categoryId: data.categoryId }),
            ...(data.phone && { phone: data.phone }),
            ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
            ...(data.gender && { gender: data.gender }),
            ...(data.bloodGroup && { bloodGroup: data.bloodGroup }),
            ...(data.maritalStatus && { maritalStatus: data.maritalStatus }),
            ...(data.currentAddress && { currentAddress: data.currentAddress }),
            ...(data.permanentAddress && { permanentAddress: data.permanentAddress }),
            ...(data.designation && { designation: data.designation }),
            ...(data.joiningDate && { joiningDate: new Date(data.joiningDate) }),
            ...(data.employmentType && { employmentType: data.employmentType }),
            ...(data.workShift && { workShift: data.workShift }),
            ...(data.reportingManagerId && { reportingManagerId: data.reportingManagerId }),
            ...(data.panNumber && { panNumber: data.panNumber }),
            ...(data.aadharNumber && { aadharNumber: data.aadharNumber }),
            ...(data.bankAccountNumber && { bankAccountNumber: data.bankAccountNumber }),
            ...(data.bankIFSC && { bankIFSC: data.bankIFSC }),
            ...(data.bankName && { bankName: data.bankName }),
            ...(data.pfNumber && { pfNumber: data.pfNumber }),
            ...(data.esiNumber && { esiNumber: data.esiNumber }),
            ...(data.emergencyContactName && { emergencyContactName: data.emergencyContactName }),
            ...(data.emergencyContactPhone && { emergencyContactPhone: data.emergencyContactPhone }),
        },
        include: {
            role: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
        }
    });

    const { password: _, ...employeeWithoutPassword } = employee;
    return employeeWithoutPassword;
};

// Get All Employees
export const getEmployees = async (
    companyId: string | null,
    requestingUserId: string,
    requestingUserRole: string
) => {
    const isAdminRole = ["super_admin", "company_admin"].includes(requestingUserRole);

    return await prisma.user.findMany({
        where: {
            ...(companyId ? { companyId } : { companyId: { not: null } }),
            role: {
                name: { not: "company_admin" },
            },
            ...(!isAdminRole && { id: requestingUserId }),

        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            employeeCode: true,
            designation: true,
            joiningDate: true,
            isActive: true,
            createdAt: true,
            role: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
            company: { select: { id: true, name: true } },
        },

        orderBy: { createdAt: "desc" }
    });
};

// Get Single Employee
export const getEmployeeById = async (
    id: string,
    requestingUserId: string,
    requestingUserRoleId: string,
    requestingCompanyId: string

) => {

    // ager requesting user "Employee" hai (Admin nhi )
    // toh sirf khud ka data dekh sake
    const isAdminRole = ["super_admin", "company_admin"].includes(requestingUserRoleId);
    if (!isAdminRole && requestingUserId !== id) {
        throw new Error("Access denied — you can only view your own profile");
    }



    const employee = await prisma.user.findUnique({
        where: { id },
        select: {
            companyId: true,
            id: true,
            name: true,
            email: true,
            phone: true,
            employeeCode: true,
            dateOfBirth: true,
            gender: true,
            bloodGroup: true,
            maritalStatus: true,
            currentAddress: true,
            permanentAddress: true,
            designation: true,
            joiningDate: true,
            employmentType: true,
            workShift: true,
            panNumber: true,
            aadharNumber: true,
            bankAccountNumber: true,
            bankIFSC: true,
            bankName: true,
            pfNumber: true,
            esiNumber: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            isActive: true,
            role: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
            reportingManager: { select: { id: true, name: true } },
        }
    });
    // comapny admin sirf apni company ke employees dekh skta hai
    if (
        requestingUserRoleId === "company_admin" &&
        employee?.companyId !== requestingCompanyId
    ) {
        throw new Error("Access denied");
    }
    if (!employee) throw new Error("Employee not found");
    return employee;
};

// Update Employee
export const updateEmployee = async (id: string,
    requestingUserId: string,
    requestingUserRole: string,
    requestingCompanyId: string,
    data: {
        name?: string;
        phone?: string;
        dateOfBirth?: string;
        gender?: string;
        bloodGroup?: string;
        maritalStatus?: string;
        currentAddress?: string;
        permanentAddress?: string;
        designation?: string;
        joiningDate?: string;
        employmentType?: string;
        workShift?: string;
        roleId?: number;
        branchId?: string;
        categoryId?: string;
        reportingManagerId?: string;
        panNumber?: string;
        aadharNumber?: string;
        bankAccountNumber?: string;
        bankIFSC?: string;
        bankName?: string;
        pfNumber?: string;
        esiNumber?: string;
        emergencyContactName?: string;
        emergencyContactPhone?: string;
        isActive?: boolean;
    }) => {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new Error("Employee not found");

    // status update 
    const isAdminRole = ["super_admin", "company_admin"].includes(requestingUserRole);
    const isSelf = requestingUserId === id;

    // Access check - khud ya admin hi edit kr sake 
    if (!isAdminRole && !isSelf) {
        throw new Error("Access denied — you can only edit your own profile");
    }

    // Company Admin sirf apni company ke employee edit kare
    if (requestingUserRole === "company_admin" && existing.companyId !== requestingCompanyId) {
        throw new Error("Access denied — this employee doesn't belong to your company");
    }

    let safeData = { ...data };

    // role validation
    if (safeData.roleId) {
        const role = await prisma.role.findUnique({
            where: { id: safeData.roleId },
        });

        if (!role) {
            throw new Error("Role not found");
        }

        if (
            requestingUserRole === "company_admin" &&
            role.isSystemRole
        ) {
            throw new Error("Company Admin cannot assign system roles.");
        }
    }

    // Ager khud Employee edit kr rha hai (Admin nhi ), sensitive  field block karo
    if (!isAdminRole && !isSelf) {
        const {
            roleId, branchId, categoryId, isActive,
            designation, joiningDate, employmentType,
            reportingManagerId, panNumber, aadharNumber,
            bankAccountNumber, bankIFSC, bankName,
            pfNumber, esiNumber,
            ...allowedSelfEdit
        } = safeData;

        safeData = allowedSelfEdit;
    }


    // status update — sirf admin
    if (safeData.isActive !== undefined && !isAdminRole) {
        throw new Error("You cannot change employee status");
    }

    // branch validation
    if (safeData.branchId) {
        const branch = await prisma.branch.findUnique({ where: { id: safeData.branchId } });
        if (!branch) throw new Error("Branch not found");
        if (!branch.isActive) throw new Error("Branch is inactive");
    }

    const { dateOfBirth, joiningDate, ...rest } = safeData;


    return await prisma.user.update({
        where: { id },
        data: {
            ...rest,
            ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
            ...(joiningDate && { joiningDate: new Date(joiningDate) }),
        },
        include: {
            role: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
        }
    });
};

// Delete Employee (Soft)
export const deleteEmployee = async (id: string) => {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new Error("Employee not found");

    await prisma.user.update({
        where: { id },
        data: { isActive: false }
    });

    return { message: "Employee deactivated successfully" };
};