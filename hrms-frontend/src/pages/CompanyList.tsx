import React from 'react'
import type { Company, CreateCompanyPayload } from "@/types/company.types";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreVertical, PlusIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getCompanies, createCompany } from "@/services/company.service";
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function CompanyList() {
    const [companies, setCompanies] = React.useState<Company[]>([])
    const [open, setOpen] = React.useState(false);
    const [form, setForm] = React.useState<CreateCompanyPayload>({
        name: "",
        code: "",
        email: "",
        phone: "",
        website: "",
        address: "",
        logo: "",
    })

    React.useEffect(() => {
        loadCompanies();
    }, [])

    const loadCompanies = async () => {
        try {
            const res = await getCompanies();
            setCompanies(res.data.data);

        } catch (err) {
            console.log(err);
        }
    }

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.code) {
            toast.error("Name and Code are required");
            return;
        }
        try {
            const res = await createCompany(form);
            console.log("Created", res.data);

            setForm({
                name: "",
                code: "",
                email: "",
                phone: "",
                website: "",
                address: "",
                logo: "",
            })

            // await loadCompanies();
            setCompanies((prev) => [...prev, res.data.data]);

        } catch (err) {
            console.log(err);
        }
    }


    return (
        <div className='flex flex-col gap-4'>
            <div className='bg-card w-full flex items-center justify-end'>
                <Dialog open={open} onOpenChange={setOpen}>

                    <DialogTrigger asChild>
                        <Button className='flex items-center gap-2 cursor-pointer' variant="outline">
                            <PlusIcon className='h-4 w-4' />
                            Add Company
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        </DialogHeader>

                        <DialogTitle>Add Company</DialogTitle>
                        <DialogDescription>Company Details form Fill up </DialogDescription>
                        <div className='flex items-center w-full gap-2'>
                            <div>
                                <Label>Company Name </Label>
                                <Input type="text" placeholder="Name" name='name' value={form.name} onChange={handleChange} />
                            </div>
                            <div>
                                <Label> Code </Label>
                                <Input type="text" placeholder="Company Code Tsc.." name='code' value={form.code} onChange={handleChange} />
                            </div>
                        </div>
                        <div className='flex items-center w-full gap-2'>

                            <div>
                                <Label> Email </Label>
                                <Input type="text" placeholder="name@axample.com" name='email' value={form.email} onChange={handleChange} />
                            </div>
                            <div>
                                <Label> Phone </Label>
                                <Input type="text" placeholder="Phone" name='phone' value={form.phone} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <Label> Website </Label>
                            <Input type="url" placeholder="https://example.com" name='website' value={form.website} onChange={handleChange} />
                        </div>
                        <div>
                            <Label> Address </Label>
                            <Input type="text" placeholder="Company Address" name='address' value={form.address} onChange={handleChange} />
                        </div>

                        <Button variant="outline" className=' cursor-pointer' onClick={handleSubmit}>Submit</Button>

                    </DialogContent>
                </Dialog>
            </div>


            <div className="bg-card p-2 grid grid-cols-1 rounded border w-full overflow-x-auto">
                <div>
                    <Table >
                        <TableHeader className='bg-muted w-full rounded-lg'>
                            <TableRow className=''>
                                {/* <TableHead>#</TableHead> */}
                                <TableHead>logo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>website</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {companies.map((company) => (
                                <TableRow key={company.id}>
                                    {/* <TableCell>{company.id}</TableCell> */}
                                    <TableCell>{company.logo}</TableCell>
                                    <TableCell>{company.name}</TableCell>
                                    <TableCell>{company.code}</TableCell>
                                    <TableCell>{company.email}</TableCell>
                                    <TableCell>{company.phone}</TableCell>
                                    <TableCell>{company.website}</TableCell>
                                    <TableCell>{company.address}</TableCell>

                                    <TableCell >
                                        <Badge className={
                                            company.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        } >
                                            {company.isActive ? "Active" : "Inactive"}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild className="p-2 ">
                                                {/* 3 dots */}
                                                <Button variant="ghost" className="p-2">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem >Edit</DropdownMenuItem>
                                                    {/* update dialog form */}


                                                    <DropdownMenuItem  >Delete</DropdownMenuItem>
                                                    {/* <DropdownMenuItem>View</DropdownMenuItem> */}
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

export default CompanyList
