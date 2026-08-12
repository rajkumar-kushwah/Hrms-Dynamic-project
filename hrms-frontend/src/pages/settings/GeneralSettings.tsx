import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getMyCompany, updateCompany } from "@/services/company.service";
// import { useAuthStore } from "@/store/auth.store";
import type { Company } from "@/types/company.types";

const GeneralSettings = () => {
    // const { user } = useAuthStore();
    const [company, setCompany] = React.useState<Company | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadCompany();
    }, []);

    const loadCompany = async () => {
        try {
            const res = await getMyCompany();
            setCompany(res.data.data);
        } catch (err: any) {
            const message =
                err?.message || "Failed to load company details";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!company) return;
        setSaving(true);
        try {
            await updateCompany(company.id, {
                name: company.name,
                email: company.email,
                phone: company.phone,
                website: company.website,
                address: company.address,
            });
            toast.success("Company details updated successfully!");
        } catch (err: any) {
            const message =
                err?.message || "Failed to update company details";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
    }

    if (!company) {
        return <div className="text-center py-8 text-muted-foreground">Company details not found</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your company's basic information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div>
                    <Label>Company Name</Label>
                    <Input
                        value={company.name}
                        onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    />
                </div>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Label>Email</Label>
                        <Input
                            value={company.email ?? ""}
                            onChange={(e) => setCompany({ ...company, email: e.target.value })}
                        />
                    </div>
                    <div className="flex-1">
                        <Label>Phone</Label>
                        <Input
                            value={company.phone ?? ""}
                            onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <Label>Website</Label>
                    <Input
                        value={company.website ?? ""}
                        onChange={(e) => setCompany({ ...company, website: e.target.value })}
                    />
                </div>
                <div>
                    <Label>Address</Label>
                    <Input
                        value={company.address ?? ""}
                        onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-fit">
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </CardContent>
        </Card>
    );
};

export default GeneralSettings;