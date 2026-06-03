import bcrypt from "bcrypt";
import { prisma } from "../config/db.ts";
import { type Request, type Response } from "express";

//  halper function generate password 
const generatePassword = (email: string) => {
    const prefix = email.slice(0, 3);
    return `${prefix}@123`;
}

export const createEmployee = async (req: Request, res: Response) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            roleId,
            departmentId,
            designation,
            employeeCode,
            joiningDate,
            dateOfBirth,
            address,
            city,
            state,
            pincode
        } = req.body;

        //  Basic validation
        if (!email || !roleId || !departmentId) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const defaultPassword = generatePassword(email)
        //  hash password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        //  transaction start
        const result = await prisma.$transaction(async (tx) => {

            const companyId = (req.session as any).companyId;
            //  Create User
            const user = await tx.user.create({
                data: {
                    name: `${firstName} ${lastName}`,
                    email,
                    password: hashedPassword,
                    companyId,
                    roles: {
                        connect: [{ id: Number(roleId) }]
                    }
                }
            });


            // employee code validation 
            const lastEmployee = await tx.employee.findFirst({
                orderBy: {
                    employeeCode: "desc"
                }
            })

            let nextCode = "EM001";

            if (lastEmployee?.employeeCode) {
                const lastNumber = parseInt(lastEmployee.employeeCode.replace("EM", ""));
                const nextNumber = lastNumber + 1;

                nextCode = `EM${nextNumber.toString().padStart(3, "0")}`;
            }

            //  Create Employee
            const employee = await tx.employee.create({
                data: {
                    firstName,
                    lastName,
                    phone,
                    designation,
                    employeeCode: nextCode,
                    ...(joiningDate && { joiningDate: new Date(joiningDate) }),
                    ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
                    address,
                    city,
                    state,
                    pincode,
                    departmentId: Number(departmentId),
                    userId: user.id,
                    companyId,
                }
            });

            return { user, employee };
        });

        return res.status(201).json({
            message: "Employee created successfully",
            employeeCode: result.employee.employeeCode,
            tempPassword: defaultPassword,
            data: result
        });

    } catch (error) {
        console.error(error);
        const err = error as { code: string }
        //  unique email / employeeCode error handle
        if (err.code === "P2002") {
            return res.status(400).json({
                message: "Email or Employee Code already exists"
            });
        }

        return res.status(500).json({ message: "Server error" });
    }
};

export const getEmployees = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).session.companyId;
        const user = (req as any).user;

        const isEmployee = user.roles?.some((r: any) => r.name === "EMPLOYEE");

        const employees = await prisma.employee.findMany({
            where: {
                companyId,
                ...(isEmployee ? { userId: user.id } : {}),
            },
            include: {
                user: {
                    include: {
                        roles: true,
                    },
                },
                department: true,
            },

        });

        return res.status(200).json(employees);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

// update employee 
export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const {
            firstName,
            lastName,
            email,
            phone,
            roleId,
            departmentId,
            designation,
            employeeCode,
            joiningDate,
            dateOfBirth,
            address,
            city,
            state,
            pincode
        } = req.body;

        // id validation
        if (!id) {
            return res.status(400).json({ message: "Employee id is required" });
        }

        // transaction tx = transaction client
        const result = await prisma.$transaction(async (tx) => {

            // check if employee exite kta h ya nhi 
            const emp = await tx.employee.findFirst({
                where: { id, companyId: (req.session as any).companyId },
                include: {
                    user: true
                }
            })

            if (!emp) {
                throw new Error("Employee not found");
            }

            // update user (if needed)
            const updateUser = await tx.user.update({
                where: { id: emp.userId },
                data: {
                    ...(firstName && lastName) && { name: `${firstName ?? emp.firstName} ${lastName ?? emp.lastName}` },
                    ...(email && { email }),
                    ...(roleId && {
                        roles: {
                            set: [{ id: Number(roleId) }]
                        }
                    })

                }
            })



            // update employee 
            const updateEmployee = await tx.employee.update({
                where: { id: emp.id },
                data: {
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(phone && { phone }),
                    ...(designation && { designation }),
                    ...(employeeCode && { employeeCode }),
                    ...(joiningDate && { joiningDate: new Date(joiningDate) }),
                    ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
                    ...(address && { address }),
                    ...(city && { city }),
                    ...(state && { state }),
                    ...(pincode && { pincode }),
                    ...(departmentId && { departmentId: Number(departmentId) }),

                }

            })
            return { updateUser, updateEmployee };
        })

        return res.status(200).json({
            massage: "Employee updated successfully",
            data: result
        })



    } catch (error) {
        console.log(error);

        const err = error as Error
        if (err.message === "Employee not found") {
            return res.status(404).json({ message: "Employee not found" });
        }

        const e = error as { code: string }
        // unique email / employeeCode error handle
        if (e.code === "P2002") {
            return res.status(400).json({
                message: "Email or Employee Code already exists"
            })

        } else {
            return res.status(500).json({ message: "Server error" });
        }
    }
}

