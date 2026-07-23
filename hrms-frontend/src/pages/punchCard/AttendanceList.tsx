import React from "react";
import { Card, CardContent, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Attendance } from "@/types/attendance.types";
import { getAllAttendance, getMyAttendance } from "@/services/attendance.service";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
// };

const statusBadge: Record<string, string> = {
    Present: "bg-green-100 text-green-700",
    Late: "bg-yellow-100 text-yellow-700",
    "Half-day": "bg-orange-100 text-orange-700",
    Absent: "bg-red-100 text-red-700",
    Weekoff: "bg-gray-100 text-gray-700",
};


const MyAttendance = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isAdmin = ["super_admin", "company_admin"].includes(user?.role?.name ?? "");

    const [loading, setLoading] = React.useState(true);
    const [loading1, setLoading1] = React.useState(true);
    const [attendances, setAttendances] = React.useState<Attendance[]>([]);
    const [selectedMonth, setSelectedMonth] = React.useState(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = React.useState(String(new Date().getFullYear()));
    const [filterDate, setFilterDate] = React.useState(
        new Date().toISOString().split("T")[0]
    );


    //  Frontend side filtering — API se sab lo, phir filter karo
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [branchFilter, setBranchFilter] = React.useState("all");



    React.useEffect(() => {
        loadAttendance();
    }, [filterDate, selectedMonth, selectedYear, isAdmin]);

    const loadAttendance = async () => {
        setLoading(true);
        setLoading1(true);

        try {
            // waiting 
            const wait = new Promise((resolve) => setTimeout(resolve, 1000));
            await wait;
            if (isAdmin) {
                const res = await getAllAttendance(filterDate);
                setAttendances(res.data.data);
            } else {
                const res = await getMyAttendance(
                    Number(selectedMonth),
                    Number(selectedYear)
                );
                setAttendances(res.data.data);
            }
        } catch (err) {
            console.log(err);
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to load attendance");
            }
        } finally {
            setLoading(false);
            setLoading1(false);
        }
    }

    // filter attendance
    const filterAttendances = attendances.filter((att) => {
        const matchSearch = searchQuery
            ? att.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            att.user.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
            : true;

        const matchStatus = statusFilter !== "all" ? att.status === statusFilter : true;
        const matchBranch = branchFilter !== "all" ? att.branchId === branchFilter : true;

        return matchSearch && matchStatus && matchBranch;

    })

    //  Summary Stats
    const totalPresent = attendances.filter(a => a.status === "Present").length;
    const totalLate = attendances.filter(a => a.status === "Late").length;
    const totalHalfDay = attendances.filter(a => a.status === "Half-day").length;
    const totalAbsent = attendances.filter(a => a.status === "Absent").length;
    const totalHours = attendances.reduce((acc, a) => acc + (a.workingHours ?? 0), 0);
    const avgHours = attendances.length > 0 ? (totalHours / attendances.length).toFixed(1) : "0";



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



    return (
        <div className="flex flex-col gap-4">

            {/* Filter */}
            {/* <div className="flex items-center gap-3">
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
            </div> */}
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">


                <h2>Filter By Date</h2>


                {/* Date — Admin only */}
                {isAdmin && (
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-40"
                    />
                )}

                {/* Month + Year — Employee only */}
                {!isAdmin && (
                    <>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper">
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
                    </>
                )}

                {/* Search — Admin only */}
                {isAdmin && (
                    <Input
                        placeholder="Search employee name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-56"
                    />
                )}

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Late">Late</SelectItem>
                        <SelectItem value="Half-day">Half-day</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                    </SelectContent>
                </Select>

                {/* Branch Filter — Admin only */}
                {isAdmin && (
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="All Branches" />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start">
                            <SelectItem value="all">All Branches</SelectItem>
                            {/* Unique branches from attendance data */}
                            {[...new Map(attendances
                                .filter(a => a.branch)
                                .map(a => [a.branchId, a.branch])
                            ).values()].map((branch) => (
                                <SelectItem key={branch!.id} value={branch!.id}>
                                    {branch!.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <Button
                    variant="outline"
                    onClick={loadAttendance}
                    disabled={loading}
                    className=" cursor-pointer"
                >
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Present</p>
                    <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{totalLate}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Half Day</p>
                    <p className="text-2xl font-bold text-orange-500">{totalHalfDay}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Avg Hours/Day</p>
                    <p className="text-2xl font-bold">{avgHours}h</p>
                </Card>
            </div>


            {/* Full Month Table */}
            <div className="bg-card  grid grid-cols-1 rounded border w-full overflow-x-auto">
                <Card className='table-auto'>
                    <CardContent className="p-0 min-w-full">
                        <div className="overflow-auto">
                            <Table>
                                <TableHeader className="bg-muted rounded-lg">
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        {isAdmin && <TableHead className="min-w-37.5">Employee</TableHead>}
                                        {isAdmin && <TableHead>Branch</TableHead>}
                                        <TableHead>Date</TableHead>
                                        <TableHead>Punch In</TableHead>
                                        <TableHead>Punch Out</TableHead>
                                        <TableHead>Working Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Geo Fence</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>


                                    {loading1 ? (
                                        <TableRow >
                                            <TableCell
                                                colSpan={isAdmin ? 9 : 6}
                                                className=" text-center"
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className={`h-4 w-4 mr-2 ${loading1 ? "animate-spin" : ""}`} />
                                                    <span>Loading attendance...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : attendances.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No records for this month
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filterAttendances.map((att, index) => (
                                            <TableRow
                                                key={att.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => {
                                                    if (isAdmin) {
                                                        navigate(`/attendance/employee/${att.userId}`);
                                                    }
                                                }}

                                            >
                                                <TableCell>{index + 1}</TableCell>
                                                {isAdmin && (
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{att.user?.name}</p>
                                                            <p className="text-xs text-muted-foreground">{att.user?.employeeCode}</p>
                                                        </div>
                                                    </TableCell>
                                                )}
                                                {isAdmin && (
                                                    <TableCell>{att.branch?.name ?? "—"}</TableCell>
                                                )}

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
                                                    <Badge className={att.isWithinGeoFence
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"}>
                                                        {att.isWithinGeoFence ? "Inside" : "Outside"}
                                                    </Badge>
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
        </div >
    );
};

export default MyAttendance;