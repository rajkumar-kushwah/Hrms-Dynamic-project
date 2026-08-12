import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/services/settings.service";
import type { CompanySettings } from "@/types/settings.types";
import { useAuthStore } from "@/store/auth.store";

const weekDays = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
];

const Settings = () => {

    // Settings.tsx mein handle karo:
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role?.name === "super_admin";

    const [settings, setSettings] = React.useState<CompanySettings | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!isSuperAdmin) {
            loadSettings(); //  Super Admin ke liye call hi mat karo
        } else {
            setLoading(false);
        }
    }, []);

    const loadSettings = async () => {
        try {
            const res = await getSettings();
            setSettings(res.data.data);
        } catch (err: any) {
            const message =
                err?.message || "Failed to load settings";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const res = await updateSettings({
                lateMarkHour: settings.lateMarkHour,
                lateMarkMinute: settings.lateMarkMinute,
                halfDayHours: settings.halfDayHours,
                defaultGeoRadius: settings.defaultGeoRadius,
                weekOffDays: settings.weekOffDays,
            });
            setSettings(res.data.data);
            toast.success("Settings updated successfully!");
        } catch (err: any) {
            const message =
                err?.message || "Failed to update settings";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const toggleWeekOff = (day: number) => {
        if (!settings) return;
        const current = settings.weekOffDays;
        const updated = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day];
        setSettings({ ...settings, weekOffDays: updated });
    };

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Loading settings...</div>;
    }

    if (isSuperAdmin) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Settings are company-specific. Please select or assign yourself to a company to configure settings.
            </div>
        );
    }

    if (!settings) {
        return <div className="text-center py-8 text-muted-foreground">No settings found</div>;
    }


    return (
        <div className="flex flex-col gap-4 max-w-2xl">

            {/* Attendance Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Settings</CardTitle>
                    <CardDescription>
                        Configure how attendance is calculated for your company
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">

                    {/* Late Mark Time */}
                    <div>
                        <Label>Late Mark Cutoff Time</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Input
                                type="time"  //  Browser native time picker — AM/PM automatic dikhata hai
                                value={`${String(settings.lateMarkHour).padStart(2, "0")}:${String(settings.lateMarkMinute).padStart(2, "0")}`}
                                onChange={(e) => {
                                    const [hour, minute] = e.target.value.split(":").map(Number);
                                    setSettings({ ...settings, lateMarkHour: hour, lateMarkMinute: minute });
                                }}
                                className="w-35"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Employees punching in after this time will be marked "Late"
                            </p>
                        </div>
                    </div>

                    {/* Half Day Hours */}
                    <div>
                        <Label>Half Day Threshold (Hours)</Label>
                        <Input
                            type="number"
                            step="0.5"
                            min={1}
                            value={settings.halfDayHours}
                            onChange={(e) => setSettings({ ...settings, halfDayHours: Number(e.target.value) })}
                            className="w-32 mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            If working hours are less than {settings.halfDayHours} hours,
                            attendance is marked "Half-day"
                        </p>
                    </div>

                    {/* Default Geo Radius */}
                    <div>
                        <Label>Default Geo Fence Radius (meters)</Label>
                        <Input
                            type="number"
                            min={10}
                            value={settings.defaultGeoRadius}
                            onChange={(e) => setSettings({ ...settings, defaultGeoRadius: Number(e.target.value) })}
                            className="w-32 mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Default radius used when a new branch doesn't set its own geo fence
                        </p>
                    </div>

                    {/* Week Off Days */}
                    <div>
                        <Label>Week Off Days</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {weekDays.map((day) => (
                                <div key={day.value} className="flex items-center gap-2">
                                    <Checkbox
                                        checked={settings.weekOffDays.includes(day.value)}
                                        onCheckedChange={() => toggleWeekOff(day.value)}
                                    />
                                    <Label className="font-normal cursor-pointer" onClick={() => toggleWeekOff(day.value)}>
                                        {day.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Selected days will automatically show "Week Off" in attendance
                        </p>
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="w-fit cursor-pointer">
                        {saving ? "Saving..." : "Save Settings"}
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;