//  delete employee controller
export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({ message: "Employee id is required" });
        }

        await prisma.$transaction(async (tx) => {

            // check if employee exite krta h ya nhi 
            const employee = await tx.employee.findFirst({
                where: { id, companyId: (req.session as any).companyId },
                include: {
                    user: true
                }
            })


            if (!employee) {
                throw new Error("Employee not found");
            }


            // delete employee first (fk safe) 
            await tx.employee.delete({
                where: { id: employee.id }
            })

            // delete user 
            await tx.user.delete({
                where: { id: employee.userId }
            })
        })

        return res.status(200).json({ message: "Employee deleted successfully", });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
}

// filter employee controller

// export const filterEmployee = async (req: Request, res: Response) => {
//     try {
//         const userId = (req as any).session?.userId;
//         const { search, role, departmentId } = req.query;

//         const employees = await prisma.employee.findMany({
//             where: {
//                 userId,
//                 ...(search && {
//                     OR: [
//                         { firstName: { contains: String(search), mode: 'insensitive' } },
//                         { lastName: { contains: String(search), mode: 'insensitive' } },
//                         { designation: { contains: String(search), mode: 'insensitive' } },
//                         { employeeCode: { contains: String(search), mode: 'insensitive' } },
//                         { user: { email: { contains: String(search), mode: 'insensitive' } } },
//                     ]
//                 }),
//                 // ...(role && { roleId: Number(role) }),
//                 ...(role && {
//                     user: {
//                         roles: {
//                             some: {
//                                 id: Number(role),
//                             },
//                         },
//                     },
//                 }),
//                 ...(departmentId && { departmentId: Number(departmentId) }),
//             },
//             include: {
//                 user: {
//                     include: {
//                         roles: true,   //  ADD THIS
//                     },
//                 },
//                 department: true
//             },
//             orderBy: {
//                 createdAt: 'desc'
//             }
//         })
//         return res.status(200).json({
//             message: "Employee filtered successfully",
//             data: employees
//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Server error" });
//     }
// }



export const filterEmployee = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).session?.userId;
        const { search, role, departmentId } = req.query;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });

        const roles = user?.roles?.map((r) => r.name) || [];

        let where: any = { companyId: (req.session as any).companyId };

        //  Restrict only non-admin users
        if (!roles.includes("SUPER_ADMIN")) {
            where.userId = userId;
        }

        //  search filter
        if (search) {
            where.OR = [
                { firstName: { contains: String(search), mode: "insensitive" } },
                { lastName: { contains: String(search), mode: "insensitive" } },
                { designation: { contains: String(search), mode: "insensitive" } },
                { employeeCode: { contains: String(search), mode: "insensitive" } },
                {
                    user: {
                        email: { contains: String(search), mode: "insensitive" }
                    }
                }
            ];
        }
        //  role filter
        if (role) {
            where.user = {
                roles: {
                    some: {
                        id: Number(role),
                    },
                },
            };
        }

        //  department filter
        if (departmentId) {
            where.departmentId = Number(departmentId);
        }

        const employees = await prisma.employee.findMany({
            where,
            include: {
                user: {
                    include: {
                        roles: true,
                    },
                },
                department: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            message: "Employee filtered successfully",
            data: employees,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};