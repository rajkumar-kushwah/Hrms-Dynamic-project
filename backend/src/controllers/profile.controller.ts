
import { type Request, type Response } from "express";
import { prisma } from "../config/db.ts";





// export const getprofile = async (req: any, res: any) => {
//   try {
//     const userId = req.session.userId;

//     //  check login
//     if (!userId) {
//       return res.status(401).json({
//         message: "User not logged in",
//       });
//     }

//     //  fetch user with roles
//     const user = await prisma.user.findUnique({
//       where: {
//         id: userId,
//       },
//       include: {
//         company: true,
//         roles: {
//           include: {
//             permissions: true,
//           },
//         },
//       },
//     });

//     // user not found
//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     const permission = [
//       ...new Set(
//         user.roles?.flatMap((role) =>
//           role.permissions?.map((p) => p.name) || []
//         ) || []
//       )
//     ];
//     // clean response

//     const primaryRole = user.roles?.[0] || null;

//     if (!primaryRole) {
//       return res.status(400).json({
//         message: "Role not assigned to user",
//       });
//     }

//     return res.json({
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         createdAt: user.createdAt,
//         lastLogin: user.lastLogin,
//         company: user.company,
//         role: primaryRole.name,
//         roles: user.roles.map((r) => r.name),
//         permission,
//       },
//     });
//   } catch (error) {
//     console.error("GET PROFILE ERROR:", error);

//     return res.status(500).json({
//       message: "Server error",
//     });
//   }
// };



export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }



    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


   

    return res.status(200).json({
      success: true,
      message: "User profile",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
