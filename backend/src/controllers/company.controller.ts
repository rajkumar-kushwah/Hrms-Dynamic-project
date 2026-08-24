import { type Request, type Response } from "express";
import * as CompanyService from "../services/company.service.js";

// create company controller
export const createCompany = async (req: Request, res: Response) => {
    try {
        const company = await CompanyService.createCompanyService(req.body);

        res.status(201).json({
            success: true,
            message: "Company created successfully",
            data: company,
        });
    } catch (Error: any) {
        console.error(Error);
        res.status(400).json({
            success: false,
            message: Error.message ?? "Failed to create company",
        });
    }
}

// Sabhi Companies
export const getAllCompanies = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        const roleName = req.user?.role?.name;

        const companies = await CompanyService.getAllCompanies(
            companyId,
            roleName
        );

        res.status(200).json({
            success: true,
            message: "Companies fetched successfully",
            data: companies,
        });
    } catch (Error: any) {
        console.error(Error);
        res.status(400).json({
            success: false,
            message: Error.message ?? "Failed to fetch companies",
        });
    }
}

// get single company
export const getCompanyById = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        const companies = await CompanyService.getCompanyById(id);

        res.status(200).json({
            success: true,
            message: "Company fetched successfully",
            data: companies,
        });
    } catch (Error: any) {
        console.error(Error);
        res.status(400).json({
            success: false,
            message: Error.message ?? "Failed to fetch company",
        });
    }
}

// update Company
export const updateCompany = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        const company = await CompanyService.updateCompany(id, req.body);

        res.status(200).json({
            success: true,
            message: "Company updated successfully",
            data: company,
        });
    } catch (Error: any) {
        console.error(Error);
        res.status(400).json({
            success: false,
            message: Error.message ?? "Failed to update company",
        });
    }
}

// delete company
export const deactivateCompany = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await CompanyService.deactivateCompany(id);
        res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// Permanent delete
export const permanentDeleteCompany = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await CompanyService.permanentDeleteCompany(id);

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// Assign Company admin
export const assignCompanyAdmin = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        const createdBy = (req?.user?.id as string);
        const company = await CompanyService.assignCompanyAdmin(id, req.body, createdBy);

        res.status(200).json({
            success: true,
            message: "Company admin assigned successfully",
            data: company,
        });
    } catch (Error: any) {
        console.error(Error);
        res.status(400).json({
            success: false,
            message: Error.message ?? "Failed to assign company admin",
        });
    }
}

// get my company 
export const getMyCompany = async (req: Request, res: Response) => {
    try {
        const companyId = req?.user?.companyId;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "No company Assigned",
            })
        }

        const company = await CompanyService.getMyCompany(companyId)

        res.status(200).json({
            success: true,
            message: "Company fetched successfully",
            data: company,
        });
    } catch (Error: any) {
        console.error(Error);
        res.status(400).json({
            success: false,
            message: Error.message ?? "Failed to fetch company",
        });
    }
}

