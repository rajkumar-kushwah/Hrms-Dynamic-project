import { prisma } from "../config/db.js";


// ─────────────────────────────────────────────────────────────
// Helper: Normalize Role Name
// ─────────────────────────────────────────────────────────────

const normalizeRoleName = (role?: string | null) => {
    return role
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_");
};


// ─────────────────────────────────────────────────────────────
// Helper: Date Key
// ─────────────────────────────────────────────────────────────

const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;
};


// ─────────────────────────────────────────────────────────────
// Calculate Employee Payroll
// ─────────────────────────────────────────────────────────────

const calculateEmployeePayroll = async (
    userId: string,
    companyId: string,
    month: number,
    year: number
) => {

    // ─────────────────────────────────────────
    // 1. Employee
    // ─────────────────────────────────────────

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },

        select: {
            grossSalary: true,
            name: true,
            employeeCode: true,
            designation: true,
            isActive: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (
        user.grossSalary === null ||
        user.grossSalary === undefined
    ) {
        throw new Error("Gross salary not found");
    }

    if (!user.isActive) {
        throw new Error("Employee is inactive");
    }


    // ─────────────────────────────────────────
    // 2. Company Settings
    // ─────────────────────────────────────────

    const companySettings =
        await prisma.companySettings.findUnique({
            where: {
                companyId,
            },
        });

    if (!companySettings) {
        throw new Error("Company settings not found");
    }


    // Sunday = 0
    // Monday = 1
    // Tuesday = 2
    // Wednesday = 3
    // Thursday = 4
    // Friday = 5
    // Saturday = 6

    const weekOffDays =
        companySettings.weekOffDays ?? [0];


    // ─────────────────────────────────────────
    // 3. Month Date Range
    // ─────────────────────────────────────────

    const startDate = new Date(
        year,
        month - 1,
        1
    );

    startDate.setHours(
        0,
        0,
        0,
        0
    );


    const endDate = new Date(
        year,
        month,
        0
    );

    endDate.setHours(
        23,
        59,
        59,
        999
    );


    const totalDaysInMonth =
        new Date(
            year,
            month,
            0
        ).getDate();


    // ─────────────────────────────────────────
    // 4. Calculation End Date
    // ─────────────────────────────────────────

    const today = new Date();

    today.setHours(
        23,
        59,
        59,
        999
    );


    let calculationEndDate: Date;


    // Current month
    if (
        year === today.getFullYear() &&
        month === today.getMonth() + 1
    ) {
        calculationEndDate = new Date(today);
    }

    // Future month
    else if (
        new Date(
            year,
            month - 1,
            1
        ) > today
    ) {
        calculationEndDate = new Date(
            year,
            month - 1,
            0
        );
    }

    // Previous/completed month
    else {
        calculationEndDate = new Date(endDate);
    }


    calculationEndDate.setHours(
        23,
        59,
        59,
        999
    );


    // ─────────────────────────────────────────
    // 5. Elapsed Calendar Days
    // ─────────────────────────────────────────

    let elapsedCalendarDays = 0;


    if (
        calculationEndDate >= startDate
    ) {
        const currentDate =
            new Date(startDate);

        while (
            currentDate <=
            calculationEndDate
        ) {
            elapsedCalendarDays++;

            currentDate.setDate(
                currentDate.getDate() + 1
            );
        }
    }


    // ─────────────────────────────────────────
    // 6. Company Holidays
    // ─────────────────────────────────────────

    const holidays =
        await prisma.holiday.findMany({
            where: {
                companyId,

                isActive: true,

                date: {
                    gte: startDate,
                    lte: calculationEndDate,
                },
            },

            select: {
                date: true,
                name: true,
            },
        });


    const holidayDates =
        new Set(
            holidays.map(
                (holiday) =>
                    getDateKey(
                        new Date(
                            holiday.date
                        )
                    )
            )
        );


    // ─────────────────────────────────────────
    // 7. Count Week-Off / Working / Holidays
    // ─────────────────────────────────────────

    let weekOffCount = 0;
    let holidayDays = 0;
    let totalWorkingDays = 0;


    const loopDate =
        new Date(startDate);


    while (
        loopDate <= calculationEndDate
    ) {
        const dayOfWeek =
            loopDate.getDay();

        const dateKey =
            getDateKey(loopDate);


        // Week Off
        if (
            weekOffDays.includes(
                dayOfWeek
            )
        ) {
            weekOffCount++;
        }

        // Company Holiday
        else if (
            holidayDates.has(
                dateKey
            )
        ) {
            holidayDays++;
        }

        // Normal Working Day
        else {
            totalWorkingDays++;
        }


        loopDate.setDate(
            loopDate.getDate() + 1
        );
    }


    // ─────────────────────────────────────────
    // 8. Attendance Check Start Date
    // ─────────────────────────────────────────

    const attendanceCheckStartDate =
        new Date(startDate);

    const startDay =
        attendanceCheckStartDate.getDay();

    const daysSinceMonday =
        startDay === 0
            ? 6
            : startDay - 1;

    attendanceCheckStartDate.setDate(
        attendanceCheckStartDate.getDate() -
        daysSinceMonday
    );

    attendanceCheckStartDate.setHours(
        0,
        0,
        0,
        0
    );


    const attendanceRecords =
        await prisma.attendance.findMany({
            where: {
                userId,

                date: {
                    gte: attendanceCheckStartDate,
                    lte: calculationEndDate,
                },

                punchInTime: {
                    not: null,
                },
            },
        });


    // ─────────────────────────────────────────
    // 9. Attendance Map
    // ─────────────────────────────────────────

    const attendanceMap =
        new Map<
            string,
            typeof attendanceRecords[0]
        >();


    for (
        const attendance
        of attendanceRecords
    ) {
        const key =
            getDateKey(
                new Date(
                    attendance.date
                )
            );


        if (
            !attendanceMap.has(key)
        ) {
            attendanceMap.set(
                key,
                attendance
            );
        }
    }


    // ─────────────────────────────────────────
    // 10. Present / Half Day
    // ─────────────────────────────────────────

    let presentDays = 0;
    let halfDays = 0;


    for (
        const attendance
        of attendanceRecords
    ) {
        const attendanceDate =
            new Date(
                attendance.date
            );


        const key =
            getDateKey(
                attendanceDate
            );


        if (
            attendanceDate < startDate ||
            attendanceDate > calculationEndDate
        ) {
            continue;
        }


        // Company Holiday
        if (
            holidayDates.has(key)
        ) {
            continue;
        }


        // Week Off
        if (
            weekOffDays.includes(
                attendanceDate.getDay()
            )
        ) {
            continue;
        }


        if (
            attendance.status === "Present" ||
            attendance.status === "Late"
        ) {
            presentDays++;
        }


        if (
            attendance.status === "Half-day"
        ) {
            halfDays++;
        }
    }


    // ─────────────────────────────────────────
    // 11. Weekly-Off Eligibility
    // ─────────────────────────────────────────

    let paidWeekOffDays = 0;
    let unpaidWeekOffDays = 0;


    const weekOffEligibilityMap =
        new Map<string, boolean>();


    const weekOffCheckDate =
        new Date(startDate);


    while (
        weekOffCheckDate <= calculationEndDate
    ) {
        const dayOfWeek =
            weekOffCheckDate.getDay();

        const currentDateKey =
            getDateKey(
                weekOffCheckDate
            );


        if (
            weekOffDays.includes(
                dayOfWeek
            )
        ) {

            const monday =
                new Date(
                    weekOffCheckDate
                );


            const daysBackToMonday =
                dayOfWeek === 0
                    ? 6
                    : dayOfWeek - 1;


            monday.setDate(
                monday.getDate() -
                daysBackToMonday
            );

            monday.setHours(
                0,
                0,
                0,
                0
            );


            const attendanceCheckEnd =
                new Date(
                    weekOffCheckDate
                );


            attendanceCheckEnd.setDate(
                attendanceCheckEnd.getDate() - 1
            );

            attendanceCheckEnd.setHours(
                23,
                59,
                59,
                999
            );


            let hasAttendanceInWeek = false;


            const attendanceDate =
                new Date(monday);


            while (
                attendanceDate <=
                attendanceCheckEnd
            ) {
                const checkDateKey =
                    getDateKey(
                        attendanceDate
                    );

                const checkDayOfWeek =
                    attendanceDate.getDay();


                if (
                    !weekOffDays.includes(
                        checkDayOfWeek
                    )
                ) {

                    const isHoliday =
                        holidayDates.has(
                            checkDateKey
                        );


                    if (!isHoliday) {
                        const attendance =
                            attendanceMap.get(
                                checkDateKey
                            );


                        if (
                            attendance &&
                            (
                                attendance.status ===
                                    "Present" ||
                                attendance.status ===
                                    "Late" ||
                                attendance.status ===
                                    "Half-day"
                            )
                        ) {
                            hasAttendanceInWeek =
                                true;

                            break;
                        }
                    }
                }


                attendanceDate.setDate(
                    attendanceDate.getDate() + 1
                );
            }


            weekOffEligibilityMap.set(
                currentDateKey,
                hasAttendanceInWeek
            );


            if (
                hasAttendanceInWeek
            ) {
                paidWeekOffDays++;
            } else {
                unpaidWeekOffDays++;
            }
        }


        weekOffCheckDate.setDate(
            weekOffCheckDate.getDate() + 1
        );
    }


    // ─────────────────────────────────────────
    // 12. Approved Leaves
    // ─────────────────────────────────────────

    const approvedLeaves =
        await prisma.leaveRequest.findMany({
            where: {
                userId,

                status: "Approved",

                startDate: {
                    lte: calculationEndDate,
                },

                endDate: {
                    gte: startDate,
                },
            },

            include: {
                leaveType: {
                    select: {
                        isPaid: true,
                        name: true,
                    },
                },
            },
        });


    // ─────────────────────────────────────────
    // 13. Paid / Unpaid Leave
    // ─────────────────────────────────────────

    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;


    for (
        const leave
        of approvedLeaves
    ) {
        const leaveStart =
            new Date(
                Math.max(
                    leave.startDate.getTime(),
                    startDate.getTime()
                )
            );


        const leaveEnd =
            new Date(
                Math.min(
                    leave.endDate.getTime(),
                    calculationEndDate.getTime()
                )
            );


        for (
            let date =
                new Date(leaveStart);

            date <= leaveEnd;

            date.setDate(
                date.getDate() + 1
            )
        ) {
            const dayOfWeek =
                date.getDay();

            const dateKey =
                getDateKey(date);


            // Week Off
            if (
                weekOffDays.includes(
                    dayOfWeek
                )
            ) {
                continue;
            }


            // Company Holiday
            if (
                holidayDates.has(
                    dateKey
                )
            ) {
                continue;
            }


            // Already Present
            if (
                attendanceMap.has(
                    dateKey
                )
            ) {
                continue;
            }


            // Paid / Unpaid Leave
            if (
                leave.leaveType.isPaid
            ) {
                paidLeaveDays++;
            } else {
                unpaidLeaveDays++;
            }
        }
    }


    // ─────────────────────────────────────────
    // 14. Prevent Duplicate Leave Days
    // ─────────────────────────────────────────

    const availableLeaveDays =
        Math.max(
            totalWorkingDays -
            presentDays -
            halfDays,
            0
        );


    paidLeaveDays =
        Math.min(
            paidLeaveDays,
            availableLeaveDays
        );


    const remainingDays =
        Math.max(
            totalWorkingDays -
            presentDays -
            halfDays -
            paidLeaveDays,
            0
        );


    unpaidLeaveDays =
        Math.min(
            unpaidLeaveDays,
            remainingDays
        );


    // ─────────────────────────────────────────
    // 15. Absent Days
    // ─────────────────────────────────────────

    const accountedDays =
        presentDays +
        halfDays +
        paidLeaveDays +
        unpaidLeaveDays;


    const absentDays =
        Math.max(
            totalWorkingDays -
            accountedDays,
            0
        );


    // ─────────────────────────────────────────
    // 16. Salary Calculation
    // ─────────────────────────────────────────

    const grossSalary =
        user.grossSalary;


    const perDaySalary =
        totalDaysInMonth > 0
            ? grossSalary /
              totalDaysInMonth
            : 0;


    // ─────────────────────────────────────────
    // 17. Earned Salary
    // ─────────────────────────────────────────

    const earnedSalary =
        elapsedCalendarDays *
        perDaySalary;


    // ─────────────────────────────────────────
    // 18. Half Day Deduction
    // ─────────────────────────────────────────

    const halfDayDeduction =
        halfDays * 0.5;


    // ─────────────────────────────────────────
    // 19. Total Unpaid Days
    // ─────────────────────────────────────────

    const totalUnpaidDays =
        unpaidLeaveDays +
        absentDays +
        unpaidWeekOffDays +
        halfDayDeduction;


    // ─────────────────────────────────────────
    // 20. Deduction Amount
    // ─────────────────────────────────────────

    const deductionAmount =
        totalUnpaidDays *
        perDaySalary;


    // ─────────────────────────────────────────
    // 21. Net Salary
    // ─────────────────────────────────────────

    const netSalary =
        Math.max(
            earnedSalary -
            deductionAmount,
            0
        );


    // ─────────────────────────────────────────
    // 22. Payable Days
    // ─────────────────────────────────────────

    const payableDays =
        Math.max(
            elapsedCalendarDays -
            totalUnpaidDays,
            0
        );


    // ─────────────────────────────────────────
    // 23. Return
    // ─────────────────────────────────────────

    return {
        userId,

        user: {
            id: userId,

            name: user.name,

            employeeCode:
                user.employeeCode,

            designation:
                user.designation,
        },

        month,

        year,


        // Date Information

        totalDaysInMonth,

        elapsedCalendarDays,

        calculationStartDate:
            getDateKey(startDate),

        calculationEndDate:
            getDateKey(
                calculationEndDate
            ),


        // Week Off / Holiday

        weekOffDays,

        weekOffCount,

        paidWeekOffDays,

        unpaidWeekOffDays,

        holidayDays:
            Number(
                holidayDays || 0
            ),


        // Working Days

        totalWorkingDays,

        presentDays,

        halfDays,


        // Leaves

        paidLeaveDays,

        unpaidLeaveDays,

        absentDays,


        // Salary

        payableDays,

        grossSalary,

        earnedSalary:
            Number(
                earnedSalary.toFixed(2)
            ),

        perDaySalary:
            Number(
                perDaySalary.toFixed(2)
            ),

        totalUnpaidDays:
            Number(
                totalUnpaidDays.toFixed(2)
            ),

        deductionAmount:
            Number(
                deductionAmount.toFixed(2)
            ),

        netSalary:
            Number(
                netSalary.toFixed(2)
            ),
    };
};


