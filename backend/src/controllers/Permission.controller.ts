import { type Request, type Response } from "express";
import { prisma } from "../config/db.ts";


// permission create controller

export const createPermission = async (req: Request, res: Response) => {
    try {
        const permissions = req.body;

        if (!Array.isArray(permissions) || permissions.length === 0) {
            return res.status(400).json({ message: 'Permissions array required' });
        }

        const result = await prisma.permission.createMany({
            data: permissions
        });

        res.status(201).json({
            message: 'Permissions created successfully',
            data: result
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
// permission get controller

export const getPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await prisma.permission.findMany(
            { orderBy: { name: 'asc' } }
        );

        res.status(200).json({ message: 'Permissions fetched successfully', data: permissions });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

// update permission controller

export const updatePermission = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { name } = req.body;


        if (!id) {
            return res.status(400).json({ message: 'Permission id is required' });
        }

        if (!name) {
            return res.status(400).json({ message: 'Permission name required' });
        }

        const permission = await prisma.permission.update({
            where: { id },
            data: { name },
        });

        res.status(200).json({ message: 'Permission updated successfully', data: permission });
    } catch (error) {
        const err = error as { code?: string };
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'Permission already exists' });
        }

        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Permission not found' });
        }

        res.status(500).json({ message: 'Server error' });
    }
}

//  delete permission controller

export const deletePermission = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({ message: 'Permission id is required' });
        }

        await prisma.permission.delete({
            where: { id },
            // opionally handle relation pahle
        })

        res.status(200).json({ message: 'Permission deleted successfully' });

    } catch (error) {
        const err = error as { code?: string };

        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Permission not found' });
        }

        res.status(500).json({ message: 'Server error' });
    }
}