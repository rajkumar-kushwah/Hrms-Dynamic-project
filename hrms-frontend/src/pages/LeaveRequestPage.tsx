import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, X } from "lucide-react";
import { toast } from "sonner";
import type { LeaveRequest, LeaveType } from "@/types/leave.types";
import { getMyLeaveRequests, createLeaveRequest, cancelLeaveRequest } from "@/services/leaveRequest.service";
import { getLeaveTypes } from "@/services/leaveType.service";
import { useAuthStore } from "@/store/auth.store";

const LeaveRequestPage = () => {
    const { user } = useAuthStore();
    const RoleName = user?.role?.name ?? "";
    const canChangeStatus = ["super_admin", "company_admin"].includes(RoleName);


    const [leaves, setLeaves] = React.useState<LeaveRequest[]>([]);
    const [leaveTypes, setLeaveTypes] = React.useState<LeaveType[]>([]);
    const [open, setOpen] = React.useState(false);
    const [form, setForm] = React.useState({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });

    React.useEffect(() => {
        loadLeaves();
        loadLeaveTypes();
    }, []);

    const loadLeaves = async () => {
        try {
            const res = await getMyLeaveRequests();
            setLeaves(res.data.data);
        } catch (err: any) {
            const message =
                err?.message || "Failed to load leaves";
            toast.error(message);
        }
    };

    const loadLeaveTypes = async () => {
        try {
            const res = await getLeaveTypes();
            setLeaveTypes(res.data.data.filter((lt: LeaveType) => lt.isActive));
        } catch (err: any) {
            const message =
                err?.message || "Failed to load leave types";
            toast.error(message);
        }

    };

    const handleSubmit = async () => {
        if (!form.leaveTypeId || !form.startDate || !form.endDate) {
            toast.error("Please fill all required fields");
            return;
        }
        try {
            await createLeaveRequest(form);
            toast.success("Leave request submitted successfully!");
            loadLeaves();
            setOpen(false);
            setForm({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
        } catch (err: any) {
            const message =
                err?.message || "Failed to submit leave request";
            toast.error(message);
        }

    };

    const handleCancel = async (id: string) => {
        try {
            await cancelLeaveRequest(id);
            toast.success("Leave request cancelled");
            loadLeaves();
        } catch (err: any) {
            const message =
                err?.message || "Failed to cancel leave request";
            toast.error(message);
        }

    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved": return "bg-green-100 text-green-700";
            case "Rejected": return "bg-red-100 text-red-700";
            default: return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end">
                {!canChangeStatus &&
                    <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Apply Leave
                    </Button>}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
                    <DialogDescription>Fill out the form below to apply for leave.</DialogDescription>
                    <div className="flex flex-col gap-3">
                        <div>
                            <Label>Leave Type *</Label>
                            <Select value={form.leaveTypeId} onValueChange={(val) => setForm({ ...form, leaveTypeId: val })}>
                                <SelectTrigger><SelectValue placeholder="Select Leave Type" /></SelectTrigger>
                                <SelectContent position="popper">
                                    {leaveTypes.map((lt) => (
                                        <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Start Date *</Label>
                                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                            </div>
                            <div className="flex-1">
                                <Label>End Date *</Label>
                                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <Label>Reason</Label>
                            <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Optional" />
                        </div>
                        <Button onClick={handleSubmit}>Submit Request</Button>
                    </div>
                </DialogContent>
            </Dialog>


            <div className="bg-card  grid grid-cols-1 rounded border w-full overflow-x-auto">
                <Table className="table-auto">
                    <TableHeader className="bg-muted rounded-lg">
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Leave Type</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaves.map((leave, index) => (
                            <TableRow key={leave.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{leave.leaveType?.name}</TableCell>
                                <TableCell>{new Date(leave.startDate).toLocaleDateString("en-IN")}</TableCell>
                                <TableCell>{new Date(leave.endDate).toLocaleDateString("en-IN")}</TableCell>
                                <TableCell>{leave.totalDays}</TableCell>
                                <TableCell>{leave.reason ?? "—"}</TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                                    {leave.status === "Rejected" && leave.rejectReason && (
                                        <p className="text-xs text-red-500 mt-1">{leave.rejectReason}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {leave.status === "Pending" && (
                                        <Button className=" cursor-pointer" variant="destructive" size="sm" onClick={() => handleCancel(leave.id)}>
                                            <X className="h-4 w-4 text-red-500" />
                                            Reject
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {leaves.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                    No leave requests found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

        </div>
    );
};

export default LeaveRequestPage;