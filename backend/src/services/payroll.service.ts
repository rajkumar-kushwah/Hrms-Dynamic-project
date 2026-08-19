import { prisma } from "../config/db.js";

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

    // Example:
    // Sunday = 0
    // Monday = 1
    // ...
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
    //
    // Current month:
    //     Today tak calculate hoga.
    //
    // Previous month:
    //     Pura month calculate hoga.
    //
    // Future month:
    //     Abhi koi day calculate nahi hoga.
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

        calculationEndDate =
            new Date(today);

    }

    // Future month
    else if (
        new Date(
            year,
            month - 1,
            1
        ) > today
    ) {

        calculationEndDate =
            new Date(
                year,
                month - 1,
                0
            );

    }

    // Previous/completed month
    else {

        calculationEndDate =
            new Date(endDate);
    }


    calculationEndDate.setHours(
        23,
        59,
        59,
        999
    );


    // ─────────────────────────────────────────
    // 5. Calculate Elapsed Calendar Days
    //
    // Example:
    // August 19 ko:
    //
    // 1 Aug → 19 Aug = 19 days
    //
    // 23 & 30 Aug future hain
    // isliye count nahi honge.
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
    //
    // Sirf calculation period ke andar
    // company holidays lenge.
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
    // 7. Count Week-Off Days
    //
    // Sunday/week-off paid hai.
    //
    // Sirf calculation period ke andar
    // ke Sunday count honge.
    // ─────────────────────────────────────────

    let weekOffCount = 0;


    // ─────────────────────────────────────────
    // 8. Count Company Holiday Days
    //
    // Holiday agar Sunday/week-off par hai
    // to duplicate holiday nahi count hoga.
    // ─────────────────────────────────────────

    let holidayDays = 0;


    // ─────────────────────────────────────────
    // 9. Actual Working Days
    //
    // Calendar Days
    // - Week Off
    // - Company Holiday
    // = Actual Working Days
    // ─────────────────────────────────────────

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


        // ─────────────────────────────
        // Week Off
        // ─────────────────────────────

        if (
            weekOffDays.includes(
                dayOfWeek
            )
        ) {

            weekOffCount++;

        }

        // ─────────────────────────────
        // Company Holiday
        //
        // Week-off par holiday ko
        // separate count nahi karenge.
        // ─────────────────────────────

        else if (
            holidayDates.has(
                dateKey
            )
        ) {

            holidayDays++;

        }

        // ─────────────────────────────
        // Normal Working Day
        // ─────────────────────────────

        else {

            totalWorkingDays++;
        }


        loopDate.setDate(
            loopDate.getDate() + 1
        );
    }


    // ─────────────────────────────────────────
    // 10. Attendance
    // ─────────────────────────────────────────

    const attendanceRecords =
        await prisma.attendance.findMany({
            where: {
                userId,

                date: {
                    gte: startDate,
                    lte: calculationEndDate,
                },

                punchInTime: {
                    not: null,
                },
            },
        });


    // ─────────────────────────────────────────
    // 11. Attendance Map
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


        // Duplicate attendance avoid
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
    // 12. Present / Half Day
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


        // Company Holiday par attendance
        // normal working attendance nahi.
        if (
            holidayDates.has(key)
        ) {
            continue;
        }


        // Week Off par attendance
        // normal working attendance nahi.
        if (
            weekOffDays.includes(
                attendanceDate.getDay()
            )
        ) {
            continue;
        }


        if (
            attendance.status ===
                "Present" ||
            attendance.status ===
                "Late"
        ) {

            presentDays++;

        }


        if (
            attendance.status ===
            "Half-day"
        ) {

            halfDays++;

        }
    }


    // ─────────────────────────────────────────
    // 13. Approved Leaves
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
    // 14. Paid / Unpaid Leave
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


            // ─────────────────────────
            // Week Off
            //
            // Already paid hai.
            // Leave mein count nahi hoga.
            // ─────────────────────────

            if (
                weekOffDays.includes(
                    dayOfWeek
                )
            ) {

                continue;
            }


            // ─────────────────────────
            // Company Holiday
            //
            // Already paid hai.
            // Leave mein count nahi hoga.
            // ─────────────────────────

            if (
                holidayDates.has(
                    dateKey
                )
            ) {

                continue;
            }


            // ─────────────────────────
            // Already Present
            //
            // Leave count nahi hogi.
            // ─────────────────────────

            if (
                attendanceMap.has(
                    dateKey
                )
            ) {

                continue;
            }


            // ─────────────────────────
            // Paid / Unpaid Leave
            // ─────────────────────────

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
    // 15. Prevent Duplicate Days
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
    // 16. Absent Days
    //
    // Sirf actual working days mein
    // absent count hoga.
    //
    // Sunday = absent nahi
    // Company Holiday = absent nahi
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
    // 17. Salary Calculation
    //
    // IMPORTANT:
    //
    // Current month:
    //     Sirf elapsed days tak salary.
    //
    // Example:
    //     August 19
    //
    //     Total elapsed = 19 days
    //
    //     Sunday = 3
    //
    //     23 & 30 August future hain,
    //     isliye count nahi honge.
    //
    // Sunday = PAID
    // Company Holiday = PAID
    //
    // ─────────────────────────────────────────

    const grossSalary =
        user.grossSalary;


    // Monthly salary ko poore month ke
    // calendar days se divide karenge.
    //
    // Example:
    // August = 31 days
    // Gross = ₹31,000
    //
    // Per day = ₹1,000

    const perDaySalary =
        totalDaysInMonth > 0
            ? grossSalary /
              totalDaysInMonth
            : 0;


    // ─────────────────────────────────────────
    // 18. Earned Salary
    //
    // Abhi tak jitne calendar days aaye hain
    // unki salary.
    //
    // Isme Sunday + company holiday
    // already included hain.
    // ─────────────────────────────────────────

    const earnedSalary =
        elapsedCalendarDays *
        perDaySalary;


    // ─────────────────────────────────────────
    // 19. Half Day Deduction
    // ─────────────────────────────────────────

    const halfDayDeduction =
        halfDays * 0.5;


    // ─────────────────────────────────────────
    // 20. Total Unpaid Days
    // ─────────────────────────────────────────

    const totalUnpaidDays =
        unpaidLeaveDays +
        absentDays +
        halfDayDeduction;


    // ─────────────────────────────────────────
    // 21. Deduction Amount
    // ─────────────────────────────────────────

    const deductionAmount =
        totalUnpaidDays *
        perDaySalary;


    // ─────────────────────────────────────────
    // 22. Net Salary
    //
    // Earned Salary
    // - Unpaid/Absent/Half-day deduction
    // ─────────────────────────────────────────

    const netSalary =
        Math.max(
            earnedSalary -
            deductionAmount,
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


        // ─────────────────────────────
        // Date Information
        // ─────────────────────────────

        totalDaysInMonth,

        elapsedCalendarDays,


        calculationStartDate:
            getDateKey(startDate),

        calculationEndDate:
            getDateKey(
                calculationEndDate
            ),


        // ─────────────────────────────
        // Week Off / Holiday
        // ─────────────────────────────

        weekOffDays,

        weekOffCount,

        holidayDays: Number(holidayDays || 0),


        // ─────────────────────────────
        // Working Days
        // ─────────────────────────────

        totalWorkingDays,

        presentDays,

        halfDays,


        // ─────────────────────────────
        // Leaves
        // ─────────────────────────────

        paidLeaveDays,

        unpaidLeaveDays,

        absentDays,


        // ─────────────────────────────
        // Salary
        // ─────────────────────────────

        payableDays:
            elapsedCalendarDays,

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

        const employees =
            await prisma.user.findMany({
                where: {
                    companyId,

                    isActive: true,

                    role: {
                        name: {
                            notIn: [
                                "company_admin",
                                "super_admin",
                            ],
                        },
                    },
                },

                select: {
                    id: true,
                },
            });

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