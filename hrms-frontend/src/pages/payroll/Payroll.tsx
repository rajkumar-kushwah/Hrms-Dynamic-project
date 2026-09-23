import React from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
    Search,
    RefreshCw,
    Check,
} from "lucide-react";

import { toast } from "sonner";

import type { PayrollSummary } from "@/types/payroll.types";

import {
    getPayrollSummary,
} from "@/services/payroll.service";

import { PayrollTable } from "@/pages/payroll/Payrolltable";

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
    const currentDate = new Date();

    const [search, setSearch] = React.useState("");

    const [month, setMonth] = React.useState(
        currentDate.getMonth() + 1
    );

    const [year, setYear] = React.useState(
        currentDate.getFullYear()
    );

    const [payrollData, setPayrollData] =
        React.useState<PayrollSummary[]>([]);

    const [loading, setLoading] = React.useState(true);

    // Selected employees for salary slips
    const [selectedIds, setSelectedIds] =
        React.useState<Set<string>>(new Set());

    // ─────────────────────────────────────────
    // Load Payroll
    // ─────────────────────────────────────────

    const loadPayroll = React.useCallback(async () => {
        setLoading(true);

        try {
            const response = await getPayrollSummary(
                month,
                year
            );

            setPayrollData(response.data.data);

            // Clear selection whenever payroll period changes
            setSelectedIds(new Set());
        } catch (error: unknown) {
            console.error("Failed to load payroll:", error);

            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to load payroll data");
            }
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    React.useEffect(() => {
        void loadPayroll();
    }, [loadPayroll]);

    // ─────────────────────────────────────────
    // Filter Employees
    // ─────────────────────────────────────────

    const filteredEmployees = React.useMemo(() => {
        const searchValue = search
            .toLowerCase()
            .trim();

        if (!searchValue) {
            return payrollData;
        }

        return payrollData.filter((emp) => {
            return (
                emp.user.name
                    .toLowerCase()
                    .includes(searchValue) ||
                (emp.user.employeeCode ?? "")
                    .toLowerCase()
                    .includes(searchValue) ||
                (emp.user.designation ?? "")
                    .toLowerCase()
                    .includes(searchValue)
            );
        });
    }, [payrollData, search]);

    // ─────────────────────────────────────────
    // Selection
    // ─────────────────────────────────────────

    const filteredEmployeeIds = React.useMemo(
        () =>
            filteredEmployees.map(
                (employee) => employee.userId
            ),
        [filteredEmployees]
    );

    const allFilteredSelected =
        filteredEmployeeIds.length > 0 &&
        filteredEmployeeIds.every((id) =>
            selectedIds.has(id)
        );

    const toggleSelectAll = () => {
        setSelectedIds((previous) => {
            const next = new Set(previous);

            if (allFilteredSelected) {
                filteredEmployeeIds.forEach((id) => {
                    next.delete(id);
                });
            } else {
                filteredEmployeeIds.forEach((id) => {
                    next.add(id);
                });
            }

            return next;
        });
    };

    const toggleEmployee = (userId: string) => {
        setSelectedIds((previous) => {
            const next = new Set(previous);

            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }

            return next;
        });
    };

    // ─────────────────────────────────────────
    // Payroll Summary
    // ─────────────────────────────────────────

    const payrollSummary = React.useMemo(() => {
        return payrollData.reduce(
            (acc, emp) => {
                acc.totalEmployees += 1;
                acc.totalGrossSalary += emp.grossSalary;
                acc.totalHolidayDays += emp.holidayDays;
                acc.totalUnpaidLeaveDays += emp.unpaidLeaveDays;
                acc.totalDeduction += emp.deductionAmount;
                acc.totalNetSalary += emp.netSalary;
                acc.absentDays += emp.absentDays;

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
    }, [payrollData]);

    // ─────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────

    return (
        <div className="p-1 space-y-6">

            {/* HEADER */}

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Manage employee salary and payroll
                    </p>
                </div>
            </div>

            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Total Employees
                    </p>

                    <p className="text-2xl font-bold">
                        {payrollSummary.totalEmployees}
                    </p>
                </Card>

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Gross Salary
                    </p>

                    <p className="text-2xl font-bold">
                        {formatCurrency(
                            payrollSummary.totalGrossSalary
                        )}
                    </p>
                </Card>

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Holiday
                    </p>

                    <p className="text-2xl font-bold text-blue-600">
                        {payrollSummary.totalHolidayDays}
                    </p>
                </Card>

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Unpaid Leave
                    </p>

                    <p className="text-2xl font-bold text-red-600">
                        {payrollSummary.totalUnpaidLeaveDays}
                    </p>
                </Card>

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Absent Days
                    </p>

                    <p className="text-2xl font-bold text-red-600">
                        {payrollSummary.absentDays}
                    </p>
                </Card>

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Total Deduction
                    </p>

                    <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(
                            payrollSummary.totalDeduction
                        )}
                    </p>
                </Card>

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Net Payable
                    </p>

                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                            payrollSummary.totalNetSalary
                        )}
                    </p>
                </Card>

            </div>

            {/* SEARCH */}

            <div className="flex items-center justify-between gap-3">

                <div className="relative w-full max-w-sm">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <Input
                        type="search"
                        name="payroll-search"
                        autoComplete="off"
                        placeholder="Search employee..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        className="pl-9"
                    />
                </div>

            </div>

            {/* SALARY SLIP TOOLBAR */}

            <PayrollTable
                selectedIds={selectedIds}
                month={month}
                year={year}
                onMonthChange={setMonth}
                onYearChange={setYear}
            />

            {/* PAYROLL TABLE */}

            <div className="bg-card grid grid-cols-1 rounded border w-full overflow-x-auto">

                <Table className="table-auto">

                    <TableHeader className="bg-muted">

                        <TableRow>

                            {/* SELECT ALL */}

                            <TableHead className="w-[50px]">
                                <button
                                    type="button"
                                    onClick={toggleSelectAll}
                                    disabled={
                                        loading ||
                                        filteredEmployeeIds.length === 0
                                    }
                                    className={`
                                        flex h-4 w-4 items-center justify-center
                                        rounded-sm border
                                        transition-colors
                                        ${
                                            allFilteredSelected
                                                ? "bg-[var(--themePrimary)] border-[var(--themePrimary)] text-white"
                                                : "bg-background border-input"
                                        }
                                    `}
                                    aria-label="Select all employees"
                                >
                                    {allFilteredSelected && (
                                        <Check className="h-3 w-3" />
                                    )}
                                </button>
                            </TableHead>

                            <TableHead>
                                Employee
                            </TableHead>

                            <TableHead>
                                Designation
                            </TableHead>

                            <TableHead>
                                Gross Salary
                            </TableHead>

                            <TableHead>
                                Working Days
                            </TableHead>

                            <TableHead>
                                Holiday Days
                            </TableHead>

                            <TableHead>
                                Present Days
                            </TableHead>

                            <TableHead>
                                Paid Leave
                            </TableHead>

                            <TableHead>
                                Unpaid Leave
                            </TableHead>

                            <TableHead>
                                Absent Days
                            </TableHead>

                            <TableHead>
                                Deduction
                            </TableHead>

                            <TableHead>
                                Net Salary
                            </TableHead>

                        </TableRow>

                    </TableHeader>

                    <TableBody>

                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={12}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Loading payroll...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={12}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    No employees found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees.map((emp) => {
                                const isSelected =
                                    selectedIds.has(emp.userId);

                                return (
                                    <TableRow
                                        key={emp.userId}
                                        className={
                                            isSelected
                                                ? "bg-muted/50"
                                                : ""
                                        }
                                    >

                                        {/* ROW CHECKBOX */}

                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleEmployee(
                                                        emp.userId
                                                    )
                                                }
                                                className={`
                                                    flex h-4 w-4 items-center justify-center
                                                    rounded-sm border
                                                    transition-colors
                                                    ${
                                                        isSelected
                                                            ? "bg-[var(--themePrimary)] border-[var(--themePrimary)] text-white"
                                                            : "bg-background border-input"
                                                    }
                                                `}
                                                aria-label={`Select ${emp.user.name}`}
                                            >
                                                {isSelected && (
                                                    <Check className="h-3 w-3" />
                                                )}
                                            </button>
                                        </TableCell>

                                        {/* EMPLOYEE */}

                                        <TableCell>
                                            <p className="font-medium">
                                                {emp.user.name}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {emp.user.employeeCode}
                                            </p>
                                        </TableCell>

                                        {/* DESIGNATION */}

                                        <TableCell>
                                            {emp.user.designation ?? "—"}
                                        </TableCell>

                                        {/* GROSS */}

                                        <TableCell>
                                            {formatCurrency(
                                                emp.grossSalary
                                            )}
                                        </TableCell>

                                        {/* WORKING DAYS */}

                                        <TableCell>
                                            {emp.totalWorkingDays}
                                        </TableCell>

                                        {/* HOLIDAY */}

                                        <TableCell>
                                            <Badge variant="secondary">
                                                {emp.holidayDays || 0}
                                            </Badge>
                                        </TableCell>

                                        {/* PRESENT */}

                                        <TableCell>
                                            {emp.presentDays} /{" "}
                                            {emp.totalWorkingDays}
                                        </TableCell>

                                        {/* PAID LEAVE */}

                                        <TableCell>
                                            {emp.paidLeaveDays}
                                        </TableCell>

                                        {/* UNPAID LEAVE */}

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

                                        {/* ABSENT */}

                                        <TableCell>
                                            {emp.absentDays}
                                        </TableCell>

                                        {/* DEDUCTION */}

                                        <TableCell>
                                            {formatCurrency(
                                                emp.deductionAmount
                                            )}
                                        </TableCell>

                                        {/* NET SALARY */}

                                        <TableCell>
                                            <span className="font-semibold">
                                                {formatCurrency(
                                                    emp.netSalary
                                                )}
                                            </span>
                                        </TableCell>

                                    </TableRow>
                                );
                            })
                        )}

                    </TableBody>

                </Table>

            </div>

        </div>
    );
};

export default Payroll;