// ─────────────────────────────────────────────────────────────
// Get Payroll Summary
// ─────────────────────────────────────────────────────────────

export const getPayrollSummary =
    async (
        companyId: string | null,
        month: number,
        year: number
    ) => {

        if (!companyId) {
            throw new Error(
                "Company ID is required"
            );
        }


        // ─────────────────────────────────────
        // Get all roles
        // ─────────────────────────────────────

        const roles =
            await prisma.role.findMany({
                select: {
                    id: true,
                    name: true,
                },
            });


        // ─────────────────────────────────────
        // Normalize role names
        // ─────────────────────────────────────

        const excludedRoleIds =
            roles
                .filter((role) => {
                    const normalizedRole =
                        normalizeRoleName(
                            role.name
                        );

                    return (
                        normalizedRole ===
                            "company_admin" ||
                        normalizedRole ===
                            "super_admin"
                    );
                })
                .map(
                    (role) => role.id
                );


        // ─────────────────────────────────────
        // Get Employees
        // ─────────────────────────────────────

        const employees =
            await prisma.user.findMany({
                where: {
                    companyId,

                    isActive: true,

                    ...(excludedRoleIds.length > 0 && {
                        roleId: {
                            notIn:
                                excludedRoleIds,
                        },
                    }),
                },

                select: {
                    id: true,
                },
            });


        // ─────────────────────────────────────
        // Calculate Payroll
        // ─────────────────────────────────────

        const payrollData =
            await Promise.all(
                employees.map(
                    (employee) =>
                        calculateEmployeePayroll(
                            employee.id,
                            companyId,
                            month,
                            year
                        )
                )
            );


        return payrollData;
    };


// ─────────────────────────────────────────────────────────────
// Get Single Employee Payroll Detail
// ─────────────────────────────────────────────────────────────

export const getEmployeePayrollDetail =
    async (
        userId: string,
        companyId: string,
        month: number,
        year: number
    ) => {

        return await calculateEmployeePayroll(
            userId,
            companyId,
            month,
            year
        );
    };


// ─────────────────────────────────────────────────────────────
// Update Employee Salary
// ─────────────────────────────────────────────────────────────

export const updateEmployeeSalary =
    async (
        userId: string,
        grossSalary: number
    ) => {

        const user =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });


        if (!user) {
            throw new Error(
                "Employee not found"
            );
        }


        if (grossSalary < 0) {
            throw new Error(
                "Gross salary cannot be negative"
            );
        }


        return await prisma.user.update({
            where: {
                id: userId,
            },

            data: {
                grossSalary,
            },

            select: {
                id: true,
                name: true,
                grossSalary: true,
            },
        });
    };