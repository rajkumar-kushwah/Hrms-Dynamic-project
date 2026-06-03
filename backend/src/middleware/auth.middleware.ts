
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.ts";

// export const protect = async (req: any, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.session.userId;

//     if (!userId) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       include: {

//         roles: {
//           include: {
//             permissions: true
//           }
//         }

//     });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid session" });
//     }

//     req.user = user;
//     req.company = user.company;

//     next();
//   } catch (error) {
//     return res.status(500).json({ message: "Auth error" });
//   }
// };




export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    req.userId = userId;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Auth error" });
  }
};


