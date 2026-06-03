import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import React from 'react';



const DashboardStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">

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