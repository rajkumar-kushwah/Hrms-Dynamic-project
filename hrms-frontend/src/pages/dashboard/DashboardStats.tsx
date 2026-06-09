import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { getCompanies, getMyCompany } from '@/services/company.service';
import type { Company } from '@/types/company.types';
import { useAuthStore } from '@/store/auth.store';
import { getCompanyUsers } from '@/services/companyuser.service';
import type { CompanyUser } from '@/types/companyuser.types';
import { toast } from 'sonner';

const DashboardStats = () => {
    const { user } = useAuthStore();
    const isCompanyAdmin = user?.role?.name === "company_admin";
    const isSuperAdmin = user?.role?.name === "super_admin";

    const [companies, setCompanies] = useState<Company[]>([]);
    const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);

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
                    const [companyRes, userRes] = await Promise.all([
                        getCompanies(),
                        getCompanyUsers(),
                    ])

                    setCompanies(companyRes.data.data);
                    setCompanyUsers(userRes.data.data);
                } else if (isCompanyAdmin) {
                    const companyRes = await getMyCompany();


                    setCompanies([companyRes.data.data]);
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to fetch data");
            }
        }
        fetchData();
    }, [])

    const totalCompanies = companies.length;
    const activeUsers = companyUsers.filter((user) => user.isActive).length;

    const totalCompaniesUsers = companyUsers.length;
    const totalUsers = companyUsers.length;
    const inactiveUsers = companyUsers.filter((user) => !user.isActive).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">

            {/* Sirf Super Admin ko Total Companies dikhao */}
            {isSuperAdmin && (
                <>
                    <Card className="p-4 border rounded-xl">
                        <CardTitle>Total Companies</CardTitle>
                        <CardDescription className="text-xl font-bold">
                            {totalCompanies}
                        </CardDescription>
                    </Card>
                    <Card className="p-4 border rounded-xl">
                        <CardTitle>Total CompaniesUsers</CardTitle>
                        <CardDescription className="text-xl font-bold">
                            {totalCompaniesUsers}
                        </CardDescription>
                    </Card>
                </>
            )}

            {isSuperAdmin && (
                <>
                    <Card className="p-4 border rounded-xl">
                        <CardTitle className="text-sm">Total Users</CardTitle>
                        <CardDescription className="text-xl font-bold text-foreground">
                            {totalUsers}
                        </CardDescription>
                    </Card>

                    <Card className="p-4 border rounded-xl">
                        <CardTitle className="text-sm">Active Users</CardTitle>
                        <CardDescription className="text-xl font-bold text-green-600">
                            {activeUsers}
                        </CardDescription>
                    </Card>

                    <Card className="p-4 border rounded-xl">
                        <CardTitle className="text-sm">Inactive Users</CardTitle>
                        <CardDescription className="text-xl font-bold text-red-500">
                            {inactiveUsers}
                        </CardDescription>
                    </Card>
                </>
            )}


            <Card className="p-4 border rounded-xl">
                <CardTitle>Total Employees</CardTitle>
                <CardDescription className="text-xl font-bold">0</CardDescription>
            </Card>

            <Card className="p-4 border rounded-xl">
                <CardTitle>Total Departments</CardTitle>
                <CardDescription className="text-xl font-bold">0</CardDescription>
            </Card>

            <Card className="p-4 border rounded-xl">
                <CardTitle>Total Branches</CardTitle>
                <CardDescription className="text-xl font-bold">0</CardDescription>
            </Card>

            <Card className="p-4 border rounded-xl">
                <CardTitle>Today Attendance</CardTitle>
                <CardDescription className="text-xl font-bold">0</CardDescription>
            </Card>

        </div>
    );
};

export default DashboardStats;