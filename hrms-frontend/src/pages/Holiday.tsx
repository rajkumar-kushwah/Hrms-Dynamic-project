import React from "react";

import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    MoreVertical,
    PlusIcon,
} from "lucide-react";

import { toast } from "sonner";

import type {
    HolidayType,
} from "@/types/holiday.types";

import {
    getHolidays,
    createHoliday,
    updateHoliday,
    activateHoliday,
    deactivateHoliday,
} from "@/services/holiday.service";

import { useAuthStore } from "@/store/auth.store";
import { isEmployeeRole } from "@/utilis/roleUtils";

const HolidayPage = () => {
    const { user } = useAuthStore();

    // Employee holiday manage nahi karega
    const canChangeStatus = !isEmployeeRole(user?.role?.name);

    const [holidays, setHolidays] = React.useState<HolidayType[]>(
        []
    );

    const [open, setOpen] = React.useState(false);

    const [editHoliday, setEditHoliday] =
        React.useState<HolidayType | null>(null);

    const [form, setForm] = React.useState({
        name: "",
        date: "",
    });

    // =========================
    // Load Holidays
    // =========================

    const loadHolidays = async () => {
        try {
            const res = await getHolidays();

            setHolidays(res.data.data);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load holidays"
            );
        }
    };

    React.useEffect(() => {
        loadHolidays();
    }, []);

    // =========================
    // Create / Update Holiday
    // =========================

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            toast.error("Holiday name is required");
            return;
        }

        if (!form.date) {
            toast.error("Holiday date is required");
            return;
        }

        try {
            if (editHoliday) {
                await updateHoliday(
                    editHoliday.id,
                    {
                        name: form.name.trim(),
                        date: form.date,
                    }
                );

                toast.success(
                    "Holiday updated successfully!"
                );
            } else {
                await createHoliday({
                    name: form.name.trim(),
                    date: form.date,
                });

                toast.success(
                    "Holiday created successfully!"
                );
            }

            await loadHolidays();

            handleClose();
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to save holiday"
            );
        }
    };

    // =========================
    // Deactivate Holiday
    // =========================

    const handleDeactivate = async (
        id: string
    ) => {
        try {
            await deactivateHoliday(id);

            toast.success(
                "Holiday deactivated successfully!"
            );

            await loadHolidays();
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to deactivate holiday"
            );
        }
    };

    // =========================
    // Activate Holiday
    // =========================

    const handleActivate = async (
        id: string
    ) => {
        try {
            await activateHoliday(id);

            toast.success(
                "Holiday activated successfully!"
            );

            await loadHolidays();
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to activate holiday"
            );
        }
    };

    // =========================
    // Close Dialog
    // =========================

    const handleClose = () => {
        setOpen(false);

        setEditHoliday(null);

        setForm({
            name: "",
            date: "",
        });
    };

    // =========================
    // Edit Holiday
    // =========================

    const handleEdit = (
        holiday: HolidayType
    ) => {
        setEditHoliday(holiday);

        setForm({
            name: holiday.name,

            date: holiday.date
                ? new Date(holiday.date)
                      .toISOString()
                      .split("T")[0]
                : "",
        });

        setOpen(true);
    };

    // =========================
    // Format Date
    // =========================

    const formatDate = (
        date: string
    ) => {
        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    return (
        <div className="flex flex-col gap-4">

            {/* =========================
                Add Holiday Button
            ========================= */}

            <div className="flex items-center justify-end">

                {canChangeStatus && (
                    <Button
                        size="sm"
                        variant="add"
                        onClick={() => {
                            setEditHoliday(null);

                            setForm({
                                name: "",
                                date: "",
                            });

                            setOpen(true);
                        }}
                    >
                        <PlusIcon className="mr-2 h-4 w-4" />

                        Add Holiday
                    </Button>
                )}

            </div>

            {/* =========================
                Add / Edit Dialog
            ========================= */}

            <Dialog
                open={open}
                onOpenChange={(value) => {
                    if (!value) {
                        handleClose();
                    }
                }}
            >
                <DialogContent>

                    <DialogHeader>
                        <DialogTitle>
                            {editHoliday
                                ? "Edit Holiday"
                                : "Add Holiday"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">

                        {/* Holiday Name */}

                        <div className="flex flex-col gap-2">

                            <Label htmlFor="holidayName">
                                Holiday Name *
                            </Label>

                            <Input
                                id="holidayName"
                                placeholder="e.g. Independence Day"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        name: e.target.value,
                                    })
                                }
                            />

                        </div>

                        {/* Holiday Date */}

                        <div className="flex flex-col gap-2">

                            <Label htmlFor="holidayDate">
                                Date *
                            </Label>

                            <Input
                                id="holidayDate"
                                type="date"
                                value={form.date}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        date: e.target.value,
                                    })
                                }
                            />

                        </div>

                        {/* Submit */}

                        <Button variant="add"
                            onClick={handleSubmit}
                        >
                            {editHoliday
                                ? "Update"
                                : "Create"}
                        </Button>

                    </div>

                </DialogContent>
            </Dialog>

            {/* =========================
                Holiday Table
            ========================= */}

            <div className="bg-card grid w-full grid-cols-1 overflow-hidden rounded border">

                <div className="h-full overflow-auto">

                    <Table>

                        <TableHeader className="bg-muted sticky top-0 z-10">

                            <TableRow>

                                <TableHead>
                                    #
                                </TableHead>

                                <TableHead>
                                    Holiday Name
                                </TableHead>

                                <TableHead>
                                    Date
                                </TableHead>

                                <TableHead>
                                    Status
                                </TableHead>

                                {canChangeStatus && (
                                    <TableHead className="bg-muted sticky right-0">
                                        Actions
                                    </TableHead>
                                )}

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {holidays.map(
                                (
                                    holiday,
                                    index
                                ) => (

                                    <TableRow
                                        key={
                                            holiday.id
                                        }
                                    >

                                        <TableCell>
                                            {index + 1}
                                        </TableCell>

                                        <TableCell>
                                            {holiday.name}
                                        </TableCell>

                                        <TableCell>
                                            {formatDate(
                                                holiday.date
                                            )}
                                        </TableCell>

                                        <TableCell>

                                            <Badge
                                                className={
                                                    holiday.isActive
                                                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                        : "bg-red-100 text-red-700 hover:bg-red-100"
                                                }
                                            >
                                                {holiday.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </Badge>

                                        </TableCell>

                                        {/* =========================
                                            Actions
                                        ========================= */}

                                        {canChangeStatus && (

                                            <TableCell className="bg-card sticky right-0">

                                                <DropdownMenu>

                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>

                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent
                                                        align="end"
                                                    >

                                                        {/* Edit */}

                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleEdit(
                                                                    holiday
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </DropdownMenuItem>

                                                        {/* Activate */}

                                                        {!holiday.isActive && (

                                                            <DropdownMenuItem
                                                                className="text-green-600"
                                                                onClick={() =>
                                                                    handleActivate(
                                                                        holiday.id
                                                                    )
                                                                }
                                                            >
                                                                Activate
                                                            </DropdownMenuItem>

                                                        )}

                                                        {/* Deactivate */}

                                                        {holiday.isActive && (

                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() =>
                                                                    handleDeactivate(
                                                                        holiday.id
                                                                    )
                                                                }
                                                            >
                                                                Deactivate
                                                            </DropdownMenuItem>

                                                        )}

                                                    </DropdownMenuContent>

                                                </DropdownMenu>

                                            </TableCell>

                                        )}

                                    </TableRow>

                                )
                            )}

                            {/* =========================
                                Empty State
                            ========================= */}

                            {holidays.length === 0 && (

                                <TableRow>

                                    <TableCell
                                        colSpan={
                                            canChangeStatus
                                                ? 4
                                                : 5
                                        }
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        No holidays found
                                    </TableCell>

                                </TableRow>

                            )}

                        </TableBody>

                    </Table>

                </div>

            </div>

        </div>
    );
};

export default HolidayPage;