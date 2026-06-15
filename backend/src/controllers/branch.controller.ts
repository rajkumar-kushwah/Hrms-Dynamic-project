import type { Request, Response } from "express";
import * as BranchService from "../services/branch.service.ts";


// create branch
export const createBranch = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId!;
        const branch = await BranchService.createBranch(companyId, req.body);

        return res.status(201).json({
            success: true,
            message: "Branch created successfully",
            data: branch,
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

// Get all branch
export const getBranches = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.role?.name === "super_admin" ? null : req.user?.companyId!;

        const branches = await BranchService.getAllBranches(companyId);

        return res.status(200).json({
            success: true,
            data: branches
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// get single branch
export const getBranchById = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        if (!id) return res.status(400).json({ success: false, message: "Invalid branch id" });

        const branch = await BranchService.getBranchById(id);

        return res.status(200).json({
            success: true,
            data: branch
        });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
}


// update branch
export const updateBranch = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        if (!id) return res.status(400).json({ success: false, message: "Invalid branch id" });

        const branch = await BranchService.updateBranch(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Branch updated successfully",
            data: branch
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

// delete branch 
export const deleteBranch = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        if (!id) return res.status(400).json({ success: false, message: "Invalid branch id" });

        const result = await BranchService.deleteBranch(id);

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}