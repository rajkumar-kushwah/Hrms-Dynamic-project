


//  check Permissions


import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db.js";


// export const checkPermissions = (permissionName: string) => {
//   return async (req: any, res: any, next: any) => {
//     const userId = req.session.userId;

//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       include: {
//         company: true,
//         roles: {
//           include: {
//             permissions: true
//           }
//         }
//       }
//     });

//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const roles = user.roles.map(r => r.name);

//     if (roles.includes("SUPER_ADMIN")) {
//       return next();
//     }

//     const permissions = user.roles.flatMap(role =>
//       role.permissions.map(p => p.name)
//     );

//     if (!permissions.includes(permissionName)) {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     req.user = user;
//     req.company = user.company;

//     next();
//   };
// };


// -- Role + Permission chek ek sath 
export const authorize = (moduleName: string, action: "canView" | "canCreate" | "canEdit" | "canDelete") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {

      const user = req.user;
      const roleId = user?.role?.id;
      const roleName = user?.role?.name;

      if (!roleId || !roleName) {
        return res.status(403).json({
          success: false,
          message: "No role assigned"
        });
      }
      
     // Super Admin ko direct allow karo — permission check ki zaroorat nahi
      if(roleName === "super_admin"){
        return next();
      }

      //  Baaki sabke liye permission check this
      const permission = await prisma.permission.findFirst({
        where: {
          roleId,
          module: {name: moduleName},
        }
      });

      if(!permission || !permission[action]){
        return res.status(403).json({
          success: false,
          message: `Access denied for ${moduleName} ${action}`
        });
      }

      next();


    } catch (err) {
      return res.status(500).json({ success: false, message: 'Permission error' });
    }
  }


}

// role.middleware.ts mein add karo
export const checkSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role?.name !== "super_admin") {
        return res.status(403).json({
            success: false,
            message: "Only Super Admin can perform this action"
        });
    }
    next();
};