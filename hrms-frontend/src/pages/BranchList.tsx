import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertTriangle, MapPin, MoreVertical, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import type { Branch, CreateBranchPayload } from "@/types/branch.types";
import { getBranches, createBranch, updateBranch, permanentDeleteBranch } from "@/services/branch.service";
import LocationPicker from "@/pages/LocationPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type EditForm = {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    city?: string;
    state?: string;
    pincode?: string;
    managerName?: string;

    latitude?: number;
    longitude?: number;
    geoRadius?: number;
    locationName?: string;
};

const BranchList = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role?.name === "super_admin";

    const [branches, setBranches] = React.useState<Branch[]>([]);
    const [open, setOpen] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);
    // const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(null);
    const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);

    const [dangerOpen, setDangerOpen] = React.useState(false);
    const [confirmText, setConfirmText] = React.useState("");

    // const [mapOpen, setMapOpen] = React.useState(false);
    const [createMapOpen, setCreateMapOpen] = React.useState(false);
    const [editMapOpen, setEditMapOpen] = React.useState(false);

    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");

    const [form, setForm] = React.useState<CreateBranchPayload>({
        name: "",
        address: "",
        phone: "",
        email: "",
        city: "",
        state: "",
        pincode: "",
        managerName: "",
    });

    const [editForm, setEditForm] = React.useState<EditForm>({});

    React.useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            const res = await getBranches();
            setBranches(res.data.data);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load branches");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    //  Filtered branches
    const filteredBranches = branches.filter((branch) => {
        const matchSearch = searchQuery
            ? branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (branch.city ?? "").toLowerCase().includes(searchQuery.toLowerCase())
            : true;

        const matchStatus = statusFilter !== "all"
            ? (statusFilter === "active" ? branch.isActive : !branch.isActive)
            : true;

        return matchSearch && matchStatus;
    });

    //  Create
    const handleSubmit = async () => {
        if (!form.name.trim()) { toast.error("Branch name is required"); return; }
        try {
            const res = await createBranch(form);
            toast.success("Branch created successfully!");
            setBranches((prev) => [res.data.data, ...prev]);
            setForm({ name: "", address: "", phone: "", email: "", city: "", state: "", pincode: "", managerName: "" });
            setOpen(false);
        } catch (err: any) {
            toast.error(err?.message || "Failed to create branch");
        }
    };
    //  Edit
    const payload = {
        name: editForm.name,
        address: editForm.address,
        phone: editForm.phone,
        email: editForm.email,
        city: editForm.city,
        state: editForm.state,
        pincode: editForm.pincode,
        managerName: editForm.managerName,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        geoRadius: editForm.geoRadius,
        locationName: editForm.locationName
    };
    //  Update
    const handleUpdate = async () => {
        if (!selectedBranch) return;
        try {
            const res = await updateBranch(selectedBranch.id, payload);

            // setBranches(res.data.data);
            setBranches((prev) => prev.map((b) => b.id === selectedBranch.id ? { ...b, ...res.data.data } : b));
            toast.success("Branch updated successfully!");
            setEditOpen(false);
            setSelectedBranch(null);
        } catch (err: any) {
            toast.error(err?.message || "Failed to update branch");
        }
    };

    //  Delete
    // const handleDelete = async () => {
    //     if (!selectedBranch) return;
    //     try {
    //         await deleteBranch(selectedBranch.id);
    //         toast.success("Branch deactivated successfully!");
    //         setBranches((prev) => prev.map((b) => b.id === selectedBranch.id ? { ...b, isActive: false } : b));
    //         setDeleteOpen(false);
    //         setSelectedBranch(null);
    //     } catch (err: any) {
    //         toast.error(err?.message || "Failed to delete branch");
    //     }
    // };

    const handleToggleStatus = async () => {
        if (!selectedBranch) return
        try {
            const res = await updateBranch(selectedBranch.id, { isActive: !selectedBranch.isActive });
            toast.success(`Branch ${selectedBranch.isActive ? "activated" : "deactivated"} successfully!`);
            setBranches((prev) => prev.map((b) => b.id === selectedBranch.id ? { ...b, ...res.data.data } : b));
            setStatusDialogOpen(false);
        } catch (err: any) {
            toast.error(err?.message || "Failed to update branch");
        }
    }


    // handle parmanet delete branch and confirmation text

    const handlePermanentDelete = async () => {
        if (confirmText !== selectedBranch?.name) {
            toast.error("Branch name doesn't match");
            return;
        }
        try {
            await permanentDeleteBranch(selectedBranch.id);
            toast.success("Branch permanently deleted!");
            setBranches((prev) => prev.filter((b) => b.id !== selectedBranch.id));
            setDangerOpen(false);
            setEditOpen(false);
            setConfirmText("");
        } catch (err: any) {
            const message =
                err?.message || "Failed to delete branch";
            toast.error(message);
        }

    }


    return (
        <div className="flex flex-col gap-4">

            {/* Header */}
            <div className="flex items-center justify-between">

                <div className="flex items-center gap-3 flex-wrap">
                    <Input
                        placeholder="Search branch name, code or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button size="sm" variant="add" onClick={() => setOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Branch
                </Button>
            </div>

            {/* Create Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Branch</DialogTitle>
                        <DialogDescription>Fill branch details</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <div>
                            <Label>Branch Name *</Label>
                            <Input type="text" name="name" placeholder="e.g. Delhi Branch" value={form.name} onChange={handleChange} />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Phone</Label>
                                <Input type="tel" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
                            </div>
                            <div className="flex-1">
                                <Label>Email</Label>
                                <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>City</Label>
                                <Input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} />
                            </div>
                            <div className="flex-1">
                                <Label>State</Label>
                                <Input type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} />
                            </div>
                            <div className="flex-1">
                                <Label>Pincode</Label>
                                <Input type="number" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <Label>Address</Label>
                            <Input type="text" name="address" placeholder="Full Address" value={form.address} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Manager Name</Label>
                            <Input type="text" name="managerName" placeholder="Manager Name" value={form.managerName} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Branch Location</Label>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" className="cursor-pointer" onClick={() => setCreateMapOpen(true)} type="button">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {form.latitude ? "Update Location" : "Set Location"}
                                </Button>
                                {form.latitude !== undefined && form.longitude !== undefined && (
                                    <span className="text-xs text-muted-foreground">
                                        {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)} — {form.geoRadius}m radius
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button variant="add" onClick={handleSubmit}>Create Branch</Button>
                    </div>

                </DialogContent>
            </Dialog>
            <LocationPicker
                open={createMapOpen}
                onOpenChange={setCreateMapOpen}
                initialLat={form.latitude}
                initialLng={form.longitude}
                initialRadius={form.geoRadius}
                onConfirm={(lat, lng, radius, locationName) => {
                    setForm((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                        geoRadius: radius,
                        locationName,
                    }));
                }}
            />
            {/* Edit Dialog */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-2">
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Branch — {selectedBranch?.name}</DialogTitle>
                            <DialogDescription>Fill branch details</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3">
                            <div>
                                <Label>Branch Name</Label>
                                <Input type="text" name="name" value={editForm.name ?? ""} onChange={handleEditChange} />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>Phone</Label>
                                    <Input type="tel" name="phone" value={editForm.phone ?? ""} onChange={handleEditChange} />
                                </div>
                                <div className="flex-1">
                                    <Label>Email</Label>
                                    <Input type="email" name="email" value={editForm.email ?? ""} onChange={handleEditChange} />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>City</Label>
                                    <Input type="text" name="city" value={editForm.city ?? ""} onChange={handleEditChange} />
                                </div>
                                <div className="flex-1">
                                    <Label>State</Label>
                                    <Input type="text" name="state" value={editForm.state ?? ""} onChange={handleEditChange} />
                                </div>
                                <div className="flex-1">
                                    <Label>Pincode</Label>
                                    <Input type="number" name="pincode" value={editForm.pincode ?? ""} onChange={handleEditChange} />
                                </div>
                            </div>
                            <div>
                                <Label>Address</Label>
                                <Input type="text" name="address" value={editForm.address ?? ""} onChange={handleEditChange} />
                            </div>


                            <div>
                                <Label>Manager Name</Label>
                                <Input type="text" name="managerName" value={editForm.managerName ?? ""} onChange={handleEditChange} />
                            </div>
                            <div>
                                <Label>Branch Location</Label>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="add"
                                        type="button"
                                        onClick={() => setEditMapOpen(true)}
                                    >
                                        <MapPin className="h-4 w-4 mr-2" />
                                        {editForm.latitude !== undefined ? "Update Location" : "Set Location"}
                                    </Button>

                                    {editForm.latitude != null &&
                                        editForm.longitude != null && (
                                            <span className="text-xs text-muted-foreground">
                                                {editForm.latitude.toFixed(4)},{" "}
                                                {editForm.longitude.toFixed(4)} — {editForm.geoRadius ?? 0}m radius
                                            </span>
                                        )}
                                </div>
                            </div>
                            <Button variant="add" onClick={handleUpdate}>Update Branch</Button>
                        </div>
                        <div >
                            <LocationPicker
                                open={editMapOpen}
                                onOpenChange={setEditMapOpen}
                                initialLat={editForm.latitude}
                                initialLng={editForm.longitude}
                                initialRadius={editForm.geoRadius}
                                onConfirm={(lat, lng, radius, locationName) => {
                                    setEditForm((prev) => ({
                                        ...prev,
                                        latitude: lat,
                                        longitude: lng,
                                        geoRadius: radius,
                                        locationName,
                                    }));
                                }}
                            />
                        </div>
                        {/* edit Dialog ke ander dialog permanent delete confirmation hoga */}
                        {isSuperAdmin && (
                            <div className="border border-red-200 rounded-lg p-4 mt-4 bg-red-50">
                                <h4 className="text-red-700 font-semibold flex items-center gap-2 text-sm">
                                    <AlertTriangle className="h-4 w-4" /> Danger Zone
                                </h4>
                                <p className="text-xs text-red-600 mt-1">
                                    Permanent Delete this branch. Only possible if no employee/user is assigned to this branch.
                                </p>
                                <Button variant="destructive" size="sm" className="sm cursor-pointer" onClick={() => setDangerOpen(true)}>Delete Permanently</Button>
                            </div>
                        )}
                        {/* Comfirmation Dialog */}
                        <Dialog open={dangerOpen} onOpenChange={setDangerOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="text-red-700"> Permanent Delete Branch</DialogTitle>
                                    <DialogDescription> Are you sure you want to delete <strong className="font-semibold bg-muted">{selectedBranch?.name}</strong> This action cannot be undone.</DialogDescription>
                                </DialogHeader>
                                <div>
                                    <Label>Type<strong> {selectedBranch?.name}</strong> To Confirm</Label>
                                    <Input type="text" name="confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type branch name" />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setDangerOpen(false)}>Cancel</Button>
                                    <Button variant="destructive" disabled={confirmText !== selectedBranch?.name} onClick={handlePermanentDelete} className=" cursor-pointer"> I understand, delete permanently</Button>

                                </div>
                            </DialogContent>
                        </Dialog>

                    </DialogContent>
                </Dialog>
            </div>

            {/* Delete Confirm */}
            {/* <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deactivate Branch</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate <strong>{selectedBranch?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Deactivate</Button>
                    </div>
                </DialogContent>
            </Dialog> */}


            {/* dialog active and deactive  */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Branch</DialogTitle>
                        <DialogDescription>
                            You are about to
                            <strong className="font-semibold ">
                                {" "}
                                {selectedBranch?.isActive ? "deactivate" : "activate"}
                            </strong>
                            <strong> {selectedBranch?.name}</strong>
                            {selectedBranch?.isActive
                                ? " You can activate it again later."
                                : " You can deactivate it again later."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleToggleStatus}>{selectedBranch?.isActive ? "Deactivate" : "Activate"}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Table */}
            <div className="bg-card  grid grid-cols-1 rounded border w-full overflow-x-auto">
                <div className="h-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead className="min-w-37.5">Name</TableHead>
                                <TableHead className="min-w-25">Code</TableHead>
                                {isSuperAdmin && <TableHead className="min-w-37.5">Company</TableHead>}
                                <TableHead className="min-w-25">City</TableHead>
                                <TableHead className="min-w-25">Phone</TableHead>
                                <TableHead className="min-w-37.5">Manager</TableHead>
                                <TableHead className="min-w-40">Location</TableHead>
                                <TableHead className="min-w-20">Status</TableHead>
                                <TableHead className="sticky right-0 bg-muted">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBranches.map((branch, index) => (
                                <TableRow key={branch.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{branch.name}</TableCell>
                                    <TableCell>{branch.code}</TableCell>
                                    {isSuperAdmin && <TableCell>{branch.company?.name ?? "—"}</TableCell>}
                                    <TableCell>{branch.city ?? "—"}</TableCell>
                                    <TableCell>{branch.phone ?? "—"}</TableCell>
                                    <TableCell>{branch.managerName ?? "—"}</TableCell>
                                    <TableCell>
                                        {branch.locationName ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={branch.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"}>
                                            {branch.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="sticky right-0 bg-card">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedBranch(branch);
                                                        setEditForm({
                                                            name: branch.name,
                                                            address: branch.address,
                                                            phone: branch.phone,
                                                            email: branch.email,
                                                            city: branch.city,
                                                            state: branch.state,
                                                            pincode: branch.pincode,
                                                            managerName: branch.managerName,
                                                            latitude: branch.latitude,
                                                            longitude: branch.longitude,
                                                            geoRadius: branch.geoRadius,
                                                            locationName: branch.locationName

                                                        });
                                                        setEditOpen(true);
                                                    }}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem variant="destructive"
                                                        className="text-red-600" onClick={() => {
                                                            setSelectedBranch(branch);
                                                            setStatusDialogOpen(true);
                                                        }}>
                                                        {branch.isActive ? "Deactivate" : "Activate"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {branches.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                        No branches found
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

export default BranchList;