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

const LeavePolicy = () => {
    const { user } = useAuthStore();
    const RoleName = user?.role?.name ?? "";
    const canChangeStatus = ["Employee"].includes(RoleName);

    const [leaveTypes, setLeaveTypes] = React.useState<LeaveType[]>([]);
    const [open, setOpen] = React.useState(false);
    const [editType, setEditType] = React.useState<LeaveType | null>(null);
    const [form, setForm] = React.useState({ name: "", description: "", daysPerYear: 12 });

    React.useEffect(() => { loadLeaveTypes(); }, []);

    const loadLeaveTypes = async () => {
        try {
            const res = await getLeaveTypes();
            setLeaveTypes(res.data.data);
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to load leave types");
            }
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

    const handleClose = () => {
        setOpen(false);
        setEditType(null);
        setForm({ name: "", description: "", daysPerYear: 12 });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end">
                {!canChangeStatus && (
                    <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
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
                        <Button onClick={handleSubmit}>{editType ? "Update" : "Create"}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="bg-card rounded border w-full overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted">
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
                                                <DropdownMenuItem onClick={() => {
                                                    setEditType(lt);
                                                    setForm({ name: lt.name, description: lt.description ?? "", daysPerYear: lt.daysPerYear });
                                                    setOpen(true);
                                                }}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(lt.id)}>
                                                    Deactivate
                                                </DropdownMenuItem>
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
    );
};

export default LeavePolicy;