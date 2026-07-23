
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import type { Attendance } from '@/types/attendance.types';
import { punchIn, punchOut, getTodayAttendance } from "@/services/attendance.service";
import { Clock, MapPin, LogIn, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import React from 'react'
import { Button } from '@/components/ui/button';




function PunchCard() {
    const [attendance, setAttendance] = React.useState<Attendance | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [fetching, setFetching] = React.useState(true);
    const [currentTime, setCurrentTime] = React.useState(new Date());


    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    React.useEffect(() => {
        loadTodayAttendance();
    }, []);


    const loadTodayAttendance = async () => {
        try {
            const res = await getTodayAttendance();
            setAttendance(res.data.data);
        } catch (err) {
            console.log(err as Error);
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to load today's attendance");
            }
        } finally {
            setFetching(false);
        }
    }

    // GPS Location get kro
    const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }),
                (_error) => reject(new Error("Failed to get location — please allow location access")),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    };

    // punch-in
    const handlePunchIn = async () => {
        setLoading(true);
        try {
            const location = await getCurrentLocation();
            const res = await punchIn(location);
            setAttendance(res.data.data);
            toast.success(res.data.message);
        } catch (err: any) {
            toast.error(err?.message || "Failed to punch in");
        } finally {
            setLoading(false);
        }
    }

    // punch-out
    const handlePunchOut = async () => {
        setLoading(true);
        try {
            const location = await getCurrentLocation();
            const res = await punchOut(location);
            setAttendance(res.data.data);
            toast.success(res.data.message);
        } catch (err: any) {
            toast.error(err?.message || "Failed to punch out");
        } finally {
            setLoading(false);
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

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "Present": return "bg-green-100 text-green-700";
            case "Late": return "bg-yellow-100 text-yellow-700";
            case "Half-day": return "bg-orange-100 text-orange-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };


    if (fetching) return (
        <Card className="p-4">
            <div className="flex items-center justify-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        </Card>
    );

    return (

        <div>
            <Card className='p-4 border rounded-xl'>
                <CardContent className="p-0 flex flex-col gap-4" >
                    {/* Live clock */}
                    <div className='flex items-center justify-between' >
                        <div>
                            <CardTitle className='bg-card text-sm text-muted-foreground' >Today's Attendance</CardTitle>
                            <CardDescription>Live clock</CardDescription>
                            <p className='text-2xl font-bold mt-1'>
                                {currentTime.toLocaleTimeString("en-IN", {
                                    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
                                })}
                            </p>
                            <p className='bg-card text-xs text-muted-foreground'>
                                {currentTime.toLocaleDateString("en-IN", {
                                    weekday: "long", day: "numeric", month: "long", year: "numeric"
                                })}
                            </p>
                        </div>
                        {/*  Status Badge */}
                        {attendance?.status && (
                            <Badge className={getStatusColor(attendance.status)}>
                                {attendance.status}
                            </Badge>
                        )}
                    </div>

                    {/* Punch In/Out Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted rounded-lg p-3 ">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <LogIn className="h-3 w-3" /> Punch In
                            </p>
                            <p className="font-semibold mt-1">{formatTime(attendance?.punchInTime)}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                            <p className="text-xs text-muted-foreground flex items-center gap-1 ">
                                <LogOut className="h-3 w-3" /> Punch Out
                            </p>
                            <p className="font-semibold mt-1">{formatTime(attendance?.punchOutTime)}</p>
                        </div>
                    </div>

                    {/* Working Hours */}
                    {attendance?.workingHours && (
                        <div className="bg-muted rounded-lg p-3">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Working Hours
                            </p>
                            <p className="font-semibold mt-1">{formatWorkingHours(attendance.workingHours)}</p>
                        </div>
                    )}
                    {/* Geo Fence Warning */}
                    {attendance && !attendance.isWithinGeoFence && (
                        <div className=" bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-xs text-red-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Attendance marked outside branch location
                            </p>
                        </div>
                    )}

                    {/* Punch In/Out Button */}
                    <div className='flex gap-2'>
                        {!attendance?.punchInTime && (
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                                onClick={handlePunchIn}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <LogIn className="mr-2 h-4 w-4" />
                                )}
                                Punch In
                            </Button>
                        )}
                        {attendance?.punchInTime && !attendance?.punchOutTime && (
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
                                onClick={handlePunchOut}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
                                Punch Out
                            </Button>
                        )}

                        {attendance?.punchInTime && attendance?.punchOutTime && (
                            <div className="flex-1 text-center text-sm text-muted-foreground py-2">
                                Attendance complete for today
                            </div>
                        )}

                    </div>

                </CardContent>
            </Card>

        </div>

    )
}

export default PunchCard
