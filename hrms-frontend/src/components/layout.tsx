import {
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
    Outlet,
    Link,
    useLocation,
} from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";

export default function Layout() {
    const location = useLocation();
    const { user } = useAuthStore();

    const getRoleName = () => {
        const role = user?.role?.name;

        if (!role) {
            return "User";
        }

        switch (role.toLowerCase()) {
            case "superadmin":
            case "super admin":
                return "Super Admin";

            case "admin":
            case "companyadmin":
            case "company admin":
                return "Admin";

            case "employee":
                return "Employee";

            default:
                return role;
        }
    };

    // ─────────────────────────────────────────
    // Page Title
    // ─────────────────────────────────────────

    const getPageTitle = () => {
        switch (location.pathname) {
            case "/dashboard":
                return "Dashboard";

            case "/attendance/live":
                return "Live Attendance";

            case "/attendance/list":
                return "Attendance List";

            case "/company":
                return "Company";

            case "/branch":
                return "Branch";

            case "/category":
                return "Category";

            case "/check-in":
                return "Check-in/Out";

            case "/employee":
                return "Employee";

            case "/roles":
                return "Role";

            case "/profile":
                return "Profile";

            case "/users":
                return "Users";

            case "/settings":
                return "Settings";

            case "/attendance/geo-fencing":
                return "Geo Fencing";

            case "/leave/policy":
                return "Leave Policy";

            case "/holiday":
                return "Holiday";

            case "/leave/request":
                return "Leave Request";

            case "/leave/approval":
                return "Leave Approval";

            case "/payroll":
                return "Payroll";

            default:
                return "Dashboard";
        }
    };

    // ─────────────────────────────────────────
    // Dynamic Attendance Employee Page
    // ─────────────────────────────────────────

    const isEmployeeAttendance =
        location.pathname.startsWith("/attendance/employee/");

    // ─────────────────────────────────────────
    // Current Page Title
    // ─────────────────────────────────────────

    const pageTitle = isEmployeeAttendance
        ? "Employee Attendance"
        : getPageTitle();

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full p-2">

                {/* ─────────────────────────────
                    Sidebar
                ───────────────────────────── */}

                <AppSidebar />

                {/* ─────────────────────────────
                    Main Content
                ───────────────────────────── */}

                <main className="flex-1 p-3 px-4 space-y-4">

                    {/* Sidebar Trigger + Breadcrumb */}
                    <div className="flex items-center gap-2">

                        {/* Sidebar Toggle */}
                        <SidebarTrigger className="-ml-1 cursor-pointer" />

                        {/* Breadcrumb */}
                        <Breadcrumb>
                            <BreadcrumbList>

                                {/* Dashboard / Role */}
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link to="/dashboard">
                                            {getRoleName()}
                                        </Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>

                                <BreadcrumbSeparator />

                                {/* Employee Attendance */}
                                {isEmployeeAttendance ? (
                                    <>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink asChild>
                                                <Link to="/attendance/list">
                                                    Attendance List
                                                </Link>
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>

                                        <BreadcrumbSeparator />

                                        <BreadcrumbItem>
                                            <BreadcrumbPage>
                                                Employee Attendance
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                ) : (
                                    /* Normal Pages */
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>
                                            {pageTitle}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                )}

                            </BreadcrumbList>
                        </Breadcrumb>

                    </div>

                    <div className="space-y-5">

                        {/* ─────────────────────────
                            Page Title
                        ───────────────────────── */}

                        <h1 className="text-2xl font-medium">
                            {pageTitle}
                        </h1>

                        {/* ─────────────────────────
                            Page Content
                        ───────────────────────── */}

                        <Outlet />

                    </div>

                </main>

            </div>
        </SidebarProvider>
    );
}