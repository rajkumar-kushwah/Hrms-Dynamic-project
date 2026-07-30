import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, MoreVertical, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { LeaveRequest } from "@/types/leave.types";
import { getAllLeaveRequests, approveRejectLeave, revokeLeave } from "@/services/leaveRequest.service";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";

const LeaveApproval = () => {
    const { user } = useAuthStore();
    const RoleName = user?.role?.name.toLowerCase() ?? "";
    const isEmployee = RoleName === "employee";


    const [leaves, setLeaves] = React.useState<LeaveRequest[]>([]);
    const [statusFilter, setStatusFilter] = React.useState("Pending");
    const [rejectOpen, setRejectOpen] = React.useState(false);
    const [selectedLeave, setSelectedLeave] = React.useState<LeaveRequest | null>(null);
    const [rejectReason, setRejectReason] = React.useState("");

    //  Revoke confirmation dialog ke liye states
    const [revokeOpen, setRevokeOpen] = React.useState(false);
    const [leaveToRevoke, setLeaveToRevoke] = React.useState<LeaveRequest | null>(null);

    React.useEffect(() => { loadLeaves(); }, [statusFilter]);

    const loadLeaves = async () => {
        try {
            const res = await getAllLeaveRequests(statusFilter);
            setLeaves(res.data.data);
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to load leave requests");
            }
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

    //  Confirm dialog khole
    const openRevokeDialog = (leave: LeaveRequest) => {
        setLeaveToRevoke(leave);
        setRevokeOpen(true);
    };

    //  Actual revoke — dialog se confirm hone ke baad
    const handleRevoke = async () => {
        if (!leaveToRevoke) return;
        try {
            await revokeLeave(leaveToRevoke.id);
            toast.success("Leave revoked successfully");
            setRevokeOpen(false);
            setLeaveToRevoke(null);
            loadLeaves();
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to revoke leave");
            }
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
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Reject Dialog */}
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

            {/*  Revoke Confirmation Dialog */}
            <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-700 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> Revoke Approved Leave
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to revoke <strong>{leaveToRevoke?.user?.name}</strong>'s approved{" "}
                            <strong>{leaveToRevoke?.leaveType?.name}</strong> from{" "}
                            {leaveToRevoke && new Date(leaveToRevoke.startDate).toLocaleDateString("en-IN")} to{" "}
                            {leaveToRevoke && new Date(leaveToRevoke.endDate).toLocaleDateString("en-IN")}?
                            This will permanently delete the leave record and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setRevokeOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRevoke}>Yes, Revoke Leave</Button>
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

                                {/*  Ek hi TableCell — clean */}
                                {!isEmployee && (
                                    <TableCell>
                                        {leave.status === "Pending" && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem
                                                            onClick={() => handleApprove(leave.id)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Check className="mr-2 h-4 w-4 text-green-600" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedLeave(leave);
                                                                setRejectOpen(true);
                                                            }}
                                                            className="cursor-pointer text-red-600"
                                                        >
                                                            <X className="mr-2 h-4 w-4" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}

                                        {leave.status === "Approved" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600"
                                                onClick={() => openRevokeDialog(leave)}
                                            >
                                                Revoke
                                            </Button>
                                        )}
                                    </TableCell>
                                )}
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