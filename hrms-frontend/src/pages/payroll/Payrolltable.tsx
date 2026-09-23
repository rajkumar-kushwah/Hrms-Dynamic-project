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
} from "lucide-react";

import { toast } from "sonner";

import {
    downloadBulkSalarySlips,
} from "@/services/payroll.service";

import { downloadBlobAsFile } from "@/utilis/downloadFile";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface PayrollTableProps {
    selectedIds: Set<string>;
    month: number;
    year: number;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

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

    return Array.from(
        { length: 5 },
        (_, index) => currentYear - index
    );
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export const PayrollTable = ({
    selectedIds,
    month,
    year,
    onMonthChange,
    onYearChange,
}: PayrollTableProps) => {
    const [bulkLoading, setBulkLoading] = useState(false);

    const handleGenerateSlips = async () => {
        if (selectedIds.size === 0) {
            toast.error(
                "Please select at least one employee."
            );
            return;
        }

        setBulkLoading(true);

        try {
            const response =
                await downloadBulkSalarySlips(
                    Array.from(selectedIds),
                    month,
                    year
                );

            downloadBlobAsFile(
                response.data,
                `salary-slips-${month}-${year}.zip`
            );

            toast.success(
                "Salary slips generated successfully."
            );
        } catch (error: unknown) {
            console.error(
                "Bulk salary slip generation failed:",
                error
            );

            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error(
                    "Could not generate salary slips. Try again."
                );
            }
        } finally {
            setBulkLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">

            {/* PERIOD */}

            <div className="flex flex-wrap items-center gap-2">

                <p className="text-sm font-medium">
                    Salary Slip Period
                </p>

                {/* MONTH */}

                <Select
                    value={String(month)}
                    onValueChange={(value) =>
                        onMonthChange(Number(value))
                    }
                >
                    <SelectTrigger className="w-[145px]">
                        <SelectValue placeholder="Select month" />
                    </SelectTrigger>

                    <SelectContent position="popper">
                        {MONTHS.map((item) => (
                            <SelectItem
                                key={item.value}
                                value={String(item.value)}
                            >
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* YEAR */}

                <Select
                    value={String(year)}
                    onValueChange={(value) =>
                        onYearChange(Number(value))
                    }
                >
                    <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Select year" />
                    </SelectTrigger>

                    <SelectContent position="popper">
                        {getYearOptions().map(
                            (yearOption) => (
                                <SelectItem
                                    key={yearOption}
                                    value={String(yearOption)}
                                >
                                    {yearOption}
                                </SelectItem>
                            )
                        )}
                    </SelectContent>
                </Select>

            </div>

            {/* GENERATE */}

            <Button
                variant="add"
                onClick={handleGenerateSlips}
                disabled={
                    bulkLoading ||
                    selectedIds.size === 0
                }
                className="min-w-[210px]"
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
                        {selectedIds.size > 0 &&
                            ` (${selectedIds.size})`}
                    </>
                )}
            </Button>

        </div>
    );
};