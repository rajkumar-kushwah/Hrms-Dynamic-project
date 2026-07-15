import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getEmployeeAttendance } from "@/services/attendance.service";

const months = [
    { value: "1", label: "January" }, { value: "2", label: "February" },
    { value: "3", label: "March" }, { value: "4", label: "April" },
    { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" },
    { value: "9", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
];

// const statusColors: Record<string, string> = {
//     Present: "bg-green-500",
//     Late: "bg-yellow-500",
//     "Half-day": "bg-orange-400",
//     Absent: "bg-red-500",
//     "Week Off": "bg-blue-400",
// };

const statusBadge: Record<string, string> = {
    Present: "bg-green-100 text-green-700",
    Late: "bg-yellow-100 text-yellow-700",
    "Half-day": "bg-orange-100 text-orange-700",
    Absent: "bg-red-100 text-red-700",
    "Week Off": "bg-blue-100 text-blue-700",
};

const EmployeeAttendanceDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [attendances, setAttendances] = React.useState<any[]>([]);
    const [employee, setEmployee] = React.useState<any>(null);
    const [selectedMonth, setSelectedMonth] = React.useState(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = React.useState(String(new Date().getFullYear()));

    React.useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear]);

    const loadData = async () => {
        if (!userId) return;
        try {
            const res = await getEmployeeAttendance(userId, Number(selectedMonth), Number(selectedYear));
            setAttendances(res.data.data.attendance);
            setEmployee(res.data.data.employee);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load attendance");
        }
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit", hour12: true
        });
    };

    const formatWorkingHours = (hours?: number) => {
        if (!hours) return "—";
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    const totalPresent = attendances.filter(a => a.status === "Present").length;
    const totalLate = attendances.filter(a => a.status === "Late").length;
    const totalAbsent = attendances.filter(a => a.status === "Absent").length;
    const totalHours = attendances.reduce((acc, a) => acc + (a.workingHours ?? 0), 0);

    const getInitials = (name?: string) =>
        name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() ?? "?";

    return (
        <div className="flex flex-col gap-4">

            {/* Back Button */}
            <Button variant="ghost" size="sm" className="w-fit cursor-pointer" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Attendance List
            </Button>

            {/* Employee Header */}
            {employee && (
                <Card className="p-4 flex  gap-4">
                    <Avatar className="h-14 w-14">
                        <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {employee.employeeCode} • {employee.designation ?? "—"} • {employee.branch?.name ?? "—"}
                        </p>
                    </div>
                </Card>
            )}

            {/* Filter */}
            <div className="flex items-center gap-3">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-24"
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Present</p>
                    <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{totalLate}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
                </Card>
            </div>

            {/* Table */}
            <div className="bg-card  grid grid-cols-1 rounded border w-full overflow-x-auto">
                <Card>
                    <CardContent className="p-0">
                        <CardTitle> Mothly Attendance {selectedMonth}-{selectedYear}</CardTitle>
                        <div className="overflow-auto">
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Punch In</TableHead>
                                        <TableHead>Punch Out</TableHead>
                                        <TableHead>Working Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Geo Fence</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendances.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No records for this month
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        attendances.map((att, index) => (
                                            <TableRow key={att.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    {new Date(att.date).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", weekday: "short"
                                                    })}
                                                </TableCell>
                                                <TableCell>{formatTime(att.punchInTime)}</TableCell>
                                                <TableCell>{formatTime(att.punchOutTime)}</TableCell>
                                                <TableCell>{formatWorkingHours(att.workingHours)}</TableCell>
                                                <TableCell>
                                                    <Badge className={statusBadge[att.status] ?? "bg-gray-100 text-gray-700"}>
                                                        {att.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {att.punchInTime ? (
                                                        <Badge className={att.isWithinGeoFence
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"}>
                                                            {att.isWithinGeoFence ? "Inside" : "Outside"}
                                                        </Badge>
                                                    ) : "—"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EmployeeAttendanceDetail;