import type { Request, Response } from "express";
import * as RoleService from "../services/role.service.ts";
import { prisma } from "../config/db.ts";
// Sabhi roles
export const getCompanyRoles = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId ?? null;
        const isSuperAdmin = req.user?.role?.name === "super_admin";

        const roles = await RoleService.getCompanyRoles(companyId, isSuperAdmin);
        res.status(200).json({ success: true, data: roles });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Role create
export const createRole = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId!;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "Company not found in session"
            });
        }

        const role = await RoleService.createRole(companyId, req.body);
        res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: role,
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Role permissions dekho
export const getRolePermissions = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId!;
        const id = (req.params.id as string);
        const roleId = parseInt(id);
        const role = await RoleService.getRolePermissions(roleId, companyId);
        res.status(200).json({ success: true, data: role });
    } catch (error: any) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// Permissions update
export const updateRolePermissions = async (req: Request, res: Response) => {
    try {
        // const companyId = req.user?.companyId!;
        const id = (req.params.id as string);
        const roleId = parseInt(id);
        const { permissions } = req.body;

        const companyId = req.user?.role?.name === "super_admin"
            ? null
            : req.user?.companyId!;

        const role = await RoleService.updateRolePermissions(
            roleId,
            companyId,
            permissions
        );
        res.status(200).json({
            success: true,
            message: "Permissions updated successfully",
            data: role,
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Role delete
export const deleteRole = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.companyId!;
        const id = (req.params.id as string);
        const roleId = parseInt(id);
        const result = await RoleService.deleteRole(roleId, companyId);
        res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET /api/modules — Saare modules lo
export const getModules = async (req: Request, res: Response) => {
    try {
        const modules = await prisma.module.findMany({
            where: { isActive: true }, // Sirf parent nahi — sab
            select: {
                id: true,
                name: true,
                displayName: true,
                parentId: true,  // parentId include
                order: true,
                icon: true,
                url: true,
            },
            orderBy: { order: "asc" }
        });

        return res.status(200).json({
            success: true,
            data: modules,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};