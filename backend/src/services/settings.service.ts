import { prisma } from "../config/db.js";

// Get Settings — agar exist nahi karti to default create karo
export const getSettings = async (companyId: string) => {
    let settings = await prisma.companySettings.findUnique({
        where: { companyId },
    });

    if (!settings) {
        settings = await prisma.companySettings.create({
            data: { companyId },
        });
    }

    return settings;
};

// Update Settings
export const updateSettings = async (
    companyId: string,
    data: {
        lateMarkHour?: number;
        lateMarkMinute?: number;
        halfDayHours?: number;
        defaultGeoRadius?: number;
        weekOffDays?: number[];
    }
) => {
    // Agar exist nahi karti to create karo, warna update
    const settings = await prisma.companySettings.upsert({
        where: { companyId },
        update: data,
        create: {
            companyId,
            ...data,
        },
    });

    return settings;
};