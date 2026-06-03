import { type Request, type Response } from "express";
import { prisma } from "../config/db.ts";


// create company controller
export const createCompany = async (req: Request, res: Response) => {
    try {
        const { name, code, email, phone, website, address, logo } = req.body;

        // chack company code 
        const companyAxist = await prisma.company.findUnique({
            where: { code }
        });

        if (companyAxist) {
            return res.status(400).json({ success: false, message: 'Company code already exists' });
        }

        // create company
        const Company = await prisma.company.create({
            data: {
                name,
                code,
                email,
                phone,
                website,
                address,
                logo
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Company created successfully',
            data: Company
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

// get All company
export const getCompanies = async (req: Request, res: Response) => {
    try {
        const companies = await prisma.company.findMany({
            orderBy: {
                createdAt: 'desc'
            },
        })
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

// get single company
export const getCompanyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, message: "Company id is required" });
        }

        const company = await prisma.company.findUnique({
            where: { id }
        });

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        return res.status(200).json({
            success: true,
            message: 'Company found successfully',
            data: company
        });


    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

// update company 
export const updateCompany = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, message: "Company id is required" });
        }

        const Company = await prisma.company.update({
            where: { id },
            data: req.body
        });

        return res.status(200).json({
            success: true,
            message: 'Company updated successfully',
            data: Company
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

// delete company 
export const deleteCompany = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Company id is required"
            });
        }

        const company = await prisma.company.update({
            where: { id },
            data: {
                isActive: false
            }
        });

        return res.status(200).json({
            success: true,
            message: "Company deactivated successfully",
            data: company
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};