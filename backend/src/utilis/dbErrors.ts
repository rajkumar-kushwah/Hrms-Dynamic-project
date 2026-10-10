import type { Request, Response } from "express";
import { prisma } from "../config/db.js";

// ─────────────────────────────────────────────────────────────
// Database unavailable detection
// ─────────────────────────────────────────────────────────────
// Prisma / the pg driver surface connection problems in a few different
// shapes depending on version, so we check codes AND message text.
// Use this only inside catch blocks around database calls.
// ─────────────────────────────────────────────────────────────

const DB_DOWN_CODES = new Set([
    "P1001", // can't reach database server
    "P1002", // database server timed out
    "P1008", // operation timed out
    "P1017", // server closed the connection
    "P2024", // timed out fetching a connection from the pool
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEDOUT",
    "ECONNRESET",
    "57P01", // admin shutdown
    "28P01", // password authentication failed (credentials rotated / DB recreated)
    "3D000", // database does not exist (DB deleted)
]);

const DB_DOWN_MESSAGES = [
    "can't reach database server",
    "connection terminated",
    "connection refused",
    "server closed the connection",
    "terminating connection",
    "password authentication failed",
    "timed out",
];

export const isDatabaseUnavailable = (error: unknown): boolean => {
    const e = error as any;

    if (e?.name === "PrismaClientInitializationError") {
        return true;
    }

    const codes = [e?.code, e?.cause?.code, e?.meta?.code, e?.originalCode]
        .filter(Boolean)
        .map(String);

    if (codes.some((code) => DB_DOWN_CODES.has(code))) {
        return true;
    }

    const message = String(e?.message ?? "").toLowerCase();
    return DB_DOWN_MESSAGES.some((text) => message.includes(text));
};

// ─────────────────────────────────────────────────────────────
// Clean 503 response — no Prisma internals leak to the user
// ─────────────────────────────────────────────────────────────

export const sendDatabaseUnavailable = (res: Response) =>
    res.status(503).json({
        success: false,
        code: "SERVICE_UNAVAILABLE",
        message: "Service is temporarily unavailable. Please try again in a few minutes.",
    });

// ─────────────────────────────────────────────────────────────
// GET /health — for uptime monitors and for checking the DB yourself
// ─────────────────────────────────────────────────────────────

export const healthCheck = async (_req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        return res.status(200).json({
            status: "ok",
            database: "up",
        });
    } catch (error) {
        console.error("Health check failed:", error);

        return res.status(503).json({
            status: "degraded",
            database: "down",
            message:
                "Database connection is unavailable. Please try again later.",
        });
    }
};