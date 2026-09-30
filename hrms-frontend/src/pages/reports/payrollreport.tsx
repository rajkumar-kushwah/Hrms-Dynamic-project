// pages/payroll/PayrollReport.tsx
import React from "react";
import * as XLSX from "xlsx";

import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { RefreshCw, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

import { getMonthlyPayrollReport } from "@/services/payrollreport.service";


// Types


type PayrollStatus = "DRAFT" | "CONFIRMED" | "PAID";

interface GroupTotals {
    id: string | null;
    name: string;
    employeeCount: number;
    totalGross: number;
    totalEarned: number;
    totalDeduction: number;
    totalNet: number;
}

interface EmployeeRow {
    userId: string;
    name: string;
    employeeCode: string | null;
    branchName: string;
    categoryName: string;
    gross: number;
    earned: number;
    deduction: number;
    net: number;
    status: PayrollStatus;
}

interface Report {
    month: number;
    year: number;
    totals: {
        employeeCount: number;
        totalGross: number;
        totalEarned: number;
        totalDeduction: number;
        totalNet: number;
        draftCount: number;
        confirmedCount: number;
        paidCount: number;
    };
    byBranch: GroupTotals[];
    byCategory: GroupTotals[];
    employees: EmployeeRow[];
}


// Constants / helpers


const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// const STATUS_BADGE_VARIANT: Record<PayrollStatus, "secondary" | "default" | "destructive"> = {
//     DRAFT: "secondary",
//     CONFIRMED: "default",
//     PAID: "default",
// };

const StatusBadge = ({ status }: { status: PayrollStatus }) => {
    const colorClass =
        status === "PAID"
            ? "bg-green-100 text-green-700"
            : status === "CONFIRMED"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-gray-200 text-gray-700";

    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
            {status}
        </span>
    );
};


// Page


