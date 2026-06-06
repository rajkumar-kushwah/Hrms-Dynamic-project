import { type Request, type Response } from "express";
import { prisma } from "../config/db.ts";
import {
    createRoleService,
    getAllRolesService,
    getRoleByIdService,
    updateRoleService,
    deleteRoleService,
} from "../services/role.service.ts";


//Create Role controller

export const createRole = async (req: Request, res: Response) => {
    try {
        const { name, description, permissions } = req.body;
        const companyId = req?.user?.companyId ?? undefined;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Role name is required"
            });
        }

        if (!permissions || permissions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Permissions are required"
            });
        }

        const role = await createRoleService({
            name,
            description,
            companyId,
            permissions,
        });

        return res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: role,
        });
    } catch (error: any) {
        console.error(error);
        return res.status(400).json({
            success: false,
            message: error.message ?? "Failed to create role",
        });
    }
}
// Get All Roles controller
export const getAllRoles = async (req: Request, res: Response) => {
    try {
        const companyId = req?.user?.companyId ?? undefined;

        const roles = await getAllRolesService(companyId);

        return res.status(200).json({
            success: true,
            message: "Roles fetched successfully",
            data: roles,
        })
    } catch (error: any) {
        console.error(error);
        return res.status(400).json({
            success: false,
            message: error.message ?? "Failed to fetch roles",
        });
    }
}

// Get Single Role
export const getRoleById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        // validate
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role id"
            });
        }
        const role = await getRoleByIdService(id);

        return res.status(200).json({
            success: true,
            message: "Role fetched successfully",
            data: role,
        })
    } catch (error: any) {
        console.error(error);
        return res.status(400).json({
            success: false,
            message: error.message ?? "Failed to fetch role",
        });
    }
}

// update role controller
export const updateRole = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role id"
            });
        }

        const { name, description, isActive, permissions } = req.body;

        const role = await updateRoleService(id, {
            name,
            description,
            isActive,
            permissions,
        });

        return res.status(200).json({
            success: true,
            message: "Role updated successfully",
            data: role,
        });

    } catch (error: any) {
        console.error(error);
        return res.status(400).json({
            success: false,
            message: error.message ?? "Failed to update role",
        });
    }
}

// Delete Role

export const deleteRole = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role id"
            });
        }

        const result = await deleteRoleService(id);

        return res.status(200).json({
            success: true,
            message: "Role deleted successfully",
            data: result.message,
        });

    } catch (error: any) {
        console.error(error);
        return res.status(400).json({
            success: false,
            message: error.message ?? "Failed to delete role",
        });
    }
    }
