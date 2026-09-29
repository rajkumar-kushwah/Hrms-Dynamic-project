// components/payroll/PayrollReport.tsx
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { getMonthlyPayrollReport } from "../../services/payrollreport.service";

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
    };
    byBranch: GroupTotals[];
    byCategory: GroupTotals[];
    employees: EmployeeRow[];
}

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const inr = (n: number) =>
    `₹ ${n.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const selectClass =
    "bg-[#1a1a1a] text-white text-sm border border-[#333] rounded-md px-2 py-1.5 focus:outline-none focus:border-[#a3e635]";

// ─────────────────────────────────────────
// Small reusable pieces
// ─────────────────────────────────────────

const StatCard = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
);

const GroupTable = ({
    title,
    rows,
}: {
    title: string;
    rows: GroupTotals[];
}) => (
    <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-2">{title}</h3>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b border-[#333] text-left text-gray-400">
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3 text-right">Employees</th>
                        <th className="py-2 px-3 text-right">Gross</th>
                        <th className="py-2 px-3 text-right">Earned</th>
                        <th className="py-2 px-3 text-right">Deduction</th>
                        <th className="py-2 px-3 text-right">Net Payable</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={6} className="py-4 px-3 text-gray-500">
                                No data
                            </td>
                        </tr>
                    )}
                    {rows.map((r) => (
                        <tr key={r.id ?? r.name} className="border-b border-[#222]">
                            <td className="py-2 px-3">{r.name}</td>
                            <td className="py-2 px-3 text-right">{r.employeeCount}</td>
                            <td className="py-2 px-3 text-right">{inr(r.totalGross)}</td>
                            <td className="py-2 px-3 text-right">{inr(r.totalEarned)}</td>
                            <td className="py-2 px-3 text-right text-red-400">
                                {inr(r.totalDeduction)}
                            </td>
                            <td className="py-2 px-3 text-right text-[#a3e635]">
                                {inr(r.totalNet)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export const PayrollReport = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const yearOptions = Array.from(
        { length: 5 },
        (_, i) => new Date().getFullYear() - i
    );

    useEffect(() => {
        // cancelled flag: month/year jaldi badalne par purana response naye ko overwrite na kare
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getMonthlyPayrollReport(month, year);
                if (!cancelled) setReport(res.data);
            } catch (err) {
                console.error("Failed to load payroll report:", err);
                if (!cancelled) {
                    setError("Could not load payroll report.");
                    setReport(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();

        return () => {
            cancelled = true;
        };
    }, [month, year]);

    // ─────────────────────────────────────
    // Excel export (3 sheets)
    // ─────────────────────────────────────

    const handleExport = () => {
        if (!report) return;

        const wb = XLSX.utils.book_new();

        // Column width: header ya sabse lambi value ke hisaab se
        const fitColumns = (rows: Record<string, string | number>[]) => {
            if (rows.length === 0) return [];
            return Object.keys(rows[0]).map((key) => ({
                wch:
                    Math.max(
                        key.length,
                        ...rows.map((r) => String(r[key] ?? "").length)
                    ) + 2,
            }));
        };

        const makeSheet = (rows: Record<string, string | number>[]) => {
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = fitColumns(rows);
            return ws;
        };

        const sum = <T,>(items: T[], pick: (i: T) => number) =>
            Number(items.reduce((s, i) => s + pick(i), 0).toFixed(2));

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

        // Employees: branch, phir category, phir naam ke hisaab se sorted
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
            },
        ];

        XLSX.utils.book_append_sheet(wb, makeSheet(groupRows(report.byBranch)), "By Branch");
        XLSX.utils.book_append_sheet(wb, makeSheet(groupRows(report.byCategory)), "By Category");
        XLSX.utils.book_append_sheet(wb, makeSheet(employeeRows), "Employees");

        XLSX.writeFile(wb, `payroll-report-${month}-${year}.xlsx`);
    };

    return (
        <div className="bg-black text-white p-4">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                <h2 className="text-lg font-semibold">Monthly Payroll Report</h2>

                <div className="flex items-center gap-2">
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className={selectClass}
                    >
                        {MONTHS.map((label, i) => (
                            <option key={label} value={i + 1}>
                                {label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className={selectClass}
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleExport}
                        disabled={!report || loading}
                        className="bg-[#a3e635] text-black text-sm font-medium rounded-md px-4 py-1.5 hover:bg-[#bef264] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Export Excel
                    </button>
                </div>
            </div>

            {loading && <div className="text-gray-400 text-sm">Loading...</div>}
            {error && <div className="text-red-400 text-sm">{error}</div>}

            {report && !loading && (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        <StatCard
                            label="Employees"
                            value={String(report.totals.employeeCount)}
                        />
                        <StatCard label="Total Gross" value={inr(report.totals.totalGross)} />
                        <StatCard label="Total Earned" value={inr(report.totals.totalEarned)} />
                        <StatCard
                            label="Total Deduction"
                            value={inr(report.totals.totalDeduction)}
                        />
                        <StatCard
                            label="Total Disbursed (Net)"
                            value={inr(report.totals.totalNet)}
                        />
                    </div>

                    <GroupTable title="Branch-wise Summary" rows={report.byBranch} />
                    <GroupTable title="Category-wise Summary" rows={report.byCategory} />

                    {/* Employee detail */}
                    <h3 className="text-sm font-medium text-gray-300 mb-2">
                        Employee-wise Detail
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-[#333] text-left text-gray-400">
                                    <th className="py-2 px-3">Employee</th>
                                    <th className="py-2 px-3">Code</th>
                                    <th className="py-2 px-3">Branch</th>
                                    <th className="py-2 px-3">Category</th>
                                    <th className="py-2 px-3 text-right">Gross</th>
                                    <th className="py-2 px-3 text-right">Earned</th>
                                    <th className="py-2 px-3 text-right">Deduction</th>
                                    <th className="py-2 px-3 text-right">Net</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.employees.map((e) => (
                                    <tr key={e.userId} className="border-b border-[#222] hover:bg-[#111]">
                                        <td className="py-2 px-3">{e.name}</td>
                                        <td className="py-2 px-3 text-gray-400">
                                            {e.employeeCode ?? "-"}
                                        </td>
                                        <td className="py-2 px-3 text-gray-400">{e.branchName}</td>
                                        <td className="py-2 px-3 text-gray-400">{e.categoryName}</td>
                                        <td className="py-2 px-3 text-right">{inr(e.gross)}</td>
                                        <td className="py-2 px-3 text-right">{inr(e.earned)}</td>
                                        <td className="py-2 px-3 text-right text-red-400">
                                            {inr(e.deduction)}
                                        </td>
                                        <td className="py-2 px-3 text-right text-[#a3e635]">
                                            {inr(e.net)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};