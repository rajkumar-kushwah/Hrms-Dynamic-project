import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category.types";
import type { Branch } from "@/types/branch.types";
import { getCategories, createCategory, updateCategory } from "@/services/category.service";
import { getBranches } from "@/services/branch.service";

const CategoryList = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role?.name === "super_admin";

    const [categories, setCategories] = React.useState<Category[]>([]);
    const [branches, setBranches] = React.useState<Branch[]>([]);
    const [open, setOpen] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);
    //   const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

    const [form, setForm] = React.useState<CreateCategoryPayload>({
        name: "",
        description: "",
        branchId: "",
    });

    const [editForm, setEditForm] = React.useState<UpdateCategoryPayload>({});

    React.useEffect(() => {
        loadCategories();
        loadBranches();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data.data);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load categories");
        }
    };

    const loadBranches = async () => {
        try {
            const res = await getBranches();
            //  Sirf active branches
            setBranches(res.data.data.filter((b: Branch) => b.isActive));
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
        if (!form.name) { toast.error("Category name is required"); return; }
        if (!form.branchId) { toast.error("Please select a branch"); return; }
        try {
            const res = await createCategory(form);
            toast.success("Category created successfully!");
            setCategories((prev) => [res.data.data, ...prev]);
            setForm({ name: "", description: "", branchId: "" });
            setOpen(false);
        } catch (err: any) {
            toast.error(err?.message || "Failed to create category");
        }
    };

    //  Update
    const handleUpdate = async () => {
        if (!selectedCategory) return;
        try {
            await updateCategory(selectedCategory.id, editForm);
            toast.success("Category updated successfully!");
            setCategories((prev) =>
                prev.map((c) => c.id === selectedCategory.id ? { ...c, ...editForm } : c)
            );
            setEditOpen(false);
            setSelectedCategory(null);
        } catch (err: any) {
            toast.error(err?.message || "Failed to update category");
        }
    };

    //  Toggle Status
    const handleToggleStatus = async (category: Category) => {
        try {
            await updateCategory(category.id, { isActive: !category.isActive });
            toast.success(`Category ${!category.isActive ? "activated" : "deactivated"} successfully!`);
            setCategories((prev) =>
                prev.map((c) => c.id === category.id ? { ...c, isActive: !c.isActive } : c)
            );
        } catch (err: any) {
            toast.error(err?.message || "Failed to update category");
        }
    };

    return (
        <div className="flex flex-col gap-4">

            {/* Header */}
            <div className="flex items-center justify-end">
                <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Create Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                        <DialogDescription>Create a new department/category</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">

                        {/*  Branch Select */}
                        <div>
                            <Label>Branch *</Label>
                            <Select
                                value={form.branchId}
                                onValueChange={(val) => setForm({ ...form, branchId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Branch" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Category Name *</Label>
                            <Input
                                name="name"
                                placeholder="e.g. Sales Team"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Input
                                name="description"
                                placeholder="Description (optional)"
                                value={form.description}
                                onChange={handleChange}
                            />
                        </div>

                        <Button onClick={handleSubmit}>Create Category</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category — {selectedCategory?.name}</DialogTitle>
                        <DialogDescription>Update category details</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <div>
                            <Label>Category Name</Label>
                            <Input
                                name="name"
                                value={editForm.name ?? ""}
                                onChange={handleEditChange}
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                name="description"
                                value={editForm.description ?? ""}
                                onChange={handleEditChange}
                            />
                        </div>
                        <Button onClick={handleUpdate}>Update Category</Button>
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
                                <TableHead className="min-w-37.5">Branch</TableHead>
                                {isSuperAdmin && <TableHead className="min-w-37.5">Company</TableHead>}
                                <TableHead className="min-w-50">Description</TableHead>
                                <TableHead className="min-w-20">Status</TableHead>
                                <TableHead className="sticky right-0 bg-muted">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category, index) => (
                                <TableRow key={category.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.branch?.name ?? "—"}</TableCell>
                                    {isSuperAdmin && <TableCell>{category.company?.name ?? "—"}</TableCell>}
                                    <TableCell>{category.description ?? "—"}</TableCell>
                                    <TableCell>
                                        <Badge className={category.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"}>
                                            {category.isActive ? "Active" : "Inactive"}
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
                                                        setSelectedCategory(category);
                                                        setEditForm({
                                                            name: category.name,
                                                            description: category.description ?? "",
                                                        });
                                                        setEditOpen(true);
                                                    }}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(category)}>
                                                        {category.isActive ? "Deactivate" : "Activate"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        No categories found
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

export default CategoryList;