const PayrollReport = () => {
    const currentDate = new Date();

    const [month, setMonth] = React.useState(currentDate.getMonth() + 1);
    const [year, setYear] = React.useState(currentDate.getFullYear());

    const [report, setReport] = React.useState<Report | null>(null);
    const [loading, setLoading] = React.useState(true);

    // Load report

    const loadReport = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await getMonthlyPayrollReport(month, year);
            setReport(response.data.data ?? response.data);
        } catch (error: any) {
            toast.error(error?.message || "Failed to load payroll report");
            setReport(null);
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    React.useEffect(() => {
        void loadReport();
    }, [loadReport]);

    // Excel export

    const handleExport = () => {
        if (!report) return;

        const wb = XLSX.utils.book_new();

        const sum = <T,>(items: T[], pick: (i: T) => number) =>
            Number(items.reduce((s, i) => s + pick(i), 0).toFixed(2));

        const fitColumns = (rows: Record<string, string | number>[]) => {
            if (rows.length === 0) return [];
            return Object.keys(rows[0]).map((key) => ({
                wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? "").length)) + 2,
            }));
        };

        const makeSheet = (rows: Record<string, string | number>[]) => {
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = fitColumns(rows);
            return ws;
        };

        const groupRows = (rows: GroupTotals[]) => [
            ...rows.map((r) => ({
                Name: r.name,
                Employees: r.employeeCount,
                Gross: r.totalGross,
                Earned: r.totalEarned,
                Deduction: r.totalDeduction,
                "Net Payable": r.totalNet,
            })),
            {
                Name: "TOTAL",
                Employees: sum(rows, (r) => r.employeeCount),
                Gross: sum(rows, (r) => r.totalGross),
                Earned: sum(rows, (r) => r.totalEarned),
                Deduction: sum(rows, (r) => r.totalDeduction),
                "Net Payable": sum(rows, (r) => r.totalNet),
            },
        ];

        const sortedEmployees = [...report.employees].sort(
            (a, b) =>
                a.branchName.localeCompare(b.branchName) ||
                a.categoryName.localeCompare(b.categoryName) ||
                a.name.localeCompare(b.name)
        );

        const employeeRows = [
            ...sortedEmployees.map((e) => ({
                Code: e.employeeCode ?? "",
                Name: e.name,
                Branch: e.branchName,
                Category: e.categoryName,
                Gross: e.gross,
                Earned: e.earned,
                Deduction: e.deduction,
                "Net Payable": e.net,
                Status: e.status,
            })),
            {
                Code: "",
                Name: "TOTAL",
                Branch: "",
                Category: "",
                Gross: sum(sortedEmployees, (e) => e.gross),
                Earned: sum(sortedEmployees, (e) => e.earned),
                Deduction: sum(sortedEmployees, (e) => e.deduction),
                "Net Payable": sum(sortedEmployees, (e) => e.net),
                Status: "",
            },
        ];

        // Branch-wise Detail sheet: employees grouped under their branch
        const detailHeader = ["Branch / Employee", "Code", "Category", "Gross", "Earned", "Deduction", "Net Payable"];
        const detailRows: (string | number)[][] = [detailHeader];
        const branchNames = Array.from(new Set(sortedEmployees.map((e) => e.branchName)));

        for (const branchName of branchNames) {
            const members = sortedEmployees.filter((e) => e.branchName === branchName);
            detailRows.push([branchName.toUpperCase(), "", "", "", "", "", ""]);
            for (const e of members) {
                detailRows.push([`   ${e.name}`, e.employeeCode ?? "", e.categoryName, e.gross, e.earned, e.deduction, e.net]);
            }
            detailRows.push([
                `Branch Total (${members.length} employees)`, "", "",
                sum(members, (e) => e.gross), sum(members, (e) => e.earned),
                sum(members, (e) => e.deduction), sum(members, (e) => e.net),
            ]);
            detailRows.push(["", "", "", "", "", "", ""]);
        }
        detailRows.push([
            `GRAND TOTAL (${sortedEmployees.length} employees)`, "", "",
            sum(sortedEmployees, (e) => e.gross), sum(sortedEmployees, (e) => e.earned),
            sum(sortedEmployees, (e) => e.deduction), sum(sortedEmployees, (e) => e.net),
        ]);

        const detailSheet = XLSX.utils.aoa_to_sheet(detailRows);
        detailSheet["!cols"] = detailHeader.map((h, i) => ({
            wch: Math.max(h.length, ...detailRows.map((r) => String(r[i] ?? "").length)) + 2,
        }));

        XLSX.utils.book_append_sheet(wb, detailSheet, "Branch-wise Detail");
        XLSX.utils.book_append_sheet(wb, makeSheet(groupRows(report.byBranch)), "By Branch");
        XLSX.utils.book_append_sheet(wb, makeSheet(groupRows(report.byCategory)), "By Category");
        XLSX.utils.book_append_sheet(wb, makeSheet(employeeRows), "Employees");

        XLSX.writeFile(wb, `payroll-report-${month}-${year}.xlsx`);
    };


    // UI


    return (
        <div className="p-1 space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-muted-foreground">
                    Monthly payroll summary — view and export only
                </p>

                <div className="flex items-center gap-2">
                    <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                        <SelectTrigger className="w-[145px]">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            {MONTHS.map((m) => (
                                <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                        <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            {getYearOptions().map((y) => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={handleExport} disabled={!report || loading}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground py-12">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading report...
                </div>
            ) : !report ? (
                <div className="text-center text-muted-foreground py-12">
                    No data available for this period.
                </div>
            ) : (
                <>
                    {/* SUMMARY CARDS */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <Card className="p-3">
                            <p className="text-xs text-muted-foreground">Employees</p>
                            <p className="text-2xl font-bold">{report.totals.employeeCount}</p>
                        </Card>
                        <Card className="p-3">
                            <p className="text-xs text-muted-foreground">Total Gross</p>
                            <p className="text-2xl font-bold">{inr(report.totals.totalGross)}</p>
                        </Card>
                        <Card className="p-3">
                            <p className="text-xs text-muted-foreground">Total Earned</p>
                            <p className="text-2xl font-bold">{inr(report.totals.totalEarned)}</p>
                        </Card>
                        <Card className="p-3">
                            <p className="text-xs text-muted-foreground">Total Deduction</p>
                            <p className="text-2xl font-bold text-red-600">{inr(report.totals.totalDeduction)}</p>
                        </Card>
                        <Card className="p-3">
                            <p className="text-xs text-muted-foreground">Total Disbursed (Net)</p>
                            <p className="text-2xl font-bold text-green-600">{inr(report.totals.totalNet)}</p>
                        </Card>
                    </div>

                    {/* STATUS BREAKDOWN — view only, no actions here */}
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="flex items-center gap-1.5">
                            <StatusBadge status="DRAFT" /> {report.totals.draftCount}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <StatusBadge status="CONFIRMED" /> {report.totals.confirmedCount}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <StatusBadge status="PAID" /> {report.totals.paidCount}
                        </span>
                    </div>

                    {/* BRANCH-WISE SUMMARY */}
                    <div>
                        <h3 className="text-sm font-medium mb-2">Branch-wise Summary</h3>
                        <div className="bg-card rounded border overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Employees</TableHead>
                                        <TableHead className="text-right">Gross</TableHead>
                                        <TableHead className="text-right">Earned</TableHead>
                                        <TableHead className="text-right">Deduction</TableHead>
                                        <TableHead className="text-right">Net Payable</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.byBranch.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                                No data
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        report.byBranch.map((b) => (
                                            <TableRow key={b.id ?? b.name}>
                                                <TableCell>{b.name}</TableCell>
                                                <TableCell className="text-right">{b.employeeCount}</TableCell>
                                                <TableCell className="text-right">{inr(b.totalGross)}</TableCell>
                                                <TableCell className="text-right">{inr(b.totalEarned)}</TableCell>
                                                <TableCell className="text-right text-red-600">{inr(b.totalDeduction)}</TableCell>
                                                <TableCell className="text-right text-green-600 font-semibold">{inr(b.totalNet)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* CATEGORY-WISE SUMMARY */}
                    <div>
                        <h3 className="text-sm font-medium mb-2">Category-wise Summary</h3>
                        <div className="bg-card rounded border overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Employees</TableHead>
                                        <TableHead className="text-right">Gross</TableHead>
                                        <TableHead className="text-right">Earned</TableHead>
                                        <TableHead className="text-right">Deduction</TableHead>
                                        <TableHead className="text-right">Net Payable</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.byCategory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                                No data
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        report.byCategory.map((c) => (
                                            <TableRow key={c.id ?? c.name}>
                                                <TableCell>{c.name}</TableCell>
                                                <TableCell className="text-right">{c.employeeCount}</TableCell>
                                                <TableCell className="text-right">{inr(c.totalGross)}</TableCell>
                                                <TableCell className="text-right">{inr(c.totalEarned)}</TableCell>
                                                <TableCell className="text-right text-red-600">{inr(c.totalDeduction)}</TableCell>
                                                <TableCell className="text-right text-green-600 font-semibold">{inr(c.totalNet)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* EMPLOYEE-WISE DETAIL */}
                    <div>
                        <h3 className="text-sm font-medium mb-2">Employee-wise Detail</h3>
                        <div className="bg-card rounded border overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Gross</TableHead>
                                        <TableHead className="text-right">Earned</TableHead>
                                        <TableHead className="text-right">Deduction</TableHead>
                                        <TableHead className="text-right">Net</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.employees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                                                No employees found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        report.employees.map((e) => (
                                            <TableRow key={e.userId}>
                                                <TableCell className="font-medium">{e.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{e.employeeCode ?? "-"}</TableCell>
                                                <TableCell className="text-muted-foreground">{e.branchName}</TableCell>
                                                <TableCell className="text-muted-foreground">{e.categoryName}</TableCell>
                                                <TableCell className="text-right">{inr(e.gross)}</TableCell>
                                                <TableCell className="text-right">{inr(e.earned)}</TableCell>
                                                <TableCell className="text-right text-red-600">{inr(e.deduction)}</TableCell>
                                                <TableCell className="text-right text-green-600 font-semibold">{inr(e.net)}</TableCell>
                                                <TableCell>
                                                    <StatusBadge status={e.status} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PayrollReport;