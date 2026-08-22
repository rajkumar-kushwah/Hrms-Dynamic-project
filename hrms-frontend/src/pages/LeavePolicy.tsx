import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import type { LeaveType } from "@/types/leave.types";
import { getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from "@/services/leaveType.service";
import { useAuthStore } from "@/store/auth.store";
// import HolidayPage from "@/pages/Holiday";

const LeavePolicy = () => {
    const { user } = useAuthStore();
    const RoleName = user?.role?.name ?? "";
    const canChangeStatus = ["Employee"].includes(RoleName);

    const [leaveTypes, setLeaveTypes] = React.useState<LeaveType[]>([]);
    const [open, setOpen] = React.useState(false);
    const [editType, setEditType] = React.useState<LeaveType | null>(null);
    const [form, setForm] = React.useState({ name: "", description: "", daysPerYear: 0, isPaid: false, });

    React.useEffect(() => { loadLeaveTypes(); }, []);

    const loadLeaveTypes = async () => {
        try {
            const res = await getLeaveTypes();
            setLeaveTypes(res.data.data);
        } catch (err: any) {
            const message =
                err?.message || "Failed to load leave types";
            toast.error(message);
        }

    };

    const handleSubmit = async () => {
        if (!form.name) { toast.error("Leave type name is required"); return; }
        try {
            if (editType) {
                await updateLeaveType(editType.id, form);
                toast.success("Leave type updated!");
            } else {
                await createLeaveType(form);
                toast.success("Leave type created!");
            }
            loadLeaveTypes();
            handleClose();
        } catch (err: any) {
            toast.error(err?.message || "Failed to save leave type");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteLeaveType(id);
            toast.success("Leave type deactivated!");
            loadLeaveTypes();
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete leave type");
        }
    };

    const handleActivate = async (id: string) => {
        try {
            await updateLeaveType(id, {
                isActive: true,
            });

            toast.success("Leave type activated!");

            await loadLeaveTypes();
        } catch (err: any) {
            toast.error(
                err?.message || "Failed to activate leave type"
            );
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditType(null);
        setForm({ name: "", description: "", daysPerYear: 0, isPaid: false });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end">
                {!canChangeStatus && (
                    <Button size="sm" variant="add" onClick={() => setOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Leave Type
                    </Button>
                )}

            </div>

            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editType ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <div>
                            <Label>Name *</Label>
                            <Input placeholder="e.g. Sick Leave" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div>
                            <Label>Days Per Year</Label>
                            <Input type="number" value={form.daysPerYear} onChange={(e) => setForm({ ...form, daysPerYear: Number(e.target.value) })} />
                        </div>
                        <div className="flex items-center gap-2">
                            <input id="isPaid" type="checkbox" checked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked, })}
                                className="h-4 w-4 cursor-pointer  "
                            />
                            <Label htmlFor="isPaid">Paid Leave</Label>
                        </div>

                        <Button variant="add" className="cursor-pointer" onClick={handleSubmit}>{editType ? "Update" : "Create"}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="bg-card grid grid-cols-1 rounded border w-full overflow-hidden">
                <div className="h-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Days/Year</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="sticky right-0 bg-muted">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveTypes.map((lt, index) => (
                                <TableRow key={lt.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{lt.name}</TableCell>
                                    <TableCell>{lt.description ?? "—"}</TableCell>
                                    <TableCell>{lt.daysPerYear}</TableCell>
                                    <TableCell>
                                        <Badge className={lt.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                            {lt.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    {!canChangeStatus && (
                                        <TableCell className="sticky right-0 bg-card">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditType(lt);

                                                            setForm({
                                                                name: lt.name,
                                                                description: lt.description ?? "",
                                                                daysPerYear: lt.daysPerYear,
                                                                isPaid: lt.isPaid,
                                                            });

                                                            setOpen(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>

                                                    {lt.isActive ? (
                                                        <DropdownMenuItem variant="destructive"
                                                            onClick={() => handleDelete(lt.id)}
                                                        >
                                                            Deactivate
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            className="text-[var(--theme-primary)]"
                                                            onClick={() => handleActivate(lt.id)}
                                                        >
                                                            Activate
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {leaveTypes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No leave types found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {/* <HolidayPage /> */}
        </div>
    );
};

export default LeavePolicy;