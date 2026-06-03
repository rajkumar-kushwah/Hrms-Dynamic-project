import { type Request, type Response } from "express";
import { prisma } from "../config/db.ts";
import bcrypt from "bcrypt";


// signup controller

// export const signup = async (req: any, res: any) => {
//     const { name, email, password } = req.body;
//     try {
//         const users = await prisma.user.findUnique({
//             where: {
//                 email: email
//             }
//         })
//         if (users) {
//             return res.status(400).json({ message: 'User already exists' });
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // 2. check user count   super admin can create user
//         const userCount = await prisma.user.count();

//         let role;

//         if (userCount === 0) {
//             role = await prisma.role.findFirst({
//                 where: { name: "SUPER_ADMIN" }
//             });
//         } else {
//             role = await prisma.role.findFirst({
//                 where: { name: "EMPLOYEE" }   // default role
//             });
//         }

//         if (!role) {
//             return res.status(404).json({ message: 'Role not found' });
//         }

//         const newUser = await prisma.user.create({
//             data: {
//                 name,
//                 email,
//                 password: hashedPassword,
//                 companyId: req.company.id,
//                 roles: {
//                     connect: { id: role.id }
//                 }
//             }
//         });
//         res.status(201).json({ message: 'User created successfully', user: newUser });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// }




// signup controller
// export const signup = async (req: any, res: any) => {
//     const { name, email, password } = req.body;
//     try {
//         const users = await prisma.user.findUnique({
//             where: {
//                 email: email
//             }
//         })
//         if (users) {
//             return res.status(400).json({ message: 'User already exists' });
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // 2. check user count   super admin can create user
//         const userCount = await prisma.user.count();

//         let role;

//         if (userCount === 0) {
//             role = await prisma.role.findFirst({
//                 where: { name: "SUPER_ADMIN" }
//             });
//         } else {
//             role = await prisma.role.findFirst({
//                 where: { name: "EMPLOYEE" }   // default role
//             });
//         }

//         if (!role) {
//             return res.status(404).json({ message: 'Role not found' });
//         }

//         const newUser = await prisma.user.create({
//             data: {
//                 name,
//                 email,
//                 password: hashedPassword,
//                 companyId: req.company.id,
//                 roles: {
//                     connect: { id: role.id }
//                 }
//             }
//         });
//         res.status(201).json({ message: 'User created successfully', user: newUser });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// }

// signin controller 
// export const signin = async (req: any, res: any) => {
//     const { email, password } = req.body;
//     try {
//         if (!email || !password) {
//             return res.status(400).json({ message: "Email and password required" });
//         }

//         const user = await prisma.user.findUnique({
//             where: { email },
//             include: {
//                 company: true,
//                 roles: {
//                     include: {
//                         permissions: true
//                     }
//                 }
//             }
//         });

//         if (!user) {
//             return res.status(401).json({ message: 'User not found' });
//         }


//         // console.log("user", JSON.stringify(user.roles, null, 2));

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid Password' });
//         }

//         // update last login
//         await prisma.user.update({
//             where: { id: user.id },
//             data: { lastLogin: new Date() }
//         });

//         // console.log(JSON.stringify(user.roles, null, 2));
//         // Store the user ID in the session

//         console.log("LOGIN START");

//         console.log("EMAIL:", email);

//         console.log("USER FOUND:", user);

//         console.log("ROLES RAW:", user?.roles);

//         console.log("ROLES JSON:", JSON.stringify(user?.roles, null, 2));

//         console.log("LOGIN END");

//         (req.session as any).userId = user.id;
//         (req.session as any).companyId = user.companyId;

//         console.log("SESSION:", req.session);
//         console.log("USERID:", (req as any).session?.userId);
//         const permission = [
//             ...new Set(
//                 user.roles?.flatMap((role: any) =>
//                     role.permissions.map((p: any) => p.name) ?? []
//                 ) ?? []
//             )
//         ];

//         const primaryRole = user.roles?.[0] || null;

//         if (!primaryRole) {
//             return res.status(400).json({
//                 message: "Role not assigned to user"
//             });
//         }

//         return res.status(200).json({
//             message: 'Login successful',
//             user: {
//                 id: user.id,
//                 email: user.email,
//                 role: primaryRole.name,
//                 roles: user.roles.map(role => role.name),
//                 permission
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

// logout controller
// export const logout = async (req: any, res: any) => {
//     try {

//         if (!(req.session as any).userId) {
//             return res.status(401).json({ message: "Not authorized" });
//         }

//         req.session.destroy((err: any) => {
//             if (err) {
//                 return res.status(500).json({ message: 'Logout failed' });
//             }

//             res.clearCookie('connect.sid');
//             return res.status(200).json({ message: 'Logout successful' });
//         });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

// delete user
// export const deleteUser = async (req: any, res: any) => {
//     try {
//         // const userId = req.session.userId;
//         const id = Number(req.params.id);
//         const user = await prisma.user.deleteMany({
//             where: { id,
//                 companyId: req.session.companyId
//              },
//         })
//         res.status(200).json({ message: 'User deleted successfully', user: user });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// }

// update user
// export const UpdateUser = async (req: any, res: any) => {
//     try {
//         const id = Number(req.params.id);
//         const { name, email, password } = req.body;

//         type UserUpdateInput = Parameters<typeof prisma.user.updateMany>[0]['data'];

//         const data: UserUpdateInput = { name, email };
//         // password script
//        if(password){
//         data.password = await bcrypt.hash(password, 10);
//        }

//         const UpdateUser = await prisma.user.updateMany({
//             where: { 
//                 id,
//                 companyId: req.session.companyId,
//              },
//             data,
//         })
//         res.status(200).json({ message: 'User updated successfully', user: UpdateUser });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Server error' });
//     }

// };

// signin controller

export const signin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // find user
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // checked active user
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'User is inactive' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // create session
        req.session.userId = user.id;
        console.log("SESSION AFTER LOGIN:", req.session);
        console.log("USER ID:", req.session.userId);

        // update Last login
        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLogin: new Date()
            },
        });

        // session Response 
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}


// logout controller
export const logout = async (req: Request, res: Response) => {
    try {

        req.session.destroy((err: Error | null) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Logout failed' });
            }

            res.clearCookie('connect.sid');
            return res.status(200).json({ success: true, message: 'Logged out successfully' });

        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}