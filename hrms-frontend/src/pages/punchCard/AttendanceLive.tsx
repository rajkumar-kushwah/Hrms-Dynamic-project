import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, Users, Clock, LogIn, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Attendance } from "@/types/attendance.types";
import { getLiveAttendance } from "@/services/attendance.service";
import { Table, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/store/auth.store";

const AttendanceLive = () => {
    const { user } = useAuthStore();
    const isAdmin = ["super_admin", "company_admin"].includes(user?.role?.name ?? "");

    const [attendances, setAttendances] = React.useState<Attendance[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [loading1, setLoading1] = React.useState(false);
    const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());

    React.useEffect(() => {
        loadLiveAttendance();
        //  Auto refresh har 60 seconds
        const interval = setInterval(() => {
            loadLiveAttendance();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadLiveAttendance = async () => {
        setLoading(true);
        setLoading1(true);
        try {
            const wait = new Promise((resolve) => setTimeout(resolve, 1000));
            await wait;
            const res = await getLiveAttendance();
            setAttendances(res.data.data);
            setLastUpdated(new Date());
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to load live attendance");
            }
        } finally {
            setLoading(false);
            setLoading1(false);
        }
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit", hour12: true
        });
    };

    const getInitials = (name?: string) =>
        name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "?";

    const getStatusColor = (status: string) => {
        if (status.startsWith("On Leave")) return "bg-blue-100 text-blue-700";
        switch (status) {
            case "Present": return "bg-green-100 text-green-700";
            case "Late": return "bg-yellow-100 text-yellow-700";
            case "Half-day": return "bg-orange-100 text-orange-700";
            case "Absent": return "bg-red-100 text-red-700";
            case "Week off": return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    //  Stats
    const totalPunchedIn = attendances.length;
    const presentCount = attendances.filter(a => a.status === "Present").length;
    const lateCount = attendances.filter(a => a.status === "Late").length;
    const stillInCount = attendances.filter(a => a.punchInTime && !a.punchOutTime).length;
    const punchedOutCount = attendances.filter(a => a.punchOutTime).length;

    return (
        <div className="flex flex-col gap-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        Live Attendance Tracking
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString("en-IN", {
                            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
                        })} — Auto refreshes every 60 seconds
                    </p>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={loadLiveAttendance}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> Total Punched In
                    </p>
                    <p className="text-2xl font-bold mt-1">{totalPunchedIn}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Present</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{presentCount}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Late</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{lateCount}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <LogIn className="h-3 w-3" /> Still In Office
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stillInCount}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <LogOut className="h-3 w-3" /> Punched Out
                    </p>
                    <p className="text-2xl font-bold text-gray-600 mt-1">{punchedOutCount}</p>
                </Card>
            </div>

            {/* Employee Cards */}
            {loading1 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableCell colSpan={isAdmin ? 7 : 6}>
                                <div className="flex items-center justify-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Loading...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                </Table>
            ) : attendances.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                    No attendance records for today yet
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {attendances.map((att) => (
                        <Card key={att.id} className="p-4">
                            <CardContent className="p-0 flex flex-col gap-3">

                                {/* Employee Info */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>
                                            {getInitials(att.user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{att.user?.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {att.user?.employeeCode ?? "—"} • {att.user?.designation ?? "—"}
                                        </p>
                                    </div>
                                    <Badge className={getStatusColor(att.status)}>
                                        {att.status}
                                    </Badge>
                                </div>

                                {/* Branch */}
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {att.branch?.name ?? "—"}
                                </p>

                                {/* Punch Times */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-muted rounded-lg p-2">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <LogIn className="h-3 w-3" /> In
                                        </p>
                                        <p className="font-medium text-sm mt-0.5">
                                            {formatTime(att.punchInTime)}
                                        </p>
                                    </div>
                                    <div className="bg-muted rounded-lg p-2">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <LogOut className="h-3 w-3" /> Out
                                        </p>
                                        <p className="font-medium text-sm mt-0.5">
                                            {formatTime(att.punchOutTime)}
                                        </p>
                                    </div>
                                </div>

                                {/* Working Hours */}
                                {att.workingHours && (
                                    <div className="bg-muted rounded-lg p-2">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Working Hours
                                        </p>
                                        <p className="font-medium text-sm mt-0.5">
                                            {Math.floor(att.workingHours)}h {Math.round((att.workingHours % 1) * 60)}m
                                        </p>
                                    </div>
                                )}

                                {/* Geo Fence Status */}
                                <Badge className={att.isWithinGeoFence
                                    ? "bg-green-100 text-green-700 w-fit"
                                    : "bg-red-100 text-red-700 w-fit"}>
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {att.isWithinGeoFence ? "Inside Geo Fence" : "Outside Geo Fence"}
                                </Badge>

                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

        </div >
    );
};

export default AttendanceLive;