import React from 'react'
import type { Company, CreateCompanyPayload } from "@/types/company.types";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreVertical, PlusIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getCompanies, createCompany, getMyCompany, assignCompanyAdmin } from "@/services/company.service";
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth.store';

function CompanyList() {
  const { user } = useAuthStore();
  const isCompanyAdmin = user?.role?.name === "company_admin";

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
    subscriptionPlan: "basic",
    maxBranches: 1,
    maxEmployees: 10,
  });

  const [adminForm, setAdminForm] = React.useState({
    name: "",
    email: "",
    password: "",
  });

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
    } catch (err) {
      console.log(err);
      toast.error("Failed to load companies");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Company name is required");
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
        subscriptionPlan: "basic",
        maxBranches: 1,
        maxEmployees: 10,
      });
      setOpen(false);
    } catch (err) {
      toast.error("Failed to create company");
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
    } catch (err) {
      toast.error("Failed to assign admin");
    }
  };

  return (
    <div className='flex flex-col gap-4'>

      {/* Header */}
      <div className='bg-card w-full flex items-center justify-end'>
        {!isCompanyAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className='flex items-center gap-2 cursor-pointer' variant="outline">
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
                  <Input type="text" placeholder="GST Number" name='gstNumber' value={form.gstNumber} onChange={handleChange} />
                </div>
                <div className='flex-1'>
                  <Label>Subscription Plan</Label>
                  <Input type="text" placeholder="basic/pro/enterprise" name='subscriptionPlan' value={form.subscriptionPlan} onChange={handleChange} />
                </div>
              </div>
              <div>
                <Label>Website</Label>
                <Input type="url" placeholder="https://example.com" name='website' value={form.website} onChange={handleChange} />
              </div>
              <div>
                <Label>Address</Label>
                <Input type="text" placeholder="Company Address" name='address' value={form.address} onChange={handleChange} />
              </div>
              <Button variant="outline" className='cursor-pointer' onClick={handleSubmit}>
                Submit
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Assign Admin Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Company Admin</DialogTitle>
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
          <Button onClick={handleAssignAdmin}>
            Assign Admin
          </Button>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-card p-2 grid grid-cols-1 rounded border w-full overflow-x-auto">
        <Table>
          <TableHeader className='bg-muted rounded-lg'>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
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
                <TableCell>{company.website ?? "—"}</TableCell>
                <TableCell>{company.address ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{company.subscriptionPlan ?? "basic"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={company.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {company.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        {!isCompanyAdmin && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCompanyId(company.id);
                                setAssignOpen(true);
                              }}
                            >
                              Assign Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
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