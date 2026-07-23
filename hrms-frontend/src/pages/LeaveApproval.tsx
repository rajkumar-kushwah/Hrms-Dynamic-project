import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import type { LeaveRequest } from "@/types/leave.types";
import { getAllLeaveRequests, approveRejectLeave } from "@/services/leaveRequest.service";
// import { useAuthStore } from "@/store/auth.store";

const LeaveApproval = () => {
    
        // const { user } = useAuthStore();
        // const isAdmin = ["super_admin", "company_admin"].includes(user?.role?.name ?? "");

    const [leaves, setLeaves] = React.useState<LeaveRequest[]>([]);
    const [statusFilter, setStatusFilter] = React.useState("Pending");
    const [rejectOpen, setRejectOpen] = React.useState(false);
    const [selectedLeave, setSelectedLeave] = React.useState<LeaveRequest | null>(null);
    const [rejectReason, setRejectReason] = React.useState("");

    React.useEffect(() => { loadLeaves(); }, [statusFilter]);

    const loadLeaves = async () => {
        try {
            const res = await getAllLeaveRequests(statusFilter);
            setLeaves(res.data.data);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load leave requests");
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await approveRejectLeave(id, "Approved");
            toast.success("Leave approved!");
            loadLeaves();
        } catch (err: any) {
            toast.error(err?.message || "Failed to approve leave");
        }
    };

    const handleReject = async () => {
        if (!selectedLeave) return;
        try {
            await approveRejectLeave(selectedLeave.id, "Rejected", rejectReason);
            toast.success("Leave rejected");
            setRejectOpen(false);
            setRejectReason("");
            loadLeaves();
        } catch (err: any) {
            toast.error(err?.message || "Failed to reject leave");
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
            <div className="flex items-center gap-3">
                <Label>Filter:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Reject Leave — {selectedLeave?.user?.name}</DialogTitle></DialogHeader>
                    <div className="flex flex-col gap-3">
                        <Label>Reason for Rejection</Label>
                        <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Optional" />
                        <Button variant="destructive" onClick={handleReject}>Reject Leave</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="bg-card rounded border w-full overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Employee</TableHead>
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
                                <TableCell>
                                    <p className="font-medium">{leave.user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{leave.user?.employeeCode}</p>
                                </TableCell>
                                <TableCell>{leave.leaveType?.name}</TableCell>
                                <TableCell>{new Date(leave.startDate).toLocaleDateString("en-IN")}</TableCell>
                                <TableCell>{new Date(leave.endDate).toLocaleDateString("en-IN")}</TableCell>
                                <TableCell>{leave.totalDays}</TableCell>
                                <TableCell>{leave.reason ?? "—"}</TableCell>
                                <TableCell><Badge className={getStatusColor(leave.status)}>{leave.status}</Badge></TableCell>
                                <TableCell>
                                    {leave.status === "Pending" && (
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => handleApprove(leave.id)}>
                                                <Check className="h-4 w-4 text-green-600" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => { setSelectedLeave(leave); setRejectOpen(true); }}>
                                                <X className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {leaves.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
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

export default LeaveApproval;