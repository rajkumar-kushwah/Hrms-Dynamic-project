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
import { employeeSchema } from "@/validation/employee.validation";


// interface Role {
//   id: number;
//   name: string;
// }

const fieldTabMap: Record<string, string> = {
    name: "basic",
    email: "basic",
    password: "basic",
    roleId: "basic",
    branchId: "basic",
    categoryId: "basic",
    phone: "basic",

    dateOfBirth: "personal",
    gender: "personal",
    bloodGroup: "personal",
    maritalStatus: "personal",
    currentAddress: "personal",
    permanentAddress: "personal",
    emergencyContactName: "personal",
    emergencyContactPhone: "personal",

    designation: "employment",
    joiningDate: "employment",
    employmentType: "employment",
    workShift: "employment",
    reportingManagerId: "employment",

    panNumber: "bank",
    aadharNumber: "bank",
    bankName: "bank",
    bankAccountNumber: "bank",
    bankIFSC: "bank",
    pfNumber: "bank",
    esiNumber: "bank",
};




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
    const [errors, setErrors] = React.useState<
        Partial<Record<keyof CreateEmployeePayload, string>>
    >({});

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
                    ...initialForm,
                    ...editEmployee,
                    password: "",
                    roleId: editEmployee?.role?.id ?? 0,
                    branchId: editEmployee?.branch?.id ?? "",
                    categoryId: editEmployee?.category?.id ?? "",
                    dateOfBirth: editEmployee.dateOfBirth?.split("T")[0] ?? "",
                    joiningDate: editEmployee.joiningDate?.split("T")[0] ?? "",
                    designation: editEmployee.designation ?? "",
                    employmentType: editEmployee.employmentType ?? "",
                    workShift: editEmployee.workShift ?? "",

                    reportingManagerId:
                        editEmployee.reportingManager?.id ?? "",

                    phone: editEmployee.phone ?? "",
                    gender: editEmployee.gender ?? "",
                    bloodGroup: editEmployee.bloodGroup ?? "",
                    maritalStatus: editEmployee.maritalStatus ?? "",
                    currentAddress: editEmployee.currentAddress ?? "",
                    permanentAddress: editEmployee.permanentAddress ?? "",

                    panNumber: editEmployee.panNumber ?? "",
                    aadharNumber: editEmployee.aadharNumber ?? "",
                    bankAccountNumber: editEmployee.bankAccountNumber ?? "",
                    bankIFSC: editEmployee.bankIFSC ?? "",
                    bankName: editEmployee.bankName ?? "",
                    pfNumber: editEmployee.pfNumber ?? "",
                    esiNumber: editEmployee.esiNumber ?? "",

                    emergencyContactName:
                        editEmployee.emergencyContactName ?? "",

                    emergencyContactPhone:
                        editEmployee.emergencyContactPhone ?? "",
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
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to load dropdown data");
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // setForm({ ...form, [e.target.name]: e.target.value });
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        const schema =
            employeeSchema.shape[
            name as keyof typeof employeeSchema.shape
            ];

        if (schema) {
            const result = schema.safeParse(value);

            setErrors((prev) => ({
                ...prev,
                [name]: result.success
                    ? undefined
                    : result.error.issues[0]?.message,
            }));
        }


    };

    // select field ke liye function 
    const handleSelectChange = (
        name: keyof CreateEmployeePayload,
        value: string | number
    ) => {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        const schema =
            employeeSchema.shape[
            name as keyof typeof employeeSchema.shape
            ];

        if (schema) {
            const result = schema.safeParse(value);

            setErrors((prev) => ({
                ...prev,
                [name]: result.success
                    ? undefined
                    : result.error.issues[0]?.message,
            }));
        }
    };

    const handleSubmit = async () => {
        const result = employeeSchema.safeParse(form);

        if (!result.success) {

            console.log("VALIDATION ERRORS:", result.error.issues);
        }

        if (!result.success) {
            const newErrors: Partial<
                Record<keyof CreateEmployeePayload, string>
            > = {};

            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof CreateEmployeePayload;

                if (!newErrors[field]) {
                    newErrors[field] = issue.message;
                }
            });

            setErrors(newErrors);
            const firstErrorField = Object.keys(newErrors)[0];

            if (firstErrorField) {
                setActiveTab(fieldTabMap[firstErrorField]);
            }

            return;
        }



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

        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                toast.error("Failed to create employee");
            }
        }
    };

    return (
        <div>
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
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2 space-x-3">
                                <div className="flex-1">
                                    <Label>Email *</Label>
                                    <Input name="email" type="email" value={form.email} onChange={handleChange} />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>Password *</Label>
                                    <Input name="password" type="password" value={form.password} onChange={handleChange} />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label>Role *</Label>
                                <Select
                                    value={form.roleId ? String(form.roleId) : ""}
                                    onValueChange={(value) => handleSelectChange("roleId", Number(value))}
                                >
                                    {errors.roleId && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.roleId}
                                        </p>
                                    )}
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
                                    <Select value={form.branchId ? String(form.branchId) : ""} onValueChange={(value) => handleSelectChange("branchId", String(value))}>
                                        {errors.branchId && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.branchId}
                                            </p>
                                        )}
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
                                    <Select value={form.categoryId ? String(form.categoryId) : ""} onValueChange={(value) => handleSelectChange("categoryId", String(value))}>
                                        {errors.categoryId && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.categoryId}
                                            </p>
                                        )}
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
                                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="phone" />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </TabsContent>

                        {/* TAB 2 — Personal */}
                        <TabsContent value="personal" className="flex flex-col gap-3 mt-4">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>Date of Birth</Label>
                                    <Input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
                                    {errors.dateOfBirth && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.dateOfBirth}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>Gender</Label>
                                    <Select value={form.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
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
                                    {errors.bloodGroup && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.bloodGroup}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>Marital Status</Label>
                                    <Select value={form.maritalStatus ? String(form.maritalStatus) : ""} onValueChange={(value) => handleSelectChange("maritalStatus", value)}>
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
                                {errors.currentAddress && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.currentAddress}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Permanent Address</Label>
                                <Input name="permanentAddress" value={form.permanentAddress} onChange={handleChange} />
                                {errors.permanentAddress && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.permanentAddress}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>Emergency Contact Name</Label>
                                    <Input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} />
                                    {errors.emergencyContactName && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.emergencyContactName}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>Emergency Contact Phone</Label>
                                    <Input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} />
                                    {errors.emergencyContactPhone && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.emergencyContactPhone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB 3 — Employment */}
                        <TabsContent value="employment" className="flex flex-col gap-3 mt-4">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>Designation</Label>
                                    <Input name="designation" value={form.designation} onChange={handleChange} />
                                    {errors.designation && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.designation}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>Joining Date</Label>
                                    <Input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} />
                                    {errors.joiningDate && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.joiningDate}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>Employment Type</Label>
                                    <Select value={form.employmentType ? String(form.employmentType) : ""} onValueChange={(value) => handleSelectChange("employmentType", value)}>
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
                                    <Select value={form.workShift ? String(form.workShift) : ""} onValueChange={(value) => handleSelectChange("workShift", value)}>
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
                                    {errors.panNumber && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.panNumber}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>Aadhar Number</Label>
                                    <Input name="aadharNumber" value={form.aadharNumber} onChange={handleChange} />
                                    {errors.aadharNumber && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.aadharNumber}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label>Bank Name</Label>
                                <Input name="bankName" value={form.bankName} onChange={handleChange} />
                                {errors.bankName && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.bankName}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>Bank Account Number</Label>
                                    <Input name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleChange} />
                                    {errors.bankAccountNumber && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.bankAccountNumber}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>IFSC Code</Label>
                                    <Input name="bankIFSC" value={form.bankIFSC} onChange={handleChange} />
                                    {errors.bankIFSC && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.bankIFSC}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>PF Number</Label>
                                    <Input name="pfNumber" value={form.pfNumber} onChange={handleChange} />
                                    {errors.pfNumber && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.pfNumber}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>ESI Number</Label>
                                    <Input name="esiNumber" value={form.esiNumber} onChange={handleChange} />
                                    {errors.esiNumber && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.esiNumber}
                                        </p>
                                    )}
                                </div>
                            </div>

                        </TabsContent>
                    </Tabs>


                    {/* basic tab main password field conditionally visible */}
                    {/* {!isEditeMode && (
                    <div>
                        <Label className="mt-4">Password</Label>
                        <Input name="password" type="password" value={form.password} onChange={handleChange} />
                    </div>
                )} */}
                    <Button onClick={handleSubmit} className="mt-4">{isEditeMode ? "Update Employee" : "Add Employee"}</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddEmployeeDialog;