
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
import { Search } from "lucide-react";

// import {
//     Users,
//     IndianRupee,
//     CalendarDays,
//     CircleDollarSign,
//     Search,
// } from "lucide-react";

// ===============================
// TYPES
// ===============================

interface PayrollEmployee {
    id: number;
    employeeCode: string;
    employeeName: string;
    designation: string;

    basicSalary: number;

    paidLeaveAllowed: number;
    paidLeaveTaken: number;
    unpaidLeave: number;
}

// ===============================
// DUMMY DATA
// ===============================

const payrollData: PayrollEmployee[] = [
    {
        id: 1,
        employeeCode: "EMP001",
        employeeName: "Vinita Kushwah",
        designation: "Software Developer",

        basicSalary: 14000,

        paidLeaveAllowed: 2,
        paidLeaveTaken: 1,
        unpaidLeave: 2,
    },

    {
        id: 2,
        employeeCode: "EMP002",
        employeeName: "Raj Sharma",
        designation: "Frontend Developer",

        basicSalary: 15000,

        paidLeaveAllowed: 2,
        paidLeaveTaken: 2,
        unpaidLeave: 1,
    },

    {
        id: 3,
        employeeCode: "EMP003",
        employeeName: "Neha Singh",
        designation: "HR Executive",

        basicSalary: 13000,

        paidLeaveAllowed: 2,
        paidLeaveTaken: 0,
        unpaidLeave: 3,
    },

    {
        id: 4,
        employeeCode: "EMP004",
        employeeName: "Amit Verma",
        designation: "Backend Developer",

        basicSalary: 12000,

        paidLeaveAllowed: 2,
        paidLeaveTaken: 1,
        unpaidLeave: 1,
    },

    {
        id: 5,
        employeeCode: "EMP005",
        employeeName: "Pooja Sharma",
        designation: "Accountant",

        basicSalary: 10000,

        paidLeaveAllowed: 2,
        paidLeaveTaken: 2,
        unpaidLeave: 2,
    },
];

// ===============================
// PAYROLL CALCULATION
// ===============================

const calculatePayroll = (employee: PayrollEmployee) => {
    // Monthly salary is calculated on 30 days
    const perDaySalary = employee.basicSalary / 30;

    // Unpaid leave deduction
    const unpaidLeaveDeduction =
        employee.unpaidLeave * perDaySalary;

    // Final salary
    const netSalary = Math.max(
        employee.basicSalary - unpaidLeaveDeduction,
        0
    );

    return {
        perDaySalary,
        unpaidLeaveDeduction,
        netSalary,
    };
};

// ===============================
// CURRENCY FORMAT
// ===============================

const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
};

// ===============================
// COMPONENT
// ===============================

