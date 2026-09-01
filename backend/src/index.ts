import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import cors from 'cors'
import { prisma } from "./config/db.js";
import authRouter from "./routes/auth.route.js";
// import { sessionMiddlewere } from "./config/session.js";
import permissionRouter from "./routes/permission.route.js";
import roleRouter from "./routes/Role.route.js";
import employeeRouter from "./routes/employee.route.js";
import checkInRouter from "./routes/checkIn.route.js";
import monthlyRouter from "./routes/monthly.route.js";
import { sessionMiddleware } from "./config/session.js";
import companyRouter from "./routes/company.route.js";
import userRoutes from "./routes/companyuser.routes.js";
import branchRouter from "./routes/branch.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import leaveTypeRoutes from "./routes/leaveType.routes.js";
import leaveRequestRoutes from "./routes/leaveRequest.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import holidayRoutes from "./routes/holiday.routes.js";
import locationRoutes from "./routes/location.routes.js";

dotenv.config();
const app = express();
app.set("trust proxy", 1);
const port = 5000;

 
app.use(cors({
    origin: ['http://localhost:5173',
        "https://hrms-dynamic-project.vercel.app",
        'https://hoppscotch.io'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // parse application/x-www-form-urlencoded

app.use(sessionMiddleware);

app.get("/", (req, res) => {
    res.send("HRMS Backend API is running");
});
app.use('/api/auth', authRouter)
app.use('/api/roles', roleRouter)
app.use('/api/company', companyRouter)
app.use("/api/companyusers", userRoutes);
app.use('/api/branch', branchRouter)
app.use("/api/category", categoryRoutes);
app.use('/api/employee', employeeRouter)
app.use("/api/attendance", attendanceRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/leave-type", leaveTypeRoutes);
app.use("/api/leave-request", leaveRequestRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/location", locationRoutes);

app.use('/permission', permissionRouter)
app.use('/checkin', checkInRouter)
app.use('/monthly-attendance', monthlyRouter)


async function start() {
    try {
        await prisma.$connect();
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.log("Error connecting to database")
    }
}

start();

