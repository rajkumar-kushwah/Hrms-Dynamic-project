import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
import { Building2, Clock, Calendar, Mail, User, ShieldCheck, UserCheck, KeyRound, Pencil } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { updateProfile, changePassword } from "@/services/profile.service";

const Profile = () => {
    const { user, setUser } = useAuthStore();

    //  Edit Profile Popup
    const [editOpen, setEditOpen] = React.useState(false);
    const [name, setName] = React.useState(user?.name ?? "");
    const [updating, setUpdating] = React.useState(false);

    //  Change Password Popup
    const [pwOpen, setPwOpen] = React.useState(false);
    const [oldPassword, setOldPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");

    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase();

    const formatRole = (role: string) =>
        role.split("_").map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(" ");

    //  Update Profile
    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        setUpdating(true);
        try {
            const res = await updateProfile({ name });
            toast.success("Profile updated successfully!");
            setUser({ ...user!, name: res.data.data.name });
            setEditOpen(false);
        } catch (err: any) {
            const message =
                err?.message || "Failed to update profile";
            toast.error(message);
        }
        finally {
            setUpdating(false);
        }
    };

    //  Change Password
    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            toast.error("Both fields are required");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }
        try {
            await changePassword({ oldPassword, newPassword });
            toast.success("Password changed successfully!");
            setPwOpen(false);
            setOldPassword("");
            setNewPassword("");
        } catch (err: any) {
            const message =
                err?.message || "Failed to change password";
            toast.error(message);
        }

    };

    return (
        <div className='flex justify-center'>
            <Card className='bg-card text-card-foreground border-border max-w-md w-full'>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Profile</CardTitle>
                    {/*  Edit Icon Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setName(user?.name ?? "");
                            setEditOpen(true);
                        }}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className='grid gap-6'>

                    {/* Avatar + Name + Role */}
                    <div className="flex flex-col items-center gap-2">
                        <Avatar className='h-20 w-20'>
                            <AvatarImage src={user?.avatar} alt="avatar" />
                            <AvatarFallback className="text-lg">
                                {getInitials(user?.name || "U")}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="text-lg font-semibold">{user?.name}</h2>

                        {user?.role && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                {formatRole(user.role.name)}
                            </Badge>
                        )}

                        {user?.company && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Building2 className="h-3 w-3" />
                                {user.company.name}
                            </span>
                        )}
                    </div>

                    {/* Created By */}
                    {user?.createdByUser && (
                        <div className="flex flex-col gap-1">
                            <Label className="text-sm text-muted-foreground flex items-center gap-1">
                                <UserCheck className="h-3 w-3" /> Created By
                            </Label>
                            <Input
                                type="text"
                                defaultValue={user.createdByUser.name ?? "—"}
                                readOnly
                                className="opacity-60 cursor-not-allowed"
                            />
                        </div>
                    )}

                    {/* Info Fields — Read Only */}
                    <div className='flex flex-col gap-4'>

                        <div className="flex flex-col gap-1">
                            <Label className='text-sm text-muted-foreground flex items-center gap-1'>
                                <User className="h-3 w-3" /> Name
                            </Label>
                            <Input type='text' defaultValue={user?.name} readOnly className="opacity-60 cursor-not-allowed" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label className='text-sm text-muted-foreground flex items-center gap-1'>
                                <Mail className="h-3 w-3" /> Email
                            </Label>
                            <Input type='email' defaultValue={user?.email} readOnly className="opacity-60 cursor-not-allowed" />
                        </div>

                        {/*  Change Password Button */}
                        <Button variant="outline" onClick={() => setPwOpen(true)}>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Change Password
                        </Button>

                        {/* Dates */}
                        <div className="flex flex-col gap-2 pt-2 border-t border-border">
                            <p className='text-sm text-muted-foreground flex items-center gap-1'>
                                <Clock className="h-3 w-3" />
                                Last Login: {user?.lastLogin
                                    ? new Date(user.lastLogin).toLocaleString()
                                    : "N/A"}
                            </p>
                            <p className='text-sm text-muted-foreground flex items-center gap-1'>
                                <Calendar className="h-3 w-3" />
                                Member Since: {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleString()
                                    : "N/A"}
                            </p>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/*  Edit Profile Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Edite your profile information</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <div>
                            <Label>Name</Label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleUpdateProfile} disabled={updating}>
                            {updating ? "Updating..." : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={pwOpen} onOpenChange={setPwOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <div>
                            <Label>Current Password</Label>
                            <Input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>New Password</Label>
                            <Input
                                type="password"
                                placeholder="Min 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleChangePassword}>Change Password</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;