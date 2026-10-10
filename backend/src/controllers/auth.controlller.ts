import { type Request, type Response } from "express";
import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { isAdminRole } from "../utilis/roleUtils.js";
import { isDatabaseUnavailable, sendDatabaseUnavailable } from "../utilis/dbErrors.js";




// export const signin = async (req: Request, res: Response) => {
//     try {
//         const { email, password } = req.body;

//         // Check if email and password are provided
//         // if (!email || !password) {
//         //     return res.status(400).json({ success: false, message: 'Email and password are required' });
//         // }

//         // find user
//         const user = await prisma.user.findUnique({
//             where: { email },
//             include: {
//                 role: {
//                     include: {
//                         permissions: {
//                             include: {
//                                 module: true  // module detail bhi aaye
//                             },
//                         },
//                     }
//                 },
//                 company: true
//             }
//         })


//         if (!user) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }

//         const isAdmin = isAdminRole(user?.role?.name);

//         const employmentStatus = user.employmentStatus
//             ?.trim()
//             .toLowerCase();

//         // Onboarding check
//         if (!isAdmin && employmentStatus !== "active") {
//             return res.status(403).json({
//                 success: false,
//                 message: "Onboarding is not completed. Login is not allowed.",
//             });
//         }


//         // checked active user
//         if (!user.isActive) {
//             return res.status(403).json({ success: false, message: 'User is inactive' });
//         }

//         if (
//             user.role?.name !== "super_admin" &&
//             user.company &&
//             !user.company.isActive
//         ) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Company account is inactive"
//             });
//         }

//         // Check password
//         const isPasswordValid = await bcrypt.compare(password, user.password);

//         if (!isPasswordValid) {
//             return res.status(401).json({ success: false, message: 'Invalid password' });
//         }

//         // create session
//         req.session.userId = user.id;
//         console.log("SESSION AFTER LOGIN:", req.session);
//         console.log("USER ID:", req.session.userId);

//         // update Last login
//         const UpdateUser = await prisma.user.update({
//             where: { id: user.id },
//             data: { lastLogin: new Date() },
//             include: {
//                 role: {
//                     include: {
//                         permissions: {
//                             include: {
//                                 module: true  //  Module details bhi aaye
//                             }
//                         }
//                     }
//                 }
//             }
//         });

//         const { password: _, ...userWithoutPassword } = UpdateUser;

//         req.session.save((err) => {
//             if (err) {
//                 console.error("SESSION SAVE ERROR:", err);

//                 return res.status(500).json({
//                     success: false,
//                     message: "Session save failed",
//                 });
//             }

//             console.log("SESSION SAVED:", req.session);

//             return res.status(200).json({
//                 success: true,
//                 message: "Login successful",
//                 data: userWithoutPassword,
//             });
//         });
//     } catch (error) {
//         console.error("Login Error :", error);
//         if (isDatabaseUnavailable(error)) {
//             console.log("Login Error : Database is unavailable : ", error);
//             return sendDatabaseUnavailable(res);
//         }
//         return res.status(500).json({ success: false, message: 'Server error' });
//     }
// }


// // logout controller
// export const logout = async (req: Request, res: Response) => {
//     try {

//         req.session.destroy((err: Error | null) => {
//             if (err) {
//                 console.error("Logout Error :", err);
//                 return res.status(500).json({ success: false, message: 'Logout failed' });
//             }

//             // res.clearCookie("connect.sid", {
//             //     path: "/",
//             //     httpOnly: true,
//             //     sameSite: "lax",
//             // });
//             res.clearCookie("sid", {
//                 path: "/",
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV === "production",
//                 sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//             });
//             return res.status(200).json({ success: true, message: 'Logged out successfully' });

//         });

//     } catch (error) {
//         console.error("Logout Error :", error);
//         if (isDatabaseUnavailable(error)) {
//             console.log("Logout Error : Database is unavailable : ", error);
//             return sendDatabaseUnavailable(res);
//         }
//         return res.status(500).json({ success: false, message: 'Server error' });
//     }
// }


// Imports jo aapki file mein pehle se hain wahi rakho
// (Request, Response, prisma, bcrypt, isAdminRole) aur ye add karo:
// import { isDatabaseUnavailable, sendDatabaseUnavailable } from "../utils/dbErrors.js";



export const signin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body ?? {};

        // Missing/non-string input pe pehle 500 aata tha (bcrypt/Prisma throw karte the)
        if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { module: true },
                        },
                    },
                },
                company: true,
            },
        });

        // Password PEHLE check hota hai, status baad mein. Warna bina password
        // ke hi koi bhi email se pata laga leta ki account inactive/onboarding mein hai.
        // "User not found" aur "wrong password" ka message same hai, taaki
        // koi ye na jaan sake ki kaunsa email registered hai.
        const passwordMatches = user
            ? await bcrypt.compare(password, user.password)
            : false;

        if (!user || !passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // req.user login ke waqt set nahi hota (wo protect middleware se aata hai),
        // isliye role user object se hi lena hai
        const roleName = user.role?.name
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

        const isAdmin = isAdminRole(roleName);

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "User is inactive" });
        }

        if (
            user.role?.name !== "super_admin" &&
            user.company &&
            !user.company.isActive
        ) {
            return res.status(403).json({
                success: false,
                message: "Company account is inactive",
            });
        }

        if (!isAdmin && user.employmentStatus !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Onboarding is not completed. Login is not allowed.",
            });
        }

        req.session.userId = user.id;

        const loggedInAt = new Date();

        // Pehle poori user query dobara chalti thi (role + permissions + module),
        // ab sirf lastLogin update hota hai aur response mein company bhi aati hai
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: loggedInAt },
        });

        const { password: _, ...userWithoutPassword } = user;

        req.session.save((err) => {
            if (err) {
                console.error("SESSION SAVE ERROR:", err);

                // Session store DB mein ho to DB down hone par yahi fail hota hai
                if (isDatabaseUnavailable(err)) {
                    return sendDatabaseUnavailable(res);
                }

                return res.status(500).json({
                    success: false,
                    message: "Session save failed",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: { ...userWithoutPassword, lastLogin: loggedInAt },
            });
        });
    } catch (error) {
        console.error("Login Error:", error);

        if (isDatabaseUnavailable(error)) {
            console.log("sendDatabaseUnavailable", isDatabaseUnavailable(error));
            return sendDatabaseUnavailable(res);
        }

        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// logout controller
export const logout = async (req: Request, res: Response) => {
    try {
        req.session.destroy((err: Error | null) => {
            // destroy() ka error callback mein aata hai, catch mein nahi,
            // isliye DB-down check yahan hona chahiye
            if (err) {
                console.error("Logout Error:", err);

                if (isDatabaseUnavailable(err)) {
                    return sendDatabaseUnavailable(res);
                }

                return res.status(500).json({ success: false, message: "Logout failed" });
            }

            res.clearCookie("sid", {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            });

            return res.status(200).json({ success: true, message: "Logged out successfully" });
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};