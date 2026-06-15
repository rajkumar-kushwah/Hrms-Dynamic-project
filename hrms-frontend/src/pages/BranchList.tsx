import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import type { Branch, CreateBranchPayload, UpdateBranchPayload } from "@/types/branch.types";
import { getBranches, createBranch, updateBranch, deleteBranch } from "@/services/branch.service";

type EditForm = {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    city?: string;
    state?: string;
    pincode?: string;
    managerName?: string;
};

const BranchList = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role?.name === "super_admin";

    const [branches, setBranches] = React.useState<Branch[]>([]);
    const [open, setOpen] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(null);

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
    };
    //  Update
    const handleUpdate = async () => {
        if (!selectedBranch) return;
        try {
            const res = await updateBranch(selectedBranch.id, payload);
            toast.success("Branch updated successfully!");
            setBranches((prev) => prev.map((b) => b.id === selectedBranch.id ? { ...b, ...editForm } : b));
            setEditOpen(false);
            setSelectedBranch(null);
        } catch (err: any) {
            toast.error(err?.message || "Failed to update branch");
        }
    };

    //  Delete
    const handleDelete = async () => {
        if (!selectedBranch) return;
        try {
            await deleteBranch(selectedBranch.id);
            toast.success("Branch deactivated successfully!");
            setBranches((prev) => prev.map((b) => b.id === selectedBranch.id ? { ...b, isActive: false } : b));
            setDeleteOpen(false);
            setSelectedBranch(null);
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete branch");
        }
    };

    const handleToggleStatus = async (branch: Branch) => {
        try {
            const res = await updateBranch(branch.id, { isActive: !branch.isActive });
            toast.success(`Branch ${branch.isActive ? "deactivated" : "activated"} successfully!`);
            setBranches((prev) => prev.map((b) => b.id === branch.id ? { ...b, ...res.data.data } : b));
        } catch (err: any) {
            toast.error(err?.message || "Failed to update branch");
        }
    }

    return (
        <div className="flex flex-col gap-4">

            {/* Header */}
            <div className="flex items-center justify-end">
                <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
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
                        <Button onClick={handleSubmit}>Create Branch</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
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
                        <Button onClick={handleUpdate}>Update Branch</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
            </Dialog>

            {/* Table */}
            <div className="bg-card  grid grid-cols-1 rounded border w-full overflow-x-auto">
                <div className="h-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead className="min-w-[150px]">Name</TableHead>
                                <TableHead className="min-w-[100px]">Code</TableHead>
                                {isSuperAdmin && <TableHead className="min-w-[150px]">Company</TableHead>}
                                <TableHead className="min-w-[100px]">City</TableHead>
                                <TableHead className="min-w-[100px]">Phone</TableHead>
                                <TableHead className="min-w-[150px]">Manager</TableHead>
                                <TableHead className="min-w-[80px]">Status</TableHead>
                                <TableHead className="sticky right-0 bg-muted">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {branches.map((branch, index) => (
                                <TableRow key={branch.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{branch.name}</TableCell>
                                    <TableCell>{branch.code}</TableCell>
                                    {isSuperAdmin && <TableCell>{branch.company?.name ?? "—"}</TableCell>}
                                    <TableCell>{branch.city ?? "—"}</TableCell>
                                    <TableCell>{branch.phone ?? "—"}</TableCell>
                                    <TableCell>{branch.managerName ?? "—"}</TableCell>
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
                                                        });
                                                        setEditOpen(true);
                                                    }}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600" onClick={() => handleToggleStatus(branch)}>
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