import React from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    Search,
    RefreshCw,
} from "lucide-react";

import { toast } from "sonner";

import type { PayrollSummary } from "@/types/payroll.types";

import {
    getPayrollSummary,
} from "@/services/payroll.service";


// ─────────────────────────────────────────────
// Currency
// ─────────────────────────────────────────────

const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
};


// ─────────────────────────────────────────────
// Payroll Page
// ─────────────────────────────────────────────

const Payroll = () => {

    const [search, setSearch] =
        React.useState("");

    const [month, setMonth] =
        React.useState(
            `${new Date().getFullYear()}-${String(
                new Date().getMonth() + 1
            ).padStart(2, "0")}`
        );

    const [payrollData, setPayrollData] =
        React.useState<PayrollSummary[]>([]);

    const [loading, setLoading] =
        React.useState(true);


    // ─────────────────────────────────────────
    // Load Payroll
    // ─────────────────────────────────────────

    React.useEffect(() => {
        loadPayroll();
    }, [month]);


    const loadPayroll = async () => {

        setLoading(true);

        try {

            const [
                yearStr,
                monthStr,
            ] = month.split("-");

            const res =
                await getPayrollSummary(
                    Number(monthStr),
                    Number(yearStr)
                );

            setPayrollData(
                res.data.data
            );

        } catch (err: any) {

            toast.error(
                err?.message ||
                "Failed to load payroll data"
            );

        } finally {

            setLoading(false);

        }
    };


    // ─────────────────────────────────────────
    // Filter Employees
    // ─────────────────────────────────────────

    const filteredEmployees =
        payrollData.filter((emp) => {

            const searchValue =
                search
                    .toLowerCase()
                    .trim();

            return (
                emp.user.name
                    .toLowerCase()
                    .includes(searchValue) ||

                (
                    emp.user.employeeCode ??
                    ""
                )
                    .toLowerCase()
                    .includes(searchValue) ||

                (
                    emp.user.designation ??
                    ""
                )
                    .toLowerCase()
                    .includes(searchValue)
            );
        });


    // ─────────────────────────────────────────
    // Payroll Summary
    // ─────────────────────────────────────────

    const payrollSummary =
        payrollData.reduce(
            (acc, emp) => {

                acc.totalEmployees += 1;

                acc.totalGrossSalary +=
                    emp.grossSalary;

                acc.totalHolidayDays +=
                    emp.holidayDays;

                acc.totalUnpaidLeaveDays +=
                    emp.unpaidLeaveDays;

                acc.totalDeduction +=
                    emp.deductionAmount;

                acc.totalNetSalary +=
                    emp.netSalary;

                acc.absentDays +=
                    emp.absentDays;

                return acc;
            },

            {
                totalEmployees: 0,

                totalGrossSalary: 0,

                totalHolidayDays: 0,

                totalUnpaidLeaveDays: 0,

                totalDeduction: 0,

                totalNetSalary: 0,

                absentDays: 0,
            }
        );


    // ─────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────

    return (

        <div className="p-1 space-y-6">

            {/* HEADER */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                    <p className="text-sm text-muted-foreground mt-1">
                        Manage employee salary and payroll
                    </p>

                </div>


                <div className="flex items-center gap-2 flex-wrap">

                    <Input
                        type="month"
                        value={month}
                        onChange={(e) =>
                            setMonth(
                                e.target.value
                            )
                        }
                        className="w-[170px]"
                    />


                    <Button
                        variant="add"
                        onClick={loadPayroll}
                        disabled={loading}
                    >

                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${loading
                                ? "animate-spin"
                                : ""
                                }`}
                        />

                        Refresh

                    </Button>

                </div>

            </div>


            {/* ─────────────────────────────────────
                SUMMARY CARDS
            ───────────────────────────────────── */}

            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">

                {/* Employees */}

                <Card className="p-3">

                    <p className="text-xs text-muted-foreground">
                        Total Employees
                    </p>

                    <p className="text-2xl font-bold">
                        {
                            payrollSummary
                                .totalEmployees
                        }
                    </p>

                </Card>


                {/* Gross Salary */}

                <Card className="p-3">

                    <p className="text-xs text-muted-foreground">
                        Gross Salary
                    </p>

                    <p className="text-2xl font-bold">
                        {
                            formatCurrency(
                                payrollSummary
                                    .totalGrossSalary
                            )
                        }
                    </p>

                </Card>


                {/* Holiday */}

                <Card className="p-3">

                    <p className="text-xs text-muted-foreground">
                        Holiday
                    </p>

                    <p className="text-2xl font-bold text-blue-600">
                        {
                            payrollSummary
                                .totalHolidayDays
                        }
                    </p>

                </Card>


                {/* Unpaid Leave */}

                <Card className="p-3">

                    <p className="text-xs text-muted-foreground">
                        Unpaid Leave
                    </p>

                    <p className="text-2xl font-bold text-red-600">

                        {
                            payrollSummary
                                .totalUnpaidLeaveDays
                        }

                    </p>

                </Card>


                {/* Absent */}

                <Card className="p-3">

                    <p className="text-xs text-muted-foreground">
                        Absent Days
                    </p>

                    <p className="text-2xl font-bold text-red-600">

                        {
                            payrollSummary
                                .absentDays
                        }

                    </p>

                </Card>


                {/* Deduction */}

                <Card className="p-3">

                    <p className="text-xs text-muted-foreground">
                        Total Deduction
                    </p>

                    <p className="text-2xl font-bold text-red-600">

                        {
                            formatCurrency(
                                payrollSummary
                                    .totalDeduction
                            )
                        }

                    </p>

                </Card>


                {/* Net Salary */}

                <Card className="p-3">

                    <p className="text-xs text-muted-foreground">
                        Net Payable
                    </p>

                    <p className="text-2xl font-bold text-green-600">

                        {
                            formatCurrency(
                                payrollSummary
                                    .totalNetSalary
                            )
                        }

                    </p>

                </Card>

            </div>


            {/* ─────────────────────────────────────
                SEARCH
            ───────────────────────────────────── */}

            <div className="w-full">
                <div className="relative w-full max-w-sm">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <Input
                        placeholder="Search employee..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>


            {/* ─────────────────────────────────────
                TABLE
            ───────────────────────────────────── */}

            <div className="bg-card grid grid-cols-1 rounded border w-full overflow-x-auto">
                <Table className="table-auto">
                    <TableHeader className="bg-muted rounded-lg">
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Gross Salary</TableHead>
                            <TableHead>Working Days</TableHead>
                            <TableHead>Holiday Days</TableHead>
                            <TableHead>Present Days</TableHead>
                            <TableHead>Paid Leave</TableHead>
                            <TableHead>Unpaid Leave</TableHead>
                            <TableHead>Absent Days</TableHead>
                            <TableHead>Deduction</TableHead>
                            <TableHead>Net Salary</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={11}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    Loading payroll...
                                </TableCell>
                            </TableRow>
                        ) : filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={11}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    No employees found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees.map((emp) => (
                                <TableRow key={emp.userId}>
                                    <TableCell>
                                        <p className="font-medium">
                                            {emp.user.name}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {emp.user.employeeCode}
                                        </p>
                                    </TableCell>

                                    <TableCell>
                                        {emp.user.designation ?? "—"}
                                    </TableCell>

                                    <TableCell>
                                        {formatCurrency(emp.grossSalary)}
                                    </TableCell>

                                    <TableCell>
                                        {emp.totalWorkingDays}
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="secondary">
                                            {emp.holidayDays || 0}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        {emp.presentDays} / {emp.totalWorkingDays}
                                    </TableCell>

                                    <TableCell>
                                        {emp.paidLeaveDays}
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant={
                                                emp.unpaidLeaveDays > 0
                                                    ? "destructive"
                                                    : "secondary"
                                            }
                                        >
                                            {emp.unpaidLeaveDays} days
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        {emp.absentDays}
                                    </TableCell>

                                    <TableCell>
                                        {formatCurrency(emp.deductionAmount)}
                                    </TableCell>

                                    <TableCell>
                                        <span className="font-semibold">
                                            {formatCurrency(emp.netSalary)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

        </div>
    );
};


export default Payroll;