import { signin, logout } from "../controllers/auth.controlller.ts";
import express from "express";
import { protect } from "../middleware/auth.middleware.ts";
import { getProfile } from "../controllers/profile.controller.ts";

// signup, deleteUser, logout, UpdateUser

const router = express.Router();

// const authRouter = express.Router();

// authRouter.post('/signup', signup)
router.post('/signin', signin)
// authRouter.delete('/users/:id', deleteUser)
router.post('/logout', protect, logout)
router.get('/profile', protect, getProfile)

// authRouter.put('/users/:id', protect, UpdateUser)

export default router

