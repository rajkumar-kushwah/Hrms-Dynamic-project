import { signin, logout } from "../controllers/auth.controlller.js";
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { changePassword, getProfile, updateProfile } from "../controllers/profile.controller.js";

// signup, deleteUser, logout, UpdateUser

const router = express.Router();

// const authRouter = express.Router();

// authRouter.post('/signup', signup)
router.post('/signin', signin)
// authRouter.delete('/users/:id', deleteUser)
router.post('/logout', protect, logout)
router.get('/profile', protect, getProfile)
router.put("/profile", protect, updateProfile);
router.patch("/profile/change-password", protect, changePassword);

// authRouter.put('/users/:id', protect, UpdateUser)

export default router

