// pages/payroll/Payrolltable.tsx
import { useState } from "react";

import { Button } from "@/components/ui/button";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    FileDown,
    Loader2,
    CheckCircle2,
    Banknote,
    Undo2,
} from "lucide-react";

import { toast } from "sonner";

import {
    downloadBulkSalarySlips,
    confirmPayroll,
    markPayrollAsPaid,
    revertPayrollToDraft,
} from "@/services/payroll.service";

import { downloadBlobAsFile } from "@/utilis/downloadFile";




interface PayrollTableProps {
    selectedIds: Set<string>;
    month: number;
    year: number;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
    selectedDraftEmployees: { userId: string; user: { name: string } }[];
    selectedConfirmedEmployees: { userId: string; user: { name: string } }[];

    // ── status-workflow additions ──
    // IDs among the current selection that are eligible for each
    // action (computed by the parent page from payrollData, since
    // this toolbar doesn't hold the payroll rows itself).
    selectedDraftIds: string[];
    selectedConfirmedIds: string[];
    onActionComplete: () => void; // parent re-fetches payroll after any status change
}


// Constants


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
    return Array.from({ length: 5 }, (_, index) => currentYear - index);
};


// Component


export const PayrollTable = ({
    selectedIds,
    month,
    year,
    onMonthChange,
    onYearChange,
    selectedDraftIds,
    selectedConfirmedIds,
    selectedDraftEmployees,
    selectedConfirmedEmployees,
    onActionComplete,
}: PayrollTableProps) => {
    const [bulkLoading, setBulkLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<
        "confirm" | "mark-paid" | "revert" | null
    >(null);


    // Generate slips 
    const handleGenerateSlips = async () => {
        if (selectedIds.size === 0) {
            toast.error("Please select at least one employee.");
            return;
        }

        setBulkLoading(true);
        try {
            const response = await downloadBulkSalarySlips(
                Array.from(selectedIds),
                month,
                year
            );
            downloadBlobAsFile(response.data, `salary-slips-${month}-${year}.zip`);
            toast.success("Salary slips generated successfully.");
        } catch (error: any) {
            toast.error(
                error?.message || "Failed to generate salary slips"
            )

        } finally {
            setBulkLoading(false);
        }
    };


    // Status workflow actions (new)


    const handleConfirm = async () => {
        if (selectedDraftIds.length === 0) return;
        const names = selectedDraftEmployees.map((emp) => emp.user.name).join(", ");
        setActionLoading("confirm");
        try {
            await confirmPayroll(selectedDraftIds, month, year);
            toast.success(`${selectedDraftIds.length} payroll(s) confirmed by ${names}.`);
            onActionComplete();
        } catch (error: any) {
            toast.error(error?.message || "Failed to confirm payroll");
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkPaid = async () => {
        if (selectedConfirmedIds.length === 0) return;
        const names = selectedConfirmedEmployees.map((emp) => emp.user.name).join(", ");
        setActionLoading("mark-paid");
        try {
            await markPayrollAsPaid(selectedConfirmedIds, month, year);
            toast.success(`${selectedConfirmedIds.length} payroll(s) marked as paid by ${names}.`);
            onActionComplete();
        } catch (error: any) {
            toast.error(error?.message || "Failed to mark payroll as paid");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRevert = async () => {
        if (selectedConfirmedIds.length === 0) return;
        const names = selectedConfirmedEmployees.map((emp) => emp.user.name).join(", ");
        setActionLoading("revert");
        try {
            await Promise.all(
                selectedConfirmedIds.map((userId) =>
                    revertPayrollToDraft(userId, month, year)
                )
            );
            toast.success(`Payroll(s) reverted to draft by ${names}.`);
            onActionComplete();
        } catch (error: any) {
            toast.error(error?.message || "Failed to revert payroll");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between flex-wrap">

            {/* PERIOD */}
            <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">Period</p>

                <Select value={String(month)} onValueChange={(value) => onMonthChange(Number(value))}>
                    <SelectTrigger className="w-[145px]">
                        <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        {MONTHS.map((item) => (
                            <SelectItem key={item.value} value={String(item.value)}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={String(year)} onValueChange={(value) => onYearChange(Number(value))}>
                    <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        {getYearOptions().map((yearOption) => (
                            <SelectItem key={yearOption} value={String(yearOption)}>
                                {yearOption}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap items-center gap-2">

                <Button className="cursor-pointer"
                    variant="add"
                    onClick={handleConfirm}
                    disabled={selectedDraftIds.length === 0 || actionLoading !== null}
                    title={selectedDraftIds.length === 0 ? "Select Draft rows to confirm" : ""}
                    >
                    {actionLoading === "confirm" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Confirm{selectedDraftIds.length > 0 && ` (${selectedDraftIds.length})`}
                </Button>

                <Button className="cursor-pointer"
                    variant="add"
                    onClick={handleMarkPaid}
                    disabled={selectedConfirmedIds.length === 0 || actionLoading !== null}
                    title={selectedConfirmedIds.length === 0 ? "Select Confirmed rows to mark paid" : ""}
                >
                    {actionLoading === "mark-paid" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Banknote className="mr-2 h-4 w-4" />
                    )}
                    Mark Paid{selectedConfirmedIds.length > 0 && ` (${selectedConfirmedIds.length})`}
                </Button>

                <Button className="cursor-pointer"
                    variant="add"
                    onClick={handleRevert}
                    disabled={selectedConfirmedIds.length === 0 || actionLoading !== null}
                    title={selectedConfirmedIds.length === 0 ? "Select Confirmed rows to revert" : ""}
                >
                    {actionLoading === "revert" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Undo2 className="mr-2 h-4 w-4" />
                    )}
                    Revert
                </Button>

                <Button
                    variant="add"
                    onClick={handleGenerateSlips}
                    disabled={bulkLoading || selectedIds.size === 0}
                    className="min-w-[210px] cursor-pointer"
                >
                    {bulkLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <FileDown className="mr-2 h-4 w-4" />
                            Generate Salary Slips
                            {selectedIds.size > 0 && ` (${selectedIds.size})`}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};