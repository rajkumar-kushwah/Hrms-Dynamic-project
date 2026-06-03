


//  check Permissions


import { prisma } from "../config/db.ts";


// export const checkPermissions = (permissionName: string) => {
//   return (req: any, res: any, next: any) => {

//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     // roles extract karo
//     const roles = user.roles.map((r: any) => r.name);

//     // SUPER_ADMIN bypass
//     if (roles.includes("SUPER_ADMIN")) {
//       return next();
//     }

//     // permissions extract karo
//     const permissions = user.roles.flatMap((role: any) =>
//       role.permissions.map((p: any) => p.name)
//     );

//     if (!permissions.includes(permissionName)) {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     next();
//   };
// };


export const checkPermissions = (permissionName: string) => {
  return async (req: any, res: any, next: any) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        roles: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roles = user.roles.map(r => r.name);

    if (roles.includes("SUPER_ADMIN")) {
      return next();
    }

    const permissions = user.roles.flatMap(role =>
      role.permissions.map(p => p.name)
    );

    if (!permissions.includes(permissionName)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    req.user = user;
    req.company = user.company;

    next();
  };
};