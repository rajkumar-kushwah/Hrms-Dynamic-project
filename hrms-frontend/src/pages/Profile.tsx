import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth.store";
import { Building2, Clock, Calendar, Phone, Mail, User, ShieldCheck, UserCheck } from "lucide-react";

const Profile = () => {
    const { user } = useAuthStore();

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const formatRole = (role: string) => {
        return role
            .split("_")
            .map((r) => r.charAt(0).toUpperCase() + r.slice(1))
            .join(" ");
    };

    return (
        <div className='flex justify-center'>
            <Card className='bg-card text-card-foreground border-border max-w-md w-full'>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
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

                        {/* Role Badge */}
                        {user?.role && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                {formatRole(user.role.name)}
                            </Badge>
                        )}

                        {/* Company */}
                        {user?.company && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Building2 className="h-3 w-3" />
                                {user?.company?.name}
                            </span>
                        )}
                    </div>

                    {/* Created By */}
                    {user?.createdByUser && (
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted-foreground flex items-center gap-1">
                                <UserCheck className="h-3 w-3" /> Created By
                            </label>
                            <Input
                                type="text"
                                defaultValue={user.createdByUser.name ?? "—"}
                                readOnly
                                className="opacity-60 cursor-not-allowed"
                            />
                        </div>
                    )}

                    {/* Info Fields */}
                    <div className='flex flex-col gap-4'>

                        {/* Name */}
                        <div className="flex flex-col gap-1">
                            <label className='text-sm text-muted-foreground flex items-center gap-1'>
                                <User className="h-3 w-3" /> Name
                            </label>
                            <Input type='text' defaultValue={user?.name} />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label className='text-sm text-muted-foreground flex items-center gap-1'>
                                <Mail className="h-3 w-3" /> Email
                            </label>
                            <Input type='email' defaultValue={user?.email} readOnly
                                className="opacity-60 cursor-not-allowed"
                            />
                        </div>

                        {/* Phone */}
                        {/* <div className="flex flex-col gap-1">
                            <label className='text-sm text-muted-foreground flex items-center gap-1'>
                                <Phone className="h-3 w-3" /> Phone
                            </label>
                            <Input type='tel' defaultValue={user?.phone} />
                        </div> */}

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
        </div>
    );
};

export default Profile;