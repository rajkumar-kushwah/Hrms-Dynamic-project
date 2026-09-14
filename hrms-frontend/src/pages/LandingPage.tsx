import { ArrowRight, CalendarDays, CircleDollarSign, ShieldCheck, Users, Clock3, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Light_BG from "../assets/Light_BG.png";

const features = [
    {
        icon: Users,
        title: "Employee Management",
        description: "Manage employee profiles and company information easily.",
    },
    {
        icon: Clock3,
        title: "Attendance",
        description: "Track employee attendance and daily punch-in and punch-out.",
    },
    {
        icon: CalendarDays,
        title: "Leave Management",
        description: "Manage leave requests, approvals and leave balances.",
    },
    {
        icon: CircleDollarSign,
        title: "Payroll",
        description: "Manage salaries, deductions and monthly payroll.",
    },
    {
        icon: Building2,
        title: "Branches",
        description: "Manage company branches and their locations.",
    },
    {
        icon: ShieldCheck,
        title: "Roles & Permissions",
        description: "Control access with role-based permissions.",
    },
];

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <img
                            src={Light_BG}
                            alt="Dynamic HRMS Logo"
                            className="h-12 w-auto object-contain"
                        />

                        <span className="text-2xl font-bold text-[var(--themePrimary)]">
                            Dynamic HRMS
                        </span>
                    </div>

                    {/* Login */}
                    <Button
                        onClick={() => (window.location.href = "/signin")}
                        className="bg-[var(--themePrimary)] px-6 hover:opacity-90"
                    >
                        Login
                    </Button>

                </div>
            </header>

            {/* Hero */}
            <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
                <div>
                    <p className="mb-4 font-medium text-[var(--themePrimary)]">
                        HUMAN RESOURCE MANAGEMENT SYSTEM
                    </p>

                    <h2 className="text-4xl font-bold leading-tight md:text-6xl">
                        Manage Your Workforce
                        <span className="block text-[var(--themePrimary)]">
                            Smarter & Simpler
                        </span>
                    </h2>

                    <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                        Manage employees, attendance, leave, payroll and company
                        operations from one powerful HR management platform.
                    </p>

                    <div className="mt-8 flex gap-4">
                        <Button
                            size="lg"
                            onClick={() => window.location.href = "/signin"}
                            className="bg-[var(--themePrimary)] hover:opacity-90"
                        >
                            Login to Dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="rounded-2xl border bg-card p-6 shadow-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-semibold">HRMS Dashboard</h3>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                            Overview
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border p-5">
                            <p className="text-sm text-muted-foreground">Employees</p>
                            <p className="mt-2 text-3xl font-bold">120</p>
                        </div>

                        <div className="rounded-xl border p-5">
                            <p className="text-sm text-muted-foreground">Attendance</p>
                            <p className="mt-2 text-3xl font-bold">94%</p>
                        </div>

                        <div className="rounded-xl border p-5">
                            <p className="text-sm text-muted-foreground">Leave Requests</p>
                            <p className="mt-2 text-3xl font-bold">08</p>
                        </div>

                        <div className="rounded-xl border p-5">
                            <p className="text-sm text-muted-foreground">Payroll</p>
                            <p className="mt-2 text-3xl font-bold">₹2.4L</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-muted/40 px-6 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold md:text-4xl">
                            Everything You Need to Manage HR
                        </h2>

                        <p className="mt-4 text-muted-foreground">
                            Powerful features designed to simplify everyday HR operations.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <div
                                    key={feature.title}
                                    className="rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--themePrimary)]/10 text-[var(--themePrimary)]">
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    <h3 className="text-lg font-semibold">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="px-6 py-20 text-center">
                <h2 className="text-3xl font-bold">
                    Ready to manage your workforce?
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                    Access your HRMS dashboard and manage your organization's
                    operations from one place.
                </p>

                <Button
                    size="lg"
                    onClick={() => window.location.href = "/signin"}
                    className="mt-8 bg-[var(--themePrimary)] hover:opacity-90"
                >
                    Go to Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </section>

            {/* Footer */}
            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                © 2026 Dynamic HRMS. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;