const Payroll = () => {
    const [search, setSearch] = React.useState("");
    const [month, setMonth] = React.useState("2026-08");

    // ===============================
    // FILTER
    // ===============================

    const filteredEmployees = payrollData.filter((employee) => {
        const searchValue = search.toLowerCase().trim();

        return (
            employee.employeeName
                .toLowerCase()
                .includes(searchValue) ||
            employee.employeeCode
                .toLowerCase()
                .includes(searchValue) ||
            employee.designation
                .toLowerCase()
                .includes(searchValue)
        );
    });

    // ===============================
    // SUMMARY CALCULATION
    // ===============================

    const payrollSummary = payrollData.reduce(
        (acc, employee) => {
            const salary = calculatePayroll(employee);

            acc.totalEmployees += 1;

            acc.totalBasicSalary +=
                employee.basicSalary;

            acc.totalUnpaidLeave +=
                employee.unpaidLeave;

            acc.totalLeaveDeduction +=
                salary.unpaidLeaveDeduction;

            acc.totalNetSalary +=
                salary.netSalary;

            return acc;
        },
        {
            totalEmployees: 0,
            totalBasicSalary: 0,
            totalUnpaidLeave: 0,
            totalLeaveDeduction: 0,
            totalNetSalary: 0,
        }
    );

    // ===============================
    // PAID LEAVE SUMMARY
    // ===============================

    const totalPaidLeaveAllowed = payrollData.reduce(
        (total, employee) =>
            total + employee.paidLeaveAllowed,
        0
    );

    const totalPaidLeaveTaken = payrollData.reduce(
        (total, employee) =>
            total + employee.paidLeaveTaken,
        0
    );

    // const totalPaidLeaveRemaining = Math.max(
    //     totalPaidLeaveAllowed - totalPaidLeaveTaken,
    //     0
    // );

    // ===============================
    // GENERATE PAYROLL
    // ===============================

    const handleGeneratePayroll = () => {
        console.log("Generating payroll for:", month);
    };

    return (
        <div className="p-1 space-y-6">

            {/* ============================= */}
            {/* HEADER */}
            {/* ============================= */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    {/* <h1 className="text-2xl font-semibold">
                        Payroll
                    </h1> */}

                    <p className="text-sm text-muted-foreground mt-1">
                        Manage employee salary and payroll
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">

                    <Input
                        type="month"
                        value={month}
                        onChange={(e) =>
                            setMonth(e.target.value)
                        }
                        className="w-[170px]"
                    />

                    <Button
                        onClick={handleGeneratePayroll}
                    >
                        Generate Payroll
                    </Button>

                </div>

            </div>

            {/* ============================= */}
            {/* SUMMARY CARDS */}
            {/* ============================= */}

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">

                {/* TOTAL EMPLOYEES */}

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Total Employees
                    </p>

                    <p className="text-2xl font-bold">
                        {payrollSummary.totalEmployees}
                    </p>
                </Card>


                {/* BASIC SALARY */}

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Basic Salary
                    </p>

                    <p className="text-2xl font-bold">
                        {formatCurrency(
                            payrollSummary.totalBasicSalary
                        )}
                    </p>
                </Card>


                {/* UNPAID LEAVE */}

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Unpaid Leave
                    </p>

                    <p className="text-2xl font-bold text-red-600">
                        {payrollSummary.totalUnpaidLeave}
                    </p>
                </Card>


                {/* NET SALARY */}

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Net Salary
                    </p>

                    <p className="text-2xl font-bold">
                        {formatCurrency(
                            payrollSummary.totalNetSalary
                        )}
                    </p>
                </Card>

            </div>

            {/* ============================= */}
            {/* LEAVE SUMMARY */}
            {/* ============================= */}

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">

                {/* PAID LEAVE */}

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Paid Leave
                    </p>

                    <p className="text-2xl font-bold">
                        {totalPaidLeaveTaken}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                        Taken / {totalPaidLeaveAllowed} allowed
                    </p>
                </Card>


                {/* UNPAID LEAVE */}

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Unpaid Leave
                    </p>

                    <p className="text-2xl font-bold text-red-600">
                        {payrollSummary.totalUnpaidLeave}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                        Salary deduction{" "}
                        {formatCurrency(
                            payrollSummary.totalLeaveDeduction
                        )}
                    </p>
                </Card>


                {/* SALARY SUMMARY */}

                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">
                        Salary Summary
                    </p>

                    <p className="text-2xl font-bold">
                        {formatCurrency(
                            payrollSummary.totalBasicSalary
                        )}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                        Basic salary
                    </p>
                </Card>

            </div>

            {/* ============================= */}
            {/* SEARCH */}
            {/* ============================= */}

            <Card>

                <CardContent className="p-4">

                    <div className="relative w-full max-w-sm">

                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <Input
                            placeholder="Search employee..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="pl-9"
                        />

                    </div>

                </CardContent>

            </Card>

            {/* ============================= */}
            {/* PAYROLL TABLE */}
            {/* ============================= */}

            <Card className="overflow-hidden">

                <CardHeader>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <CardTitle>
                                Employee Payroll
                            </CardTitle>

                            <p className="text-sm text-muted-foreground mt-1">
                                Salary details for selected month
                            </p>
                        <Badge variant="outline">
                            {month}
                        </Badge>

                        </div>
                    </div>

                </CardHeader>

                <CardContent className="p-0">
                    <div className="bg-card grid grid-cols-1 rounded border w-full overflow-hidden">
                        <div className="h-full overflow-auto">

                            <Table>

                                <TableHeader className="bg-muted sticky top-0 z-10">

                                    <TableRow>

                                        <TableHead>
                                            Employee
                                        </TableHead>

                                        <TableHead>
                                            Designation
                                        </TableHead>

                                        <TableHead>
                                            Basic Salary
                                        </TableHead>

                                        <TableHead>
                                            Paid Leave
                                        </TableHead>

                                        <TableHead>
                                            Unpaid Leave
                                        </TableHead>

                                        <TableHead>
                                            Leave Deduction
                                        </TableHead>

                                        <TableHead>
                                            Net Salary
                                        </TableHead>

                                    </TableRow>

                                </TableHeader>

                                <TableBody>

                                    {filteredEmployees.length > 0 ? (

                                        filteredEmployees.map(
                                            (employee) => {

                                                const salary =
                                                    calculatePayroll(
                                                        employee
                                                    );

                                                return (

                                                    <TableRow
                                                        key={employee.id}
                                                    >

                                                        {/* EMPLOYEE */}

                                                        <TableCell>

                                                            <div>

                                                                <p className="font-medium">
                                                                    {
                                                                        employee.employeeName
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        employee.employeeCode
                                                                    }
                                                                </p>

                                                            </div>

                                                        </TableCell>

                                                        {/* DESIGNATION */}

                                                        <TableCell>
                                                            {
                                                                employee.designation
                                                            }
                                                        </TableCell>

                                                        {/* BASIC SALARY */}

                                                        <TableCell>
                                                            {formatCurrency(
                                                                employee.basicSalary
                                                            )}
                                                        </TableCell>

                                                        {/* PAID LEAVE */}

                                                        <TableCell>

                                                            <div className="text-sm">

                                                                <span className="font-medium">
                                                                    {
                                                                        employee.paidLeaveTaken
                                                                    }
                                                                </span>

                                                                <span className="text-muted-foreground">
                                                                    {" / "}
                                                                    {
                                                                        employee.paidLeaveAllowed
                                                                    }
                                                                </span>

                                                                <p className="text-xs text-muted-foreground">
                                                                    Taken / Allowed
                                                                </p>

                                                            </div>

                                                        </TableCell>

                                                        {/* UNPAID LEAVE */}

                                                        <TableCell>

                                                            <Badge
                                                                variant={
                                                                    employee.unpaidLeave >
                                                                        0
                                                                        ? "destructive"
                                                                        : "secondary"
                                                                }
                                                            >
                                                                {
                                                                    employee.unpaidLeave
                                                                }{" "}
                                                                days
                                                            </Badge>

                                                        </TableCell>

                                                        {/* LEAVE DEDUCTION */}

                                                        <TableCell>

                                                            {formatCurrency(
                                                                salary.unpaidLeaveDeduction
                                                            )}

                                                        </TableCell>

                                                        {/* NET SALARY */}

                                                        <TableCell>

                                                            <span className="font-semibold">
                                                                {formatCurrency(
                                                                    salary.netSalary
                                                                )}
                                                            </span>

                                                        </TableCell>

                                                    </TableRow>

                                                );
                                            }
                                        )

                                    ) : (

                                        <TableRow>

                                            <TableCell
                                                colSpan={7}
                                                className="text-center py-8 text-muted-foreground"
                                            >
                                                No employees found
                                            </TableCell>

                                        </TableRow>

                                    )}

                                </TableBody>

                            </Table>

                        </div>
                    </div>
                </CardContent>

            </Card>

        </div>
    );
};

export default Payroll;
