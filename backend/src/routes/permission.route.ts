import express from "express";

import { createPermission, updatePermission, deletePermission, getPermissions } from "../controllers/Permission.controller.ts";


const router = express.Router();


router.post('/', createPermission);
router.get('/', getPermissions);
router.put('/:id', updatePermission);
router.delete('/:id', deletePermission);

export default router