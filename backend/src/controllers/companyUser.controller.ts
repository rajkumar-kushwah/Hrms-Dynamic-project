import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";

// Get All Users
export const getUsers = async (req: Request, res: Response) => {
    try {
        const userRole = req.user?.role?.name;
        const companyId = req.user?.companyId;

        // super admin can see all users
        // company admin can see only their company users
        const whereClause = {
            companyId: userRole === "super_admin"
                ? { not: null }
                : companyId,
            role: { name: "company_admin" } // Dono ke liye same
        };

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                createdAt: true,
                company: {
                    select: { id: true, name: true, code: true }
                },
                role: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Toggle Active/Inactive
export const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const requestingUser = req.user;
        if (!id) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        //  Khud ko deactivate mat karo
        if (id === requestingUser?.id) {
            return res.status(400).json({ success: false, message: "you cannot Deactivate yourself" });
        }

        // Dusri company ka user touch mat karo and super admin ka user touch mat karo
        if (requestingUser.role.name !== "super_admin" && user.companyId !== requestingUser.companyId) {
            return res.status(400).json({ success: false, message: "Access Denied" });
        }

        const updated = await prisma.user.update({
            where: { id },
            data: { isActive: !user.isActive }, //  Toggle
        });

        return res.status(200).json({
            success: true,
            message: `User ${updated.isActive ? "activated" : "deactivated"} successfully`,
            data: { id: updated.id, isActive: updated.isActive },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Reset Password
export const resetUserPassword = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { password } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Invalid user id" });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};