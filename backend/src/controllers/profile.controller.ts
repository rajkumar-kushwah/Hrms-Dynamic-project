
import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";
import { updateProfileService, changePasswordService } from "../services/profile.service.js";


export const getProfile = async (
  req: Request,
  res: Response
) => {
  const user = req.user;

  return res.status(200).json({
    success: true,
    message: "User profile",
    data: user,
  });
};


// profile.controller.ts
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const updated = await updateProfileService(userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    const result = await changePasswordService(userId, oldPassword, newPassword);

    return res.status(200).json({ success: true, message: result.message });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};