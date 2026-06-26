import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, PlusIcon, ArrowLeft, Mail, Phone, Briefcase, MapPin, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import type { Employee, EmployeeDetail } from "@/types/employee.types";
import { getEmployeeById, getEmployees, updateEmployee } from "@/services/employee.service";
import AddEmployeeDialog from "@/pages/AddEmployeeDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const EmployeeList = () => {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role?.name === "super_admin";

  // active and inactive super_admin kr skta h or  company admin (Employee nhi)
  const roleName = user?.role?.name ?? "";
  const canChangeStatus = ["super_admin", "company_admin"].includes(roleName);

  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [open, setOpen] = React.useState(false);

  // Employee View mode toggle — "list" ya "profile"
  const [view, setView] = React.useState<"list" | "profile">("list");
  const [selectedEmployee, setSelectedEmployee] = React.useState<EmployeeDetail | null>(null);

  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);

  const [editEmployee, setEditEmployee] = React.useState<EmployeeDetail | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  React.useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data.data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load employees");
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedEmployee) return

    try {
      await updateEmployee(selectedEmployee.id, { isActive: !selectedEmployee.isActive });
      toast.success(`Employee ${!selectedEmployee.isActive ? "activated" : "deactivated"} successfully!`);
      setEmployees((prev) =>
        prev.map((e) => e.id === selectedEmployee.id ? { ...e, isActive: !e.isActive } : e)
      );
      setStatusDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update employee");
    }
  };

  const handleEditClick = async (id: string) => {
    try {
      const res = await getEmployeeById(id);
      setEditEmployee(res.data.data);
      setEditOpen(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load employee details");
    }
  }

  const handleEmployeeCreated = (newEmployee: Employee) => {
    setEmployees((prev) => [newEmployee, ...prev]);
    setOpen(false);
  };

  // View Details — page jaisa switch
  const handleViewDetails = async (id: string) => {
    try {
      const res = await getEmployeeById(id);
      setSelectedEmployee(res.data.data);
      setView("profile");
    } catch (err: any) {
      toast.error(err?.message || "Failed to load employee details");
    }
  };

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase();

  // PROFILE VIEW
  if (view === "profile" && selectedEmployee) {
    return (
      <div className="flex flex-col gap-4">

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-fit cursor-pointer hover:bg-muted hover:text-muted-foreground"
          onClick={() => setView("list")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>

        {/* Header Card */}
        <div className="bg-card border rounded-sm p-6 flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-sm">
              {getInitials(selectedEmployee.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{selectedEmployee.name}</h2>
            <p className="text-muted-foreground text-sm ">
              {selectedEmployee.designation ?? selectedEmployee.role?.name} • {selectedEmployee.employeeCode}
            </p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedEmployee.email}</span>
              {selectedEmployee.phone && (
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedEmployee.phone}</span>
              )}
            </div>
          </div>
          <Badge className={selectedEmployee.isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"}>
            {selectedEmployee.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="bank">Bank & ID</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="bg-card border rounded-xl p-6 mt-3">
            <div className="grid grid-cols-2 gap-6">
              <InfoItem icon={<Briefcase className="h-4 w-4" />} label="Branch" value={selectedEmployee.branch?.name} />
              <InfoItem icon={<Briefcase className="h-4 w-4" />} label="Category" value={selectedEmployee.category?.name} />
              <InfoItem icon={<Briefcase className="h-4 w-4" />} label="Role" value={selectedEmployee.role?.name} />
              <InfoItem icon={<Calendar className="h-4 w-4" />} label="Joining Date" value={formatDate(selectedEmployee.joiningDate)} />
            </div>
          </TabsContent>

          {/* Personal */}
          <TabsContent value="personal" className="bg-card border rounded-xl p-6 mt-3">
            <div className="grid grid-cols-2 gap-6">
              <InfoItem label="Date of Birth" value={formatDate(selectedEmployee.dateOfBirth)} />
              <InfoItem label="Gender" value={selectedEmployee.gender} />
              <InfoItem label="Blood Group" value={selectedEmployee.bloodGroup} />
              <InfoItem label="Marital Status" value={selectedEmployee.maritalStatus} />
              <InfoItem className="col-span-2" icon={<MapPin className="h-4 w-4" />} label="Current Address" value={selectedEmployee.currentAddress} />
              <InfoItem className="col-span-2" icon={<MapPin className="h-4 w-4" />} label="Permanent Address" value={selectedEmployee.permanentAddress} />
              <InfoItem label="Emergency Contact" value={selectedEmployee.emergencyContactName} />
              <InfoItem label="Emergency Phone" value={selectedEmployee.emergencyContactPhone} />
            </div>
          </TabsContent>

          {/* Employment */}
          <TabsContent value="employment" className="bg-card border rounded-xl p-6 mt-3">
            <div className="grid grid-cols-2 gap-6">
              <InfoItem label="Employment Type" value={selectedEmployee.employmentType} />
              <InfoItem label="Work Shift" value={selectedEmployee.workShift} />
              <InfoItem label="Reporting Manager" value={selectedEmployee.reportingManager?.name} />
            </div>
          </TabsContent>

          {/* Bank & ID */}
          <TabsContent value="bank" className="bg-card border rounded-xl p-6 mt-3">
            <div className="grid grid-cols-2 gap-6">
              <InfoItem label="PAN Number" value={selectedEmployee.panNumber} />
              <InfoItem label="Aadhar Number" value={selectedEmployee.aadharNumber} />
              <InfoItem label="Bank Name" value={selectedEmployee.bankName} />
              <InfoItem label="Bank Account" value={selectedEmployee.bankAccountNumber} />
              <InfoItem label="IFSC Code" value={selectedEmployee.bankIFSC} />
              <InfoItem label="PF Number" value={selectedEmployee.pfNumber} />
              <InfoItem label="ESI Number" value={selectedEmployee.esiNumber} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="flex flex-col gap-4">

      <div className="flex items-center justify-end">
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <AddEmployeeDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleEmployeeCreated}
      />

      <AddEmployeeDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={(updated) => {
          setEmployees((prev) => prev.map((e) => e.id === updated.id ? updated : e));
          setEditOpen(false);
          setEditEmployee(null);
        }}
        editEmployee={editEmployee}
        
      />
      
      {/* dialog active and deactive  */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Branch</DialogTitle>
            <DialogDescription>
              You are about to
              <strong className="font-semibold ">
                {" "}
                {selectedEmployee?.isActive ? "deactivate" : "activate"}
              </strong>
              <strong> {selectedEmployee?.name}</strong>
              {selectedEmployee?.isActive
                ? " You can activate it again later."
                : " You can deactivate it again later."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleToggleStatus}>{selectedEmployee?.isActive ? "Deactivate" : "Activate"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-card grid grid-cols-1 rounded border w-full overflow-hidden">
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead className="min-w-25">Code</TableHead>
                <TableHead className="min-w-37.5">Name</TableHead>
                <TableHead className="min-w-45">Email</TableHead>
                <TableHead className="min-w-30">Designation</TableHead>
                <TableHead className="min-w-30">Branch</TableHead>
                <TableHead className="min-w-30">Category</TableHead>
                <TableHead className="min-w-25">Role</TableHead>
                {isSuperAdmin && <TableHead className="min-w-37.5">Company</TableHead>}
                <TableHead className="min-w-20">Status</TableHead>
                <TableHead className="sticky right-0 bg-muted">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp, index) => (
                <TableRow key={emp.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{emp.employeeCode ?? "—"}</TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.designation ?? "—"}</TableCell>
                  <TableCell>{emp.branch?.name ?? "—"}</TableCell>
                  <TableCell>{emp.category?.name ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline">{emp.role?.name ?? "—"}</Badge></TableCell>
                  {isSuperAdmin && <TableCell>{emp.company?.name ?? "—"}</TableCell>}
                  <TableCell>
                    <Badge className={emp.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="sticky right-0 bg-card">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => handleViewDetails(emp.id)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(emp.id)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem 
                          onClick={() => {
                            setSelectedEmployee(emp)
                            setStatusDialogOpen(true)
                          }}
                          disabled={!canChangeStatus}>
                            {emp.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No employees found
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

//  Helper Components
const InfoItem = ({ icon, label, value, className }: { icon?: React.ReactNode; label: string; value?: string | null; className?: string }) => (
  <div className={className}>
    <p className="text-sm text-muted-foreground flex items-center gap-1">{icon}{label}</p>
    <p className="font-medium mt-0.5">{value ?? "—"}</p>
  </div>
);

const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString() : undefined;

export default EmployeeList;