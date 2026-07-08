import { prisma } from "../config/db.ts";
import { isWithinGeoFence, calculateDistance } from "../utilis/geoFencing.ts";

// ─── Punch In ─────────────────────────────
export const punchIn = async (
    userId: string,
    companyId: string,
    data: {
        latitude: number;
        longitude: number;
    }
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { branch: true }
    });

    if (!user) throw new Error("Employee not found");
    if (!user.branchId || !user.branch) throw new Error("No branch assigned to you");

    const branch = user.branch;

    //  Geo Fencing Check
    let isWithinFence = true;
    if (branch.latitude && branch.longitude && branch.geoRadius) {
        isWithinFence = isWithinGeoFence(
            data.latitude,
            data.longitude,
            branch.latitude,
            branch.longitude,
            branch.geoRadius
        );
    }

    //  Aaj ki date (sirf date, time nahi)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    //  Already punch in kiya hai aaj?
    const existing = await prisma.attendance.findUnique({
        where: {
            userId_date: { userId, date: today }
        }
    });

    if (existing && existing.punchInTime) {
        throw new Error("You have already punched in today");
    }

    const now = new Date();

    //  Late check (example: 10:15 AM cutoff)
    const cutoffHour = 10;
    const cutoffMinute = 15;
    const isLate = now.getHours() > cutoffHour ||
        (now.getHours() === cutoffHour && now.getMinutes() > cutoffMinute);

    const attendance = await prisma.attendance.upsert({
        where: {
            userId_date: { userId, date: today }
        },
        update: {
            punchInTime: now,
            punchInLat: data.latitude,
            punchInLng: data.longitude,
            isWithinGeoFence: isWithinFence,
            status: isLate ? "Late" : "Present",
        },
        create: {
            userId,
            companyId,
            branchId: user.branchId,
            date: today,
            punchInTime: now,
            punchInLat: data.latitude,
            punchInLng: data.longitude,
            isWithinGeoFence: isWithinFence,
            status: isLate ? "Late" : "Present",
        }
    });

    return {
        attendance,
        isWithinFence,
        message: isWithinFence
            ? "Punched in successfully"
            : "Punched in — but you are outside the branch location",
    };
};

// ─── Punch Out ────────────────────────────
export const punchOut = async (
    userId: string,
    data: {
        latitude: number;
        longitude: number;
    }
) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
        where: { userId_date: { userId, date: today } }
    });

    if (!attendance || !attendance.punchInTime) {
        throw new Error("You haven't punched in today");
    }

    if (attendance.punchOutTime) {
        throw new Error("You have already punched out today");
    }

    const now = new Date();

    //  Working hours calculate karo
    const workingHours =
        (now.getTime() - attendance.punchInTime.getTime()) / (1000 * 60 * 60);

    //  Half-day check (< 4 hours)
    let status = attendance.status;
    if (workingHours < 4) {
        status = "Half-day";
    }

    const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
            punchOutTime: now,
            punchOutLat: data.latitude,
            punchOutLng: data.longitude,
            workingHours: parseFloat(workingHours.toFixed(2)),
            status,
        }
    });

    return { attendance: updated, message: "Punched out successfully" };
};

// ─── Today's Attendance Status ───────────
export const getTodayAttendance = async (userId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.attendance.findUnique({
        where: { userId_date: { userId, date: today } }
    });
};

// ─── Get My Attendance History ───────────
export const getMyAttendance = async (
    userId: string,
    month?: number,
    year?: number
) => {
    const targetMonth = month ?? new Date().getMonth() + 1;
    const targetYear = year ?? new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    return await prisma.attendance.findMany({
        where: {
            userId,
            date: { gte: startDate, lte: endDate }
        },
        orderBy: { date: "desc" }
    });
};

// ─── Get All Employees Attendance (Admin) ──
export const getAllAttendance = async (
    companyId: string | null,
    date?: string
) => {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    return await prisma.attendance.findMany({
        where: {
            // ...(companyId ? { companyId } : { companyId: { not: null } }),
               ...(companyId && { companyId }),
            date: targetDate,
        },
        include: {
            user: {
                select: { id: true, name: true, employeeCode: true, designation: true }
            },
            branch: {
                select: { id: true, name: true }
            }
        },
        orderBy: { punchInTime: "desc" }
    });
};