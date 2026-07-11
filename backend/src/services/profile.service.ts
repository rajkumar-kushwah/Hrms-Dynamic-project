import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";


// profile.service.ts (ya jahan bhi service hai)
export const updateProfileService = async (userId: string, data: { name?: string }) => {
    return await prisma.user.update({
        where: { id: userId },
        data: {
            ...(data.name && { name: data.name }),
        },
    });
};


export const changePasswordService = async (
    userId: string,
    oldPassword: string,
    newPassword: string
) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    //  Old password verify karo
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) throw new Error("Current password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
};