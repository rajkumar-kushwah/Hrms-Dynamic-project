import { prisma } from "../config/db.ts";
import bcrypt from "bcrypt";

// Create Employee
export const createEmployee = async (
    companyId: string,
    createdBy: string,
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

    // Employee code auto generate
    const empCount = await prisma.user.count({ where: { companyId } });
    const employeeCode = `EMP${String(empCount + 1).padStart(4, "0")}`;

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
export const getEmployees = async (companyId: string | null) => {

    return await prisma.user.findMany({
        where: {
            ...(companyId ? { companyId } : { companyId: { not: null } }),
            role: {
                name: { not: "company_admin" },
            }
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
export const getEmployeeById = async (id: string) => {
    const employee = await prisma.user.findUnique({
        where: { id },
        select: {
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

    if (!employee) throw new Error("Employee not found");
    return employee;
};

// Update Employee
export const updateEmployee = async (id: string, data: any) => {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new Error("Employee not found");

    const { password, email, ...updateData } = data; // Password/email alag se handle

    if (updateData.dateOfBirth) updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    if (updateData.joiningDate) updateData.joiningDate = new Date(updateData.joiningDate);

    return await prisma.user.update({
        where: { id },
        data: updateData,
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