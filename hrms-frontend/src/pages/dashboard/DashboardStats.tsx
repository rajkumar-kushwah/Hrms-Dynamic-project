import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { getCompanies, getMyCompany } from '@/services/company.service';
import type { Company } from '@/types/company.types';
import { useAuthStore } from '@/store/auth.store';

const DashboardStats = () => {
    const { user } = useAuthStore();
    const isCompanyAdmin = user?.role?.name === "company_admin";
    const isSuperAdmin = user?.role?.name === "super_admin";

    const [companies, setCompanies] = useState<Company[]>([]);

    React.useEffect(() => {
        const fetchCompanies = async () => {
            try {
                if (isSuperAdmin) {
                    // Super Admin - sabhi companies
                    const res = await getCompanies();
                    setCompanies(res.data.data);
                } else if (isCompanyAdmin) {
                    // Company Admin - sirf apni company
                    const res = await getMyCompany();
                    setCompanies([res.data.data]);
                }
                // Baaki roles ke liye company stats nahi
            } catch (err) {
                console.log(err);
            }
        }
        fetchCompanies();
    }, [])

    const totalCompanies = companies.length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">

            {/* Sirf Super Admin ko Total Companies dikhao */}
            {isSuperAdmin && (
                <Card className="p-4 border rounded-xl">
                    <CardTitle>Total Companies</CardTitle>
                    <CardDescription className="text-xl font-bold">
                        {totalCompanies}
                    </CardDescription>
                </Card>
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