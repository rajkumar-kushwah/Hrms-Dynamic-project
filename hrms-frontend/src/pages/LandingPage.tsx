import { ArrowRight, CalendarDays, CircleDollarSign, ShieldCheck, Users, Clock3, Building2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Light_BG from "../assets/Light_BG.png";
import { useTheme } from "@/providers/ThemeContext";

const features = [
    {
        icon: Users,
        number: 1,
        title: "Employee Management",
        description: "Manage employee profiles and company information easily.",
    },
    {
        icon: Clock3,
        number: 2,
        title: "Attendance",
        description: "Track employee attendance and daily punch-in and punch-out.",
    },
    {
        icon: CalendarDays,
        number: 3,
        title: "Leave Management",
        description: "Manage leave requests, approvals and leave balances.",
    },
    {
        icon: CircleDollarSign,
        number: 4,
        title: "Payroll",
        description: "Manage salaries, deductions and monthly payroll.",
    },
    {
        icon: Building2,
        number: 5,
        title: "Branches",
        description: "Manage company branches and their locations.",
    },
    {
        icon: ShieldCheck,
        number: 6,
        title: "Roles & Permissions",
        description: "Control access with role-based permissions.",
    },
];

const LandingPage = () => {
    const { dark, toggleTheme } = useTheme();

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-17 max-w-[1500px] items-center justify-between px-6">

                    {/* Logo */}
                    <div
                        onClick={() => (window.location.href = "/")}
                        className="flex items-center gap-4 cursor-pointer">
                        <img
                            src={Light_BG}
                            alt="Dynamic HRMS Logo"
                            className="h-10 w-auto object-contain rounded-lg"
                        />

                        <span className="text-xl font-bold">
                            HRMS
                        </span>
                    </div>
                    <nav className="hidden items-center gap-8 md:flex">
                        <button className="cursor-pointer hover:text-[var(--themePrimary)]" onClick={() => scrollToSection("home")}>
                            Home
                        </button>

                        <button className="cursor-pointer hover:text-[var(--themePrimary)]" onClick={() => scrollToSection("features")}>
                            Features
                        </button>

                        {/* <button onClick={() => scrollToSection("about")}>
                            About
                        </button> */}

                        <button className="cursor-pointer hover:text-[var(--themePrimary)]" onClick={() => scrollToSection("contact")}>
                            Contact
                        </button>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition hover:border-[var(--logo-green)] hover:bg-[var(--logo-green)]/10 cursor-pointer"
                            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {dark ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>

                        <Button
                            onClick={() => (window.location.href = "/signin")}
                            className="group relative overflow-hidden bg-[var(--logo-green)] py-2 px-6 text-black font-medium transition-colors duration-500 before:absolute before:-left-[100%] before:top-1/2 before:z-0 before:h-[250%] before:w-[100%] before:-translate-y-1/2 before:rounded-full before:bg-[var(--logo-green)] before:transition-all before:duration-700 before:ease-in-out hover:text-black hover:before:left-0 active:scale-95  cursor-pointer"

                        >
                            <span className="relative z-10">
                                Login
                            </span>
                        </Button>
                    </div>

                </div>
            </header>

            {/* Hero */}
            <section id="home" className="mx-auto grid max-w-10xl items-center gap-12 px-6 py-12 lg:grid-cols-2">
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
                            className=" group relative overflow-hidden bg-[var(--themePrimary)] py-5 text-base font-medium text-white transition-colors duration-500 before:absolute before:-left-[100%] before:top-1/2 before:z-0 before:h-[250%] before:w-[100%] before:-translate-y-1/2 before:rounded-full before:bg-[var(--logo-green)] before:transition-all before:duration-700 before:ease-in-out hover:text-black hover:before:left-0 active:scale-95  cursor-pointer"
                        >
                            <span className="relative z-10">
                                Login to Dashboard
                            </span>
                            <ArrowRight className="ml-2 h-4 w-4 transition-all duration-300 group-hover:translate-x-1 " />
                        </Button>
                    </div>
                </div>

                {/* Dashboard Preview */}

                <div className="relative flex items-center justify-center py-8 lg:py-12">

                    {/* Top-left background glow */}
                    <div className="absolute -left-14 -top-14 h-52 w-52 rounded-full bg-[var(--themePrimary)]/30 blur-3xl" />

                    {/* Right background glow */}
                    <div className="absolute -right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[var(--themePrimary)]/20 blur-3xl" />

                    {/* Dashboard Card */}
                    <div className="relative w-full max-w-xl rotate-[2deg] rounded-[28px] border bg-card p-6 shadow-md">

                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    HRMS Dashboard
                                </h3>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Workforce overview
                                </p>
                            </div>

                            <span className="rounded-full bg-[var(--themePrimary)]/10 px-3 py-1.5 text-xs font-medium text-[var(--themePrimary)]">
                                Overview
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">

                            {/* Employees */}
                            <div className="rounded-2xl border bg-background p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Employees
                                    </p>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                                        <Users className="h-5 w-5" />
                                    </div>
                                </div>

                                <p className="text-3xl font-bold">
                                    120
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Active employees
                                </p>
                            </div>

                            {/* Attendance */}
                            <div className="rounded-2xl border bg-background p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Attendance
                                    </p>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
                                        <Clock3 className="h-5 w-5" />
                                    </div>
                                </div>

                                <p className="text-3xl font-bold">
                                    94%
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Today's attendance
                                </p>
                            </div>

                            {/* Leave */}
                            <div className="rounded-2xl border bg-background p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Leave Requests
                                    </p>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                                        <CalendarDays className="h-5 w-5" />
                                    </div>
                                </div>

                                <p className="text-3xl font-bold">
                                    08
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Awaiting approval
                                </p>
                            </div>

                            {/* Payroll */}
                            <div className="rounded-2xl border bg-background p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Payroll
                                    </p>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                                        <CircleDollarSign className="h-5 w-5" />
                                    </div>
                                </div>

                                <p className="text-3xl font-bold">
                                    ₹2.4L
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Monthly payroll
                                </p>
                            </div>

                        </div>

                        {/* Bottom status */}
                        <div className="mt-5 flex items-center justify-between rounded-xl bg-[var(--themePrimary)]/5 px-4 py-3">
                            <div>
                                <p className="text-sm font-medium">
                                    Payroll processed
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    September 2026
                                </p>
                            </div>

                            <span className="rounded-full bg-[var(--themePrimary)]/15 px-3 py-1 text-xs font-medium text-[var(--themePrimary)]">
                                Completed
                            </span>
                        </div>
                    </div>

                    {/* Floating Badge */}
                    <div
                        className="absolute -bottom-3 left-2 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-xl"
                        style={{
                            animation: "floatBadge 3s ease-in-out infinite",
                        }}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--themePrimary)]/10">
                            <ShieldCheck className="h-5 w-5 text-[var(--themePrimary)]" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold">
                                Secure & Reliable
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Your HR data is protected
                            </p>
                        </div>
                    </div>

                    {/* Floating animation */}
                    <style>
                        {`
            @keyframes floatBadge {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-8px);
                }
            }
        `}
                    </style>

                </div>
            </section>

            {/* Features */}
            <section id="features" className="bg-muted/40 dark:bg-[var(--themePrimary)]/5 px-6 py-12">
                <div className="mx-auto max-w-10xl">
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
                                    {/* <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--themePrimary)]/10 text-[var(--themePrimary)]">
                                        <Icon className="h-6 w-6" />
                                    </div> */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--themePrimary)]/10 text-[var(--themePrimary)]">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <span className="font-mono text-sm text-muted-foreground">
                                                0{feature.number}
                                            </span>
                                        </div>
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
            <section className="px-6 py-12 text-center">
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
                    className="group relative overflow-hidden bg-[var(--themePrimary)] py-5 text-base font-medium text-white transition-colors duration-500 before:absolute before:-left-[100%] before:top-1/2 before:z-0 before:h-[250%] before:w-[100%] before:-translate-y-1/2 before:rounded-full before:bg-[var(--logo-green)] before:transition-all before:duration-700 before:ease-in-out hover:text-black hover:before:left-0 active:scale-95 cursor-pointer"
                >
                    <span className="relative z-10">
                        Go to Login
                    </span>
                    <ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
                </Button>
            </section>

            {/* Footer */}
            {/* Footer */}
            <footer id="contact" className="border-t py-8 bg-[var(--themePrimary)]/5">
                <div className="mx-auto max-w-[1500px] px-6">

                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

                        {/* Logo */}
                        <div
                            onClick={() => scrollToSection("home")}
                            className="group flex items-center gap-3 cursor-pointer"
                        >
                            <img
                                src={Light_BG}
                                alt="Dynamic HRMS Logo"
                                className="h-10 w-auto object-contain rounded-lg transition-all duration-300 group-hover:scale-105"
                            />

                            <span className="text-xl font-bold">
                                Human Resource Management System
                            </span>
                        </div>

                        {/* Contact */}
                        <div className="text-center md:text-right">
                            <p className="font-medium">
                                Human Resource Management System
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Simplifying HR management for modern organizations.
                            </p>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
                        © 2026 Human Resource Management System. All rights reserved.
                    </div>

                </div>
            </footer>
        </div>
    );
};

export default LandingPage;