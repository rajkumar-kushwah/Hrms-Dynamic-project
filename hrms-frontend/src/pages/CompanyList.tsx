import React from 'react'
import type { Company, CreateCompanyPayload, UpdateCompanyPayload } from "@/types/company.types";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, MoreVertical, PlusIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getCompanies, createCompany, getMyCompany, assignCompanyAdmin, updateCompany, deactivateCompany, permanentDeleteCompany } from "@/services/company.service";
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth.store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function CompanyList() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role?.name === "super_admin";
  const isCompanyAdmin = user?.role?.name === "company_admin";


  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [open, setOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>("");

  const [form, setForm] = React.useState<CreateCompanyPayload>({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    gstNumber: "",
    // subscriptionPlan: "basic",
    maxBranches: 1,
    maxEmployees: 10,
  });

  const [adminForm, setAdminForm] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(null);
  const [editForm, setEditForm] = React.useState<UpdateCompanyPayload>({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    gstNumber: "",
  });

  const [dangerOpen, setDangerOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

  React.useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      if (isCompanyAdmin) {
        const res = await getMyCompany();
        setCompanies([res.data.data]);
      } else {
        const res = await getCompanies();
        setCompanies(res.data.data);
      }
    } catch (err: any) {
      const message =
        err?.message || "Failed to load companies";
      toast.error(message);
    }

  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEdit = async () => {
    if (!selectedCompany) return;
    try {
      await updateCompany(selectedCompany.id, editForm);
      toast.success("Company updated successfully");
      setCompanies((prev) => prev.map((c) => c.id === selectedCompany.id ? { ...c, ...editForm } : c));
      setEditOpen(false);
      setSelectedCompany(null);
    } catch (err: any) {
      const message =
        err?.message || "Failed to update company";
      toast.error(message);
    }
  }

  // const handleDeactivate = async () => {
  //   if (!selectedCompany) return;
  //   try {
  //     await deactivateCompany(selectedCompany.id); //  Naya function
  //     toast.success("Company deactivated successfully");
  //     setCompanies((prev) =>
  //       prev.map((c) => c.id === selectedCompany.id ? { ...c, isActive: false } : c)
  //     );
  //     setDeleteConfirmOpen(false);
  //     setSelectedCompany(null);
  //   } catch (err: any) {
  //     toast.error(err?.message || "Failed to deactivate company");
  //   }
  // };

  const filteredCompanies = companies.filter((company) => {
    const matchSearch = searchQuery
      ? company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.code.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchStatus = statusFilter !== "all" ? (statusFilter === "active" ? company.isActive : !company.isActive) : true;
    return matchSearch && matchStatus;
  })


  const handlePermanentDelete = async () => {
    if (confirmText !== selectedCompany?.name) {
      toast.error("Company name doesn't match");
      return;
    }
    try {
      await permanentDeleteCompany(selectedCompany.id);
      toast.success("Company permanently deleted!");
      setCompanies((prev) => prev.filter((c) => c.id !== selectedCompany.id));
      setDangerOpen(false);
      setEditOpen(false);
      setConfirmText("");
    } catch (err: any) {
      const message =
        err?.message || "Failed to delete company";
      toast.error(message);
    }
  };

  const validateGST = (gst: string): boolean => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Company name is required");
      return;
    }

    if (form.gstNumber && !validateGST(form.gstNumber)) {
      toast.error("Invalid GST Number format");
      return;
    }

    try {
      const res = await createCompany(form);
      toast.success("Company created successfully");
      setCompanies((prev) => [...prev, res.data.data]);
      setForm({
        name: "",
        email: "",
        phone: "",
        website: "",
        address: "",
        gstNumber: "",
        // subscriptionPlan: "basic",
        maxBranches: 1,
        maxEmployees: 10,
      });
      setOpen(false);
    } catch (err: any) {
      const message =
        err?.message || "Failed to create company";
      toast.error(message);
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      toast.error("All fields are required");
      return;
    }
    try {
      await assignCompanyAdmin(selectedCompanyId, adminForm);
      toast.success("Company Admin assigned successfully!");
      setAssignOpen(false);
      setAdminForm({ name: "", email: "", password: "" });
    } catch (err: any) {
      const message =
        err?.message || "Failed to assign admin";
      toast.error(message);
    }

  };
  const handleToggleStatus = async () => {
    if (!selectedCompany) return;
    try {
      if (selectedCompany.isActive) {
        await deactivateCompany(selectedCompany.id);
      } else {
        await updateCompany(selectedCompany.id, { isActive: true }); // Activate back
      }
      toast.success(`Company ${!selectedCompany.isActive ? "activated" : "deactivated"} successfully!`);
      setCompanies((prev) =>
        prev.map((c) => c.id === selectedCompany.id ? { ...c, isActive: !c.isActive } : c)
      );
      setDeleteConfirmOpen(false);
      setSelectedCompany(null);
    } catch (err: any) {
      const message =
        err?.message || "Failed to update company";
      toast.error(message);
    }

  };

  return (
    <div className='flex flex-col gap-4'>

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3 flex-wrap'>
          <Input
            placeholder="Search company name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-64'
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-36'>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          {!isCompanyAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className='flex items-center gap-2 cursor-pointer' size="sm" variant="add">
                  <PlusIcon className='h-4 w-4' />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Company</DialogTitle>
                  <DialogDescription>Company Details form Fill up</DialogDescription>
                </DialogHeader>
                <div className='flex items-center w-full gap-2'>
                  <div className='flex-1'>
                    <Label>Company Name *</Label>
                    <Input type="text" placeholder="Company Name" name='name' value={form.name} onChange={handleChange} />
                  </div>
                </div>
                <div className='flex items-center w-full gap-2'>
                  <div className='flex-1'>
                    <Label>Email</Label>
                    <Input type="email" placeholder="name@example.com" name='email' value={form.email} onChange={handleChange} />
                  </div>
                  <div className='flex-1'>
                    <Label>Phone</Label>
                    <Input type="text" placeholder="Phone" name='phone' value={form.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className='flex items-center w-full gap-2'>
                  <div className='flex-1'>
                    <Label>GST Number</Label>
                    <Input type="text" placeholder="e.g. 07AABCS1234A1Z5" maxLength={15} name='gstNumber' value={form.gstNumber} onChange={handleChange}
                      className={form.gstNumber && !validateGST(form.gstNumber) ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {form.gstNumber && !validateGST(form.gstNumber) && <p className="text-red-500 text-xs mt-1">Invalid GST Number format</p>}
                  </div>
                  {/* <div className='flex-1'>
                    <Label>Subscription Plan</Label>
                    <Input type="text" placeholder="basic/pro/enterprise" name='subscriptionPlan' value={form.subscriptionPlan} onChange={handleChange} />
                  </div> */}
                </div>
                <div>
                  <Label>Website</Label>
                  <Input type="url" placeholder="https://example.com" name='website' value={form.website} onChange={handleChange} />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input type="text" placeholder="Company Address" name='address' value={form.address} onChange={handleChange} />
                </div>
                <Button variant="add" className='cursor-pointer' onClick={handleSubmit}>
                  Submit
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Assign Admin Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Company Admin- {selectedCompany?.name}</DialogTitle>
            <DialogDescription>Create admin account for this company</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Name</Label>
            <Input type="text" placeholder="Admin Name" name="name" value={adminForm.name} onChange={handleAdminChange} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="admin@company.com" name="email" value={adminForm.email} onChange={handleAdminChange} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" placeholder="Password" name="password" value={adminForm.password} onChange={handleAdminChange} />
          </div>
          <Button variant='add' onClick={handleAssignAdmin}>
            Assign Admin
          </Button>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company — {selectedCompany?.name}</DialogTitle>
            <DialogDescription>Company Details form Fill up</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Label>Company Name</Label>
              <Input name="name" value={editForm.name} onChange={handleEditChange} placeholder='Company Name' />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Email</Label>
                <Input name="email" value={editForm.email} onChange={handleEditChange} placeholder='name@example.com' />
              </div>
              <div className="flex-1">
                <Label>Phone</Label>
                <Input name="phone" value={editForm.phone} onChange={handleEditChange} placeholder='Phone' />
              </div>
            </div>
            <div>
              <Label>GST Number</Label>
              <Input name="gstNumber" value={editForm.gstNumber} onChange={handleEditChange} placeholder='GST Number' />
            </div>
            <div>
              <Label>Website</Label>
              <Input name="website" value={editForm.website} onChange={handleEditChange} placeholder='https://example.com' />
            </div>
            <div>
              <Label>Address</Label>
              <Input name="address" value={editForm.address} onChange={handleEditChange} placeholder='Company Address' />
            </div>
            <Button variant='add' onClick={handleEdit}>Update Company</Button>
          </div>
          {/* Edit Dialog ke andar, form ke neeche */}
          {isSuperAdmin && (
            <div className="border border-red-200 rounded-lg p-4 mt-4 bg-red-50">
              <h4 className="text-red-700 font-semibold flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4" /> Danger Zone
              </h4>
              <p className="text-xs text-red-600 mt-1">
                Permanently delete this company and all its data. This cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-3"
                onClick={() => setDangerOpen(true)}
              >
                Delete Permanently
              </Button>
            </div>
          )}
        </DialogContent>

      </Dialog>

      {/* Deactivate Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to  <strong className="font-semibold ">
                {" "}
                {selectedCompany?.isActive ? "deactivate" : "activate"}
              </strong> , <strong className='text-card-foreground'>{selectedCompany?.name}</strong>?
              {selectedCompany?.isActive
                ? " You can activate it again later."
                : " You can deactivate it again later."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" className=" cursor-pointer" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className=" cursor-pointer" onClick={handleToggleStatus}>
              {selectedCompany?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Confirmation */}
      <Dialog open={dangerOpen} onOpenChange={setDangerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-700">Are you sure? Permanent Delete</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong className='font-bold bg-muted'>{selectedCompany?.name}</strong> and ALL related data
              (users, branches, categories, roles). This CANNOT be undone.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Type <strong>{selectedCompany?.name}</strong> to confirm</Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type company name"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDangerOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={confirmText !== selectedCompany?.name}
              onClick={handlePermanentDelete}
            >
              I understand, delete permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Table */}
      <div className="bg-card  grid grid-cols-1 rounded border w-full overflow-x-auto">
        <Table className='table-auto'>
          <TableHeader className='bg-muted rounded-lg'>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Address</TableHead>
              {/* <TableHead>Plan</TableHead> */}
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  {company.logo
                    ? <img src={company.logo} alt="logo" className="h-8 w-8 rounded" />
                    : "—"}
                </TableCell>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.code}</TableCell>
                <TableCell>{company.email ?? "—"}</TableCell>
                <TableCell>{company.phone ?? "—"}</TableCell>
                <TableCell>{company.gstNumber ?? "—"}</TableCell>
                <TableCell>{company.website ?? "—"}</TableCell>
                <TableCell>{company.address ?? "—"}</TableCell>
                {/* <TableCell>
                  <Badge variant="outline">{company.subscriptionPlan ?? "basic"}</Badge>
                </TableCell> */}
                <TableCell>
                  <Badge className={company.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {company.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="sticky right-0 bg-card">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-2 shrink-0 hover:bg-[var(--themePrimary)]/5 hover:text-white">
                        <MoreVertical className="h-4 w-4 text-[var(--themePrimary)]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCompany(company);
                            setEditForm({
                              ...company,
                            });
                            setEditOpen(true);
                          }}
                        >Edit</DropdownMenuItem>
                        {!isCompanyAdmin && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCompanyId(company.id);
                                setSelectedCompany(company);
                                setAssignOpen(true);
                              }}
                            >
                              Assign Admin
                            </DropdownMenuItem>

                          </>
                        )}
                        <DropdownMenuItem variant="destructive" onClick={() => {
                          setSelectedCompany(company);
                          setDeleteConfirmOpen(true);

                        }}
                          disabled={!isSuperAdmin}>
                          {company.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No companies found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default CompanyList;