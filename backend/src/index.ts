import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import cors from 'cors'
import { prisma } from "./config/db.ts";
import authRouter from "./routes/auth.route.ts";
// import { sessionMiddlewere } from "./config/session.ts";
import departmentRouter from "./routes/department.route.ts";
import permissionRouter from "./routes/permission.route.ts";
import roleRouter from "./routes/Role.route.ts";
import employeeRouter from "./routes/employee.route.ts";
import checkInRouter from "./routes/checkIn.route.ts";
import monthlyRouter from "./routes/monthly.route.ts";
import { sessionMiddleware } from "./config/session.ts";
import companyRouter from "./routes/company.route.ts";

dotenv.config();
const app = express();
const port = 5000;


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // parse application/x-www-form-urlencoded

app.use(sessionMiddleware);


app.use('/auth', authRouter)
app.use('/api/roles', roleRouter)
app.use('/api/company', companyRouter)


app.use('/department', departmentRouter)
app.use('/permission', permissionRouter)
app.use('/employee', employeeRouter)
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

