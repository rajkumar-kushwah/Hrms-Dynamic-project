import { prisma } from "../config/db.js";
import { isWithinGeoFence, calculateDistance } from "../utilis/geoFencing.js";

//  Helper — Settings lo (default fallback ke saath)
const getCompanySettings = async (companyId: string) => {
    let settings = await prisma.companySettings.findUnique({
        where: { companyId },
    });

    if (!settings) {
        // Agar settings nahi bani, default create karo
        settings = await prisma.companySettings.create({
            data: { companyId },
        });
    }

    return settings;
};

// ─── Punch In ─────────────────────────────
export const punchIn = async (
    userId: string,
    companyId: string,
    data: { latitude: number; longitude: number; }
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { branch: true }
    });

    if (!user) throw new Error("Employee not found");
    if (!user.branchId || !user.branch) throw new Error("No branch assigned to you");

    const branch = user.branch;

    //  Settings lo
    const settings = await getCompanySettings(companyId);

    let isWithinFence = true;
    if (branch.latitude && branch.longitude && branch.geoRadius) {
        isWithinFence = isWithinGeoFence(
            data.latitude, data.longitude,
            branch.latitude, branch.longitude,
            branch.geoRadius
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
        where: { userId_date: { userId, date: today } }
    });

    if (existing && existing.punchInTime) {
        throw new Error("You have already punched in today");
    }

    const now = new Date();

    //  Settings se cutoff lo
    const cutoffHour = settings.lateMarkHour;
    const cutoffMinute = settings.lateMarkMinute;
    const isLate = now.getHours() > cutoffHour ||
        (now.getHours() === cutoffHour && now.getMinutes() > cutoffMinute);

    const attendance = await prisma.attendance.upsert({
        where: { userId_date: { userId, date: today } },
        update: {
            punchInTime: now,
            punchInLat: data.latitude,
            punchInLng: data.longitude,
            isWithinGeoFence: isWithinFence,
            status: isLate ? "Late" : "Present",
        },
        create: {
            userId, companyId, branchId: user.branchId, date: today,
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
    companyId: string, //  Naya parameter add kiya
    data: { latitude: number; longitude: number; }
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

    //  Settings lo
    const settings = await getCompanySettings(companyId);

    const now = new Date();
    const workingHours =
        (now.getTime() - attendance.punchInTime.getTime()) / (1000 * 60 * 60);

    //  Settings se half-day threshold lo
    let status = attendance.status;
    if (workingHours < settings.halfDayHours) {
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
    companyId: string,
    month?: number,
    year?: number
) => {
    const settings = await getCompanySettings(companyId);
    const weekOffDays = settings.weekOffDays;

    const targetMonth = month ?? new Date().getMonth() + 1;
    const targetYear = year ?? new Date().getFullYear();

    //  Purana logic wapas — local Date, but simple hours reset
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(targetYear, targetMonth, 0);
    endDate.setHours(0, 0, 0, 0); //  23:59:59 nahi — 0,0,0,0 taaki loop clean rahe

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = await prisma.attendance.findMany({
        where: {
            userId,
            date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "asc" },
    });

    // ✅ Key banane ka tarika — sirf Y-M-D use karo, local se
    const getDateKey = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    const attendanceMap = new Map(
        records.map((record) => [getDateKey(new Date(record.date)), record])
    );

    const result: any[] = [];
    const todayKey = getDateKey(today);

    for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
    ) {
        const currentDate = new Date(d);
        const key = getDateKey(currentDate);

        //  Future date hai — turant skip karo, sabse pehle check karo
        if (key > todayKey) {
            continue;
        }

        const isWeekOff = weekOffDays.includes(currentDate.getDay());
        const attendance = attendanceMap.get(key);

        if (attendance) {
            result.push(attendance);
            continue;
        }

        if (isWeekOff) {
            result.push({
                id: `weekoff-${key}`,
                userId, companyId, branchId: null,
                date: new Date(currentDate),
                punchInTime: null, punchOutTime: null,
                punchInLat: null, punchInLng: null,
                punchOutLat: null, punchOutLng: null,
                workingHours: 0, isWithinGeoFence: false,
                status: "Week Off",
                createdAt: new Date(), updatedAt: new Date(),
            });
            continue;
        }

        result.push({
            id: `absent-${key}`,
            userId, companyId, branchId: null,
            date: new Date(currentDate),
            punchInTime: null, punchOutTime: null,
            punchInLat: null, punchInLng: null,
            punchOutLat: null, punchOutLng: null,
            workingHours: 0, isWithinGeoFence: false,
            status: "Absent",
            createdAt: new Date(), updatedAt: new Date(),
        });
    }

    return result.reverse();
};

// ─── Get All Employees Attendance (Admin) ──
export const getAllAttendance = async (
    companyId: string | null,
    date?: string
) => {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    //  Settings lo (agar companyId hai)
    let weekOffDays = [0]; // default Sunday
    if (companyId) {
        const settings = await getCompanySettings(companyId);
        weekOffDays = settings.weekOffDays;
    }

    const employees = await prisma.user.findMany({
        where: {
            ...(companyId ? { companyId } : { companyId: { not: null } }),
            isActive: true,
            role: { name: { notIn: ["company_admin", "super_admin"] } },
        },
        select: {
            id: true,
            name: true,
            employeeCode: true,
            designation: true,
            branch: { select: { id: true, name: true } },
        }
    });

    const records = await prisma.attendance.findMany({
        where: {
            ...(companyId && { companyId }),
            date: targetDate,
        },
        include: {
            user: { select: { id: true, name: true, employeeCode: true, designation: true } },
            branch: { select: { id: true, name: true } }
        },
    });

    const recordMap = new Map(records.map((record) => [record.userId, record]));

    //  Dynamic week off check (Settings se)
    const isWeekOff = weekOffDays.includes(targetDate.getDay());

    const result = employees.map((employee) => {
        const existing = recordMap.get(employee.id);
        if (existing) return existing;

        return {
            id: `${isWeekOff ? "weekoff" : "absent"}-${employee.id}-${targetDate.toISOString().split("T")[0]}`,
            userId: employee.id,
            companyId,
            branchId: employee.branch?.id ?? null,
            date: targetDate,
            punchInTime: null,
            punchOutTime: null,
            punchInLat: null,
            punchInLng: null,
            punchOutLat: null,
            punchOutLng: null,
            workingHours: 0,
            isWithinGeoFence: false,
            status: isWeekOff ? "Week Off" : "Absent",
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
                id: employee.id,
                name: employee.name,
                employeeCode: employee.employeeCode,
                designation: employee.designation,
            },
            branch: employee.branch
        };
    });

    return result;
};

// get live attendance
export const getLiveAttendance = async (companyId: string | null) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.attendance.findMany({
        where: {
            ...(companyId ? { companyId } : {}),
            date: today,
        },
        include: {
            user: { select: { id: true, name: true, employeeCode: true, designation: true } },
            branch: { select: { id: true, name: true } }
        },
        orderBy: { punchInTime: "desc" }
    })
}

export const getEmployeeAttendance = async (
    userId: string,
    companyId: string, //  Naya parameter add kiya
    month?: number,
    year?: number
) => {
    return await getMyAttendance(userId, companyId, month, year);
};

export const getEmployeeBasicInfo = async (userId: string) => {
    const employee = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true, name: true, email: true,
            employeeCode: true, designation: true,
            branch: { select: { id: true, name: true } },
        }
    });
    if (!employee) throw new Error("Employee not found");
    return employee;
};