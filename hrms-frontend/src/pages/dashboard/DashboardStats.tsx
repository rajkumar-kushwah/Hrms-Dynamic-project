import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { getCompanies } from '@/services/company.service';
import type { Company } from '@/types/company.types';




const DashboardStats = () => {
    const [companies, setCompanies] = useState<Company[]>([]);

    React.useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await getCompanies();
                setCompanies(res.data.data);
            } catch (err) {
                console.log(err);
            }
        }
        fetchCompanies();
    }, [])
    

    const totalCompanies = companies.length;
    // const totalCompanies = 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">

            <Card className="p-4 border rounded-xl">
                <CardTitle>Total Companies</CardTitle>
                <CardDescription className="text-xl font-bold">{totalCompanies}</CardDescription>
            </Card>
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