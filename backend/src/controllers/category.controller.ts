import type { Request, Response } from "express";
import * as CategoryService from "../services/category.service.ts";


// create category controller
export const createCategory = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId!;
        const category = await CategoryService.createCategory(companyId, req.body);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getCategories = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.role?.name === "super_admin" ? null : req.user?.companyId!;
        const categories = await CategoryService.getCategories(companyId);

        res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        const category = await CategoryService.getCategoryById(id);

        return res.status(200).json({ success: true, data: category });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        const category = await CategoryService.updateCategory(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

// delte category controller
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const id = (req.params.id as string);
        const result = await CategoryService.deleteCategory(id);

        return res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

