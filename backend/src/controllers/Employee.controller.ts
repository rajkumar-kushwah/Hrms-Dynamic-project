import type { Request, Response } from "express";
import * as EmployeeService from "../services/employee.service.ts";


// create employee controller
export const createEmployee = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId!;
        const createdBy = req.user?.id!;
        const employee = await EmployeeService.createEmployee(companyId, createdBy, req.body);

        res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// get all employees controller
export const getEmployees = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.role.name === "super_admin" ? null : req.user?.companyId!;

        const employees = await EmployeeService.getEmployees(companyId);

        return res.status(200).json({ success: true, data: employees });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// get single employee controller
export const getEmployeeById = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        if (!id) return res.status(400).json({ success: false, message: "Invalid employee id" });

        const employee = await EmployeeService.getEmployeeById(id);

        return res.status(200).json({ success: true, data: employee });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

// update employee controller
export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        if (!id) return res.status(400).json({ success: false, message: "Invalid employee id" });

        const employee = await EmployeeService.updateEmployee(id, req.body);

        return res.status(200).json({ success: true, message: "Employee updated successfully", data: employee });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        if (!id) return res.status(400).json({ success: false, message: "Invalid employee id" });

        const employee = await EmployeeService.deleteEmployee(id);

        return res.status(200).json({ success: true, message: employee.message });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}