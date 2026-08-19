import { prisma } from "../config/db.js";

// ─────────────────────────────────────────────
// Create Holiday
// ─────────────────────────────────────────────

export const createHoliday = async (
    companyId: string,
    data: {
        name: string;
        date: string;
    }
) => {
    const holidayDate = new Date(data.date);

    if (isNaN(holidayDate.getTime())) {
        throw new Error("Invalid holiday date");
    }

    // Same company mein same date ka holiday already hai ya nahi
    const existing = await prisma.holiday.findFirst({
        where: {
            companyId,
            date: holidayDate,
        },
    });

    if (existing) {
        throw new Error("Holiday already exists for this date");
    }

    const holiday = await prisma.holiday.create({
        data: {
            name: data.name.trim(),
            date: holidayDate,
            companyId,
        },
    });

    return holiday;
};


// ─────────────────────────────────────────────
// Get Holidays
// Active + Inactive
// ─────────────────────────────────────────────

export const getHolidays = async (
    companyId: string | null
) => {
    return await prisma.holiday.findMany({
        where: {
            ...(companyId ? { companyId } : {}),
        },
        orderBy: {
            date: "asc",
        },
    });
};


// ─────────────────────────────────────────────
// Get Active Holidays
// Payroll / Leave validation ke liye
// ─────────────────────────────────────────────

export const getActiveHolidays = async (
    companyId: string
) => {
    return await prisma.holiday.findMany({
        where: {
            companyId,
            isActive: true,
        },
        orderBy: {
            date: "asc",
        },
    });
};


// ─────────────────────────────────────────────
// Update Holiday
// ─────────────────────────────────────────────

export const updateHoliday = async (
    id: string,
    data: {
        name?: string;
        date?: string;
    }
) => {
    const existing = await prisma.holiday.findUnique({
        where: {
            id,
        },
    });

    if (!existing) {
        throw new Error("Holiday not found");
    }

    const updateData: {
        name?: string;
        date?: Date;
    } = {};

    if (data.name !== undefined) {
        updateData.name = data.name.trim();
    }

    if (data.date !== undefined) {
        const holidayDate = new Date(data.date);

        if (isNaN(holidayDate.getTime())) {
            throw new Error("Invalid holiday date");
        }

        updateData.date = holidayDate;
    }

    // Agar date change ho rahi hai to duplicate check
    if (updateData.date) {
        const duplicate = await prisma.holiday.findFirst({
            where: {
                companyId: existing.companyId,
                date: updateData.date,
                NOT: {
                    id,
                },
            },
        });

        if (duplicate) {
            throw new Error(
                "Another holiday already exists for this date"
            );
        }
    }

    return await prisma.holiday.update({
        where: {
            id,
        },
        data: updateData,
    });
};


// ─────────────────────────────────────────────
// Deactivate Holiday
// ─────────────────────────────────────────────

export const deactivateHoliday = async (
    id: string
) => {
    const existing = await prisma.holiday.findUnique({
        where: {
            id,
        },
    });

    if (!existing) {
        throw new Error("Holiday not found");
    }

    await prisma.holiday.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });

    return {
        message: "Holiday deactivated successfully",
    };
};


// ─────────────────────────────────────────────
// Activate Holiday
// ─────────────────────────────────────────────

export const activateHoliday = async (
    id: string
) => {
    const existing = await prisma.holiday.findUnique({
        where: {
            id,
        },
    });

    if (!existing) {
        throw new Error("Holiday not found");
    }

    await prisma.holiday.update({
        where: {
            id,
        },
        data: {
            isActive: true,
        },
    });

    return {
        message: "Holiday activated successfully",
    };
};