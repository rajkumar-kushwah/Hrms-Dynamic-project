import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { getCompanies, getMyCompany } from '@/services/company.service';
import type { Company } from '@/types/company.types';
import { useAuthStore } from '@/store/auth.store';
import { getCompanyUsers } from '@/services/companyUser.service';
import type { CompanyUser } from '@/types/companyuser.types';
import type { Branch } from '@/types/branch.types';
import { toast } from 'sonner';
import { getBranches } from "@/services/branch.service";

const DashboardStats = () => {
    const { user } = useAuthStore();
    const isCompanyAdmin = user?.role?.name === "company_admin";
    const isSuperAdmin = user?.role?.name === "super_admin";

    const [companies, setCompanies] = useState<Company[]>([]);
    const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    // React.useEffect(() => {
    //     const fetchCompanies = async () => {
    //         try {
    //             if (isSuperAdmin) {
    //                 // Super Admin - sabhi companies
    //                 const res = await getCompanies();
    //                 setCompanies(res.data.data);
    //             } else if (isCompanyAdmin) {
    //                 // Company Admin - sirf apni company
    //                 const res = await getMyCompany();
    //                 setCompanies([res.data.data]);
    //             }else if(isCompanyAdmin) {
    //                 const res = await getCompanyUsers();
    //                 setCompanies([res.data.data]);
    //             }
    //             // Baaki roles ke liye company stats nahi
    //         } catch (err) {
    //             console.log(err);
    //         }
    //     }
    //     fetchCompanies();
    // }, [])

    React.useEffect(() => {
        const fetchData = async () => {

            try {
                if (isSuperAdmin) {
                    const [companyRes, userRes, branchRes] = await Promise.all([
                        getCompanies(),
                        getCompanyUsers(),
                        getBranches(),
                    ])

                    setCompanies(companyRes.data.data);
                    setCompanyUsers(userRes.data.data);
                    setBranches(branchRes.data.data);
                } else if (isCompanyAdmin) {
                    const [companyRes, branchRes, userRes] = await Promise.all([
                        getMyCompany(),
                        getBranches(),
                        getCompanyUsers(),
                    ])
                    // const companyRes = await getMyCompany();


                    setCompanyUsers(userRes.data.data);
                    setCompanies([companyRes.data.data]);
                    setBranches(branchRes.data.data);

                }
            } catch (err: any) {
                toast.error(err.message || "Failed to fetch data");
            }
        }
        if (user) {
            fetchData();
        }
    }, [user, isSuperAdmin, isCompanyAdmin])

    const totalCompanies = companies.length;
    const activeUsers = companyUsers.filter((user) => user.isActive).length;

    const totalCompaniesUsers = companyUsers.length;
    const totalUsers = companyUsers.length;
    const inactiveUsers = companyUsers.filter((user) => !user.isActive).length;
    const totalBranches = branches.length;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {/* Sirf Super Admin ko Total Companies dikhao */}
            {isSuperAdmin && (
                <>
                    <Card className="p-4 border rounded-xl">
                        <CardTitle className="text-sm md:text-sm">Total Companies</CardTitle>
                        <CardDescription className="text-xl font-bold">
                            {totalCompanies}
                        </CardDescription>
                    </Card>
                    <Card className="p-4 border rounded-xl">
                        <CardTitle className="text-sm md:text-sm">Total CompaniesUsers</CardTitle>
                        <CardDescription className="text-xl font-bold">
                            {totalCompaniesUsers}
                        </CardDescription>
                    </Card>
                </>
            )}

            {(isSuperAdmin || isCompanyAdmin) && (
                <>
                    <Card className="p-4 border rounded-xl">
                        <CardTitle className="text-sm md:text-sm">Total Users</CardTitle>
                        <CardDescription className="text-xl font-bold text-foreground">
                            {totalUsers}
                        </CardDescription>
                    </Card>

                    <Card className="p-4 border rounded-xl">
                        <CardTitle className="text-sm md:text-sm">Active Users</CardTitle>
                        <CardDescription className="text-xl font-bold text-green-600">
                            {activeUsers}
                        </CardDescription>
                    </Card>

                    <Card className="p-4 border rounded-xl">
                        <CardTitle className="text-sm md:text-sm">Inactive Users</CardTitle>
                        <CardDescription className="text-xl font-bold text-red-500">
                            {inactiveUsers}
                        </CardDescription>
                    </Card>

                    <Card className="p-4 border rounded-xl">
                        <CardTitle className="text-sm md:text-sm">Total Branches</CardTitle>
                        <CardDescription className="text-xl font-bold">
                            {totalBranches}
                        </CardDescription>
                    </Card>
                </>
            )}


            <Card className="p-4 border rounded-xl">
                <CardTitle className="text-sm md:text-sm">Total Employees</CardTitle>
                <CardDescription className="text-xl font-bold">0</CardDescription>
            </Card>

            <Card className="p-4 border rounded-xl">
                <CardTitle className="text-sm md:text-sm">Total Departments</CardTitle>
                <CardDescription className="text-xl font-bold">0</CardDescription>
            </Card>

            <Card className="p-4 border rounded-xl">
                <CardTitle className="text-sm md:text-sm">Today Attendance</CardTitle>
                <CardDescription className="text-xl font-bold">0</CardDescription>
            </Card>

        </div>
    );
};

export default DashboardStats;