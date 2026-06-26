import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { CreateEmployeePayload, Employee, EmployeeDetail } from "@/types/employee.types";
import type { Branch } from "@/types/branch.types";
import type { Category } from "@/types/category.types";
import { createEmployee, updateEmployee } from "@/services/employee.service";
import { getBranches } from "@/services/branch.service";
import { getCategories } from "@/services/category.service";
import { getRoles } from "@/services/role.service";
import type { Role } from "@/types/role.types";
import { useAuthStore } from "@/store/auth.store";

// interface Role {
//   id: number;
//   name: string;
// }

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (employee: Employee) => void;
    editEmployee?: EmployeeDetail | null;
}

const initialForm: CreateEmployeePayload = {
    name: "", email: "", password: "", roleId: 0,
    branchId: "", categoryId: "", phone: "",
    dateOfBirth: "", gender: "", bloodGroup: "", maritalStatus: "",
    currentAddress: "", permanentAddress: "",
    designation: "", joiningDate: "", employmentType: "", workShift: "",
    reportingManagerId: "",
    panNumber: "", aadharNumber: "",
    bankAccountNumber: "", bankIFSC: "", bankName: "",
    pfNumber: "", esiNumber: "",
    emergencyContactName: "", emergencyContactPhone: "",
};

const AddEmployeeDialog = ({ open, onOpenChange, onSuccess, editEmployee }: Props) => {
    const { user } = useAuthStore();


    const [form, setForm] = React.useState<CreateEmployeePayload>(initialForm);
    const [branches, setBranches] = React.useState<Branch[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [activeTab, setActiveTab] = React.useState("basic");

    // const isSuperAdmin = user?.role?.name === "super_admin";
    const isCompanyAdmin = user?.role?.name === "company_admin";

    const filteredRoles = isCompanyAdmin
        ? roles.filter((role) => !role.isSystemRole)
        : roles;

    const isEditeMode = !!editEmployee;
    React.useEffect(() => {
        if (open) {
            loadDropdownData();
            if (isEditeMode && editEmployee) {
                setForm({
                    ...editEmployee,
                    password: "",
                    roleId: editEmployee?.role?.id ?? 0,
                    branchId: editEmployee?.branch?.id ?? "",
                    categoryId: editEmployee?.category?.id ?? "",
                    dateOfBirth: editEmployee.dateOfBirth?.split("T")[0] ?? "",
                    joiningDate: editEmployee.joiningDate?.split("T")[0] ?? "",
                });
            } else {
                setForm(initialForm);
            }
        }
    }, [open, editEmployee]);

    const loadDropdownData = async () => {
        try {
            const [branchRes, categoryRes, roleRes] = await Promise.all([
                getBranches(),
                getCategories(),
                getRoles(),
            ]);

            setBranches(
                branchRes.data.data.filter((b: Branch) => b.isActive)
            );

            setCategories(
                categoryRes.data.data.filter((c: Category) => c.isActive)
            );

            setRoles(roleRes.data.data);

        } catch (error) {
            console.error(error);
            toast.error("Failed to load dropdown data");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.password || !form.roleId) {
            toast.error("Name, Email, Password and Role are required");
            setActiveTab("basic");
            return;
        }

        if (!isEditeMode && !form.password) {
            toast.error("Password is required");
            setActiveTab("basic");
            return;
        }
        try {
            if (isEditeMode && editEmployee) {
                const updateData = {
                    name: form.name,
                    phone: form.phone,
                    roleId: form.roleId,
                    branchId: form.branchId,
                    categoryId: form.categoryId,
                    dateOfBirth: form.dateOfBirth,
                    gender: form.gender,
                    bloodGroup: form.bloodGroup,
                    maritalStatus: form.maritalStatus,
                    currentAddress: form.currentAddress,
                    permanentAddress: form.permanentAddress,
                    designation: form.designation,
                    joiningDate: form.joiningDate,
                    employmentType: form.employmentType,
                    workShift: form.workShift,
                    reportingManagerId: form.reportingManagerId,
                    panNumber: form.panNumber,
                    aadharNumber: form.aadharNumber,
                    bankAccountNumber: form.bankAccountNumber,
                    bankIFSC: form.bankIFSC,
                    bankName: form.bankName,
                    pfNumber: form.pfNumber,
                    esiNumber: form.esiNumber,
                    emergencyContactName: form.emergencyContactName,
                    emergencyContactPhone: form.emergencyContactPhone,
                };
                console.log("UPDATE DATA:", updateData);
                const res = await updateEmployee(editEmployee.id, updateData);
                toast.success("Employee updated successfully!");
                onSuccess(res.data.data);

            } else {

                const res = await createEmployee(form);
                toast.success("Employee created successfully!");
                onSuccess(res.data.data);
            }
            setForm(initialForm);
            setActiveTab("basic");

        } catch (err: any) {
            toast.error(err?.message || "Failed to create employee");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditeMode ? "Edit Employee" : "Add Employee"}</DialogTitle>
                    <DialogDescription>Fill employee details across all tabs</DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="employment">Employment</TabsTrigger>
                        <TabsTrigger value="bank">Bank & ID</TabsTrigger>
                    </TabsList>

                    {/* TAB 1 — Basic */}
                    <TabsContent value="basic" className="flex flex-col gap-3 mt-4">
                        <div>
                            <Label>Name *</Label>
                            <Input name="name" value={form.name} onChange={handleChange} />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Email *</Label>
                                <Input name="email" type="email" value={form.email} onChange={handleChange} />
                            </div>
                            <div className="flex-1">
                                <Label>Password *</Label>
                                <Input name="password" type="password" value={form.password} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <Label>Role *</Label>
                            <Select
                                value={form.roleId ? String(form.roleId) : ""}
                                onValueChange={(val) => setForm({ ...form, roleId: Number(val) })}
                            >
                                <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                                <SelectContent position="popper" align="start" >
                                    {filteredRoles.map((role) => (
                                        <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Branch</Label>
                                <Select value={form.branchId} onValueChange={(val) => setForm({ ...form, branchId: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                    <SelectContent position="popper" align="start">
                                        {branches.map((b) => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <Label>Category</Label>
                                <Select value={form.categoryId} onValueChange={(val) => setForm({ ...form, categoryId: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                    <SelectContent position="popper" align="start">
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input name="phone" value={form.phone} onChange={handleChange} />
                        </div>
                    </TabsContent>

                    {/* TAB 2 — Personal */}
                    <TabsContent value="personal" className="flex flex-col gap-3 mt-4">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Date of Birth</Label>
                                <Input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
                            </div>
                            <div className="flex-1">
                                <Label>Gender</Label>
                                <Select value={form.gender} onValueChange={(val) => setForm({ ...form, gender: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent position="popper" align="start">
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Blood Group</Label>
                                <Input name="bloodGroup" placeholder="e.g. O+" value={form.bloodGroup} onChange={handleChange} />
                            </div>
                            <div className="flex-1">
                                <Label>Marital Status</Label>
                                <Select value={form.maritalStatus} onValueChange={(val) => setForm({ ...form, maritalStatus: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent position="popper" align="start">
                                        <SelectItem value="Single">Single</SelectItem>
                                        <SelectItem value="Married">Married</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Current Address</Label>
                            <Input name="currentAddress" value={form.currentAddress} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Permanent Address</Label>
                            <Input name="permanentAddress" value={form.permanentAddress} onChange={handleChange} />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Emergency Contact Name</Label>
                                <Input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} />
                            </div>
                            <div className="flex-1">
                                <Label>Emergency Contact Phone</Label>
                                <Input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} />
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 3 — Employment */}
                    <TabsContent value="employment" className="flex flex-col gap-3 mt-4">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Designation</Label>
                                <Input name="designation" value={form.designation} onChange={handleChange} />
                            </div>
                            <div className="flex-1">
                                <Label>Joining Date</Label>
                                <Input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Employment Type</Label>
                                <Select value={form.employmentType} onValueChange={(val) => setForm({ ...form, employmentType: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent position="popper" align="start">
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Intern">Intern</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <Label>Work Shift</Label>
                                <Select value={form.workShift} onValueChange={(val) => setForm({ ...form, workShift: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent position="popper" align="start">
                                        <SelectItem value="Morning">Morning</SelectItem>
                                        <SelectItem value="Evening">Evening</SelectItem>
                                        <SelectItem value="Night">Night</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 4 — Bank & ID */}
                    <TabsContent value="bank" className="flex flex-col gap-3 mt-4">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>PAN Number</Label>
                                <Input name="panNumber" value={form.panNumber} onChange={handleChange} />
                            </div>
                            <div className="flex-1">
                                <Label>Aadhar Number</Label>
                                <Input name="aadharNumber" value={form.aadharNumber} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <Label>Bank Name</Label>
                            <Input name="bankName" value={form.bankName} onChange={handleChange} />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Bank Account Number</Label>
                                <Input name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleChange} />
                            </div>
                            <div className="flex-1">
                                <Label>IFSC Code</Label>
                                <Input name="bankIFSC" value={form.bankIFSC} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>PF Number</Label>
                                <Input name="pfNumber" value={form.pfNumber} onChange={handleChange} />
                            </div>
                            <div className="flex-1">
                                <Label>ESI Number</Label>
                                <Input name="esiNumber" value={form.esiNumber} onChange={handleChange} />
                            </div>
                        </div>
                        
                    </TabsContent>
                </Tabs>


                {/* basic tab main password field conditionally visible */}
                {!isEditeMode && (
                    <div>
                        <Label className="mt-4">Password</Label>
                        <Input name="password" type="password" value={form.password} onChange={handleChange} />
                    </div>
                )}
                <Button onClick={handleSubmit} className="mt-4">{isEditeMode ? "Update Employee" : "Add Employee"}</Button>
            </DialogContent>
        </Dialog>
    );
};

export default AddEmployeeDialog;