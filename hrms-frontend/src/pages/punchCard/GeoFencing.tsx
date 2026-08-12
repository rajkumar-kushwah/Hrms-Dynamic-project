import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getGeoFencingOverview } from "@/services/branch.service";


interface GeoFenceEmployee {
    id: string;
    name: string;
    employeeCode?: string;
    isWithinGeoFence: boolean;
    punchInTime: string;
}

interface GeoFenceBranch {
    id: string;
    name: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    geoRadius?: number;
    locationName?: string;
    totalEmployees: number;
    insideFence: number;
    outsideFence: number;
    totalPunchedInToday: number;
    employees: GeoFenceEmployee[];
}

const GeoFencing = () => {
    const [branches, setBranches] = React.useState<GeoFenceBranch[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getGeoFencingOverview();
            setBranches(res.data.data);
        } catch (err: any) {
            const message =
                err?.message || "Failed to load geo fencing data";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-4">

            <div>
                <h2 className="text-lg font-semibold">Geo Fencing Overview</h2>
                <p className="text-xs text-muted-foreground">
                    Branch-wise location settings and today's attendance validation
                </p>
            </div>

            {branches.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                    No branches with location set. Add a location to your branches to enable geo fencing.
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {branches.map((branch) => (
                        <Card key={branch.id} className="p-4">
                            <CardContent className="p-0 flex flex-col gap-3">

                                {/* Branch Name */}
                                <div>
                                    <p className="font-semibold">{branch.name}</p>
                                    <p className="text-xs text-muted-foreground">{branch.city ?? "—"}</p>
                                </div>

                                {/* Location Status */}
                                {branch.latitude && branch.longitude ? (
                                    <div className="bg-muted rounded-lg p-3">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> Location Set
                                        </p>
                                        <p className="text-xs mt-1 line-clamp-2">
                                            {branch.locationName ?? `${branch.latitude.toFixed(4)}, ${branch.longitude.toFixed(4)}`}
                                        </p>
                                        <Badge variant="outline" className="mt-2">
                                            Radius: {branch.geoRadius ?? 0}m
                                        </Badge>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <p className="text-xs text-yellow-700 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            No location set — Geo Fencing disabled for this branch
                                        </p>
                                    </div>
                                )}

                                {/* Employee Count */}
                                <div className="flex items-center gap-1 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Total Employees:</span>
                                    <span className="font-medium">{branch.totalEmployees}</span>
                                </div>

                                {/* Today's Attendance Validation */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-green-50 rounded-lg p-2 flex flex-col items-center">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <p className="text-xs text-muted-foreground mt-1">Inside</p>
                                        <p className="font-bold text-green-600">{branch.insideFence}</p>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-2 flex flex-col items-center">
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <p className="text-xs text-muted-foreground mt-1">Outside</p>
                                        <p className="font-bold text-red-600">{branch.outsideFence}</p>
                                    </div>
                                </div>
                                {/* Card ke andar, Inside/Outside count ke neeche add karo: */}

                                {/* Employee List */}
                                {branch.employees.length > 0 && (
                                    <div className="border-t pt-2 mt-1">
                                        <p className="text-xs text-muted-foreground mb-2">Punched In Today</p>
                                        <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                                            {branch.employees.map((emp) => (
                                                <div key={emp.id} className="flex items-center justify-between text-xs">
                                                    <div>
                                                        <span className="font-medium">{emp.name}</span>
                                                        <span className="text-muted-foreground ml-1">({emp.employeeCode})</span>
                                                    </div>
                                                    <Badge className={emp.isWithinGeoFence
                                                        ? "bg-green-100 text-green-700 text-[10px] px-1.5 py-0"
                                                        : "bg-red-100 text-red-700 text-[10px] px-1.5 py-0"}>
                                                        {emp.isWithinGeoFence ? "Inside" : "Outside"}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-muted-foreground text-center">
                                    {branch.totalPunchedInToday} punched in today
                                </p>

                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GeoFencing;