import React from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
    getOnboardingList,
    startOnboarding,
} from "@/services/onboarding.service";
import { useNavigate } from "react-router-dom";

type OnboardingStatus = "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";

type OnboardingEmployee = {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string;
        employeeCode: string | null;
        designation: string | null;
    };
    currentStage: string;
    status: OnboardingStatus;
    startDate: string;
    targetDate: string | null;
    completedAt: string | null;
    progressPercent: number;
};

const OnboardingList = () => {
    const navigate = useNavigate();
    const [onboardings, setOnboardings] = React.useState<OnboardingEmployee[]>(
        []
    );
    
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [loading, setLoading] = React.useState(false);

    const loadOnboardings = async () => {
        try {
            setLoading(true);

            const res = await getOnboardingList();

            setOnboardings(res.data);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load onboarding records");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadOnboardings();
    }, []);

    const handleStatusFilter = async (value: string) => {
        setStatusFilter(value);

        try {
            setLoading(true);

            const res = await getOnboardingList(
                value === "all" ? undefined : value
            );

            console.log("ONBOARDING RESPONSE:", res);
            setOnboardings(res.data ?? []);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load onboarding records");
        } finally {
            setLoading(false);
        }
    };

    const handleStartOnboarding = async (userId: string) => {
        try {
            await startOnboarding(userId);

            toast.success("Onboarding started successfully");

            await loadOnboardings();
        } catch (err: any) {
            toast.error(err?.message || "Failed to start onboarding");
        }
    };

    const filteredOnboardings = onboardings.filter((item) => {
        const search = searchQuery.toLowerCase();

        return (
            item.user.name.toLowerCase().includes(search) ||
            (item.user.employeeCode ?? "").toLowerCase().includes(search) ||
            (item.user.designation ?? "").toLowerCase().includes(search)
        );
    });

    const getStatusBadge = (status: OnboardingStatus) => {
        if (status === "COMPLETED") {
            return (
                <Badge className="bg-green-100 text-green-700">
                    Completed
                </Badge>
            );
        }

        if (status === "ON_HOLD") {
            return (
                <Badge className="bg-yellow-100 text-yellow-700">
                    On Hold
                </Badge>
            );
        }

        return (
            <Badge className="bg-blue-100 text-blue-700">
                In Progress
            </Badge>
        );
    };

    const getStageBadge = (stage: string) => {
        return (
            <Badge variant="outline">
                {stage.replace("_", " ")}
            </Badge>
        );
    };

    const formatDate = (date?: string | null) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN");
    };

    return (
        <div className="flex flex-col gap-4">

            {/* Filters */}
            <div className="flex items-center justify-between gap-3 flex-wrap">

                <div className="flex items-center gap-3 flex-wrap">

                    <Input
                        type="search"
                        placeholder="Search name, code or designation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoComplete="off"
                        className="w-72"
                    />

                    <Select
                        value={statusFilter}
                        onValueChange={handleStatusFilter}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>

                        <SelectContent position="popper">
                            <SelectItem value="all">
                                All Status
                            </SelectItem>

                            <SelectItem value="IN_PROGRESS">
                                In Progress
                            </SelectItem>

                            <SelectItem value="ON_HOLD">
                                On Hold
                            </SelectItem>

                            <SelectItem value="COMPLETED">
                                Completed
                            </SelectItem>
                        </SelectContent>
                    </Select>

                </div>

            </div>

            {/* Table */}
            <div className="bg-card grid grid-cols-1 rounded border w-full overflow-hidden">

                <div className="h-full overflow-auto">

                    <Table>

                        <TableHeader className="bg-muted sticky top-0 z-10">

                            <TableRow>

                                <TableHead>#</TableHead>

                                <TableHead className="min-w-25">
                                    Code
                                </TableHead>

                                <TableHead className="min-w-37.5">
                                    Employee
                                </TableHead>

                                <TableHead className="min-w-35">
                                    Designation
                                </TableHead>

                                <TableHead className="min-w-30">
                                    Current Stage
                                </TableHead>

                                <TableHead className="min-w-25">
                                    Progress
                                </TableHead>

                                <TableHead className="min-w-30">
                                    Status
                                </TableHead>

                                <TableHead className="min-w-30">
                                    Start Date
                                </TableHead>

                                <TableHead className="min-w-30">
                                    Target Date
                                </TableHead>

                                <TableHead className="sticky right-0 bg-muted">
                                    Actions
                                </TableHead>

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {filteredOnboardings.map((item, index) => (

                                <TableRow key={item.id}>

                                    <TableCell>
                                        {index + 1}
                                    </TableCell>

                                    <TableCell>
                                        {item.user.employeeCode ?? "—"}
                                    </TableCell>

                                    <TableCell>
                                        {item.user.name}
                                    </TableCell>

                                    <TableCell>
                                        {item.user.designation ?? "—"}
                                    </TableCell>

                                    <TableCell>
                                        {getStageBadge(item.currentStage)}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {item.progressPercent}%
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {getStatusBadge(item.status)}
                                    </TableCell>

                                    <TableCell>
                                        {formatDate(item.startDate)}
                                    </TableCell>

                                    <TableCell>
                                        {formatDate(item.targetDate)}
                                    </TableCell>

                                    <TableCell className="sticky right-0 bg-card">

                                        <DropdownMenu>

                                            <DropdownMenuTrigger asChild>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>

                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">

                                                <DropdownMenuItem
                                                    onClick={() => navigate(`/onboarding/${item.userId}`)}
                                                >
                                                    View Details
                                                </DropdownMenuItem>

                                                {item.status !== "COMPLETED" && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleStartOnboarding(
                                                                item.userId
                                                            )
                                                        }
                                                    >
                                                        Restart Onboarding
                                                    </DropdownMenuItem>
                                                )}

                                            </DropdownMenuContent>

                                        </DropdownMenu>

                                    </TableCell>

                                </TableRow>

                            ))}

                            {!loading && filteredOnboardings.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
                                        className="py-10 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <p className="font-medium text-gray-900">
                                                No onboarding records found
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                Configure onboarding checklist templates and start
                                                onboarding for an employee.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {loading && (

                                <TableRow>

                                    <TableCell
                                        colSpan={10}
                                        className="text-center text-muted-foreground py-8"
                                    >
                                        Loading onboarding records...
                                    </TableCell>

                                </TableRow>

                            )}

                        </TableBody>

                    </Table>

                </div>

            </div>

        </div>
    );
};

export default OnboardingList;