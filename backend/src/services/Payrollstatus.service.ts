import { prisma } from "../config/db.js";

// ─────────────────────────────────────────────────────────────
// Guard: block recalculation once payroll is Confirmed/Paid
// ─────────────────────────────────────────────────────────────

export const getLockedPayrollIfExists = async (
    userId: string,
    month: number,
    year: number
) => {
    const existing = await prisma.payroll.findUnique({
        where: {
            userId_month_year: { userId, month, year },
        },
    });

    if (existing && existing.status !== "DRAFT") {
        return existing;
    }

    return null;
};

// ─────────────────────────────────────────────────────────────
// Confirm Payroll (Draft -> Confirmed)
// ─────────────────────────────────────────────────────────────

export const confirmPayroll = async (
    userIds: string[],
    month: number,
    year: number
) => {
    const results = await Promise.allSettled(
        userIds.map(async (userId) => {
            await prisma.payroll.update({
                where: {
                    userId_month_year: { userId, month, year },
                },
                data: {
                    status: "CONFIRMED",
                    confirmedAt: new Date(),
                },
            });

            // userId ko result ke saath hi carry karo, baad mein
            // array index [i] se dobara nikalna nahi padega
            return userId;
        })
    );

    // results aur userIds ko saath-saath process karo (index se alag se access nahi)
    const failedIds: string[] = [];
    let confirmedCount = 0;

    results.forEach((result, index) => {
        const userId = userIds[index];

        if (result.status === "fulfilled") {
            confirmedCount++;
        } else if (userId) {
            failedIds.push(userId);
        }
    });

    return {
        confirmedCount,
        failed: failedIds,
    };
};

// ─────────────────────────────────────────────────────────────
// Mark Payroll as Paid (Confirmed -> Paid)
// ─────────────────────────────────────────────────────────────

export const markPayrollAsPaid = async (
    userIds: string[],
    month: number,
    year: number,
    paymentRef?: string
) => {
    const results = await Promise.allSettled(
        userIds.map(async (userId) => {
            const existing = await prisma.payroll.findUnique({
                where: { userId_month_year: { userId, month, year } },
            });

            if (!existing) {
                throw new Error("Payroll record not found");
            }

            if (existing.status !== "CONFIRMED") {
                throw new Error(
                    "Payroll must be Confirmed before it can be marked Paid"
                );
            }

            await prisma.payroll.update({
                where: { userId_month_year: { userId, month, year } },
                data: {
                    status: "PAID",
                    paidAt: new Date(),
                    ...(paymentRef && { paymentRef }),
                },
            });

            return userId;
        })
    );

    const failed: { userId: string; reason: string }[] = [];
    let paidCount = 0;

    results.forEach((result, index) => {
        const userId = userIds[index];
        if (!userId) return;

        if (result.status === "fulfilled") {
            paidCount++;
        } else {
            failed.push({
                userId,
                reason: (result.reason as Error).message,
            });
        }
    });

    return {
        paidCount,
        failed,
    };
};

// ─────────────────────────────────────────────────────────────
// Revert to Draft (undo confirm, e.g. mistake before payment)
// ─────────────────────────────────────────────────────────────

export const revertPayrollToDraft = async (
    userId: string,
    month: number,
    year: number
) => {
    const existing = await prisma.payroll.findUnique({
        where: { userId_month_year: { userId, month, year } },
    });

    if (!existing) {
        throw new Error("Payroll record not found");
    }

    if (existing.status === "PAID") {
        throw new Error("Cannot revert a Paid payroll to Draft");
    }

    return prisma.payroll.update({
        where: { userId_month_year: { userId, month, year } },
        data: {
            status: "DRAFT",
            confirmedAt: null,
        },
    });
};