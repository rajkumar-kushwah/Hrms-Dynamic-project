import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet, useLocation } from "react-router-dom";

// { children }: { children: React.ReactNode }
export default function layout() {
    const location = useLocation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case "/dashboard":
                return "Dashboard";
            case "/attendance/live":
                return "Live Attendance";
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
            case "/attendance/list":
                return "Attendance List";
            case "/settings":
                return "Settings";
            case "/geo-fencing":
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

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full p-2 ">
                <AppSidebar />

                <main className="flex-1 p-3">

                    <SidebarTrigger className="-ml-1 cursor-pointer" />
                    <h1 className=" text-base font-medium">
                        {getPageTitle()}
                    </h1>

                    {/* {children} */}
                    <Outlet />
                </main>
            </div>
        </SidebarProvider>
    )
}



