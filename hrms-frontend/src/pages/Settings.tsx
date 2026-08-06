// import React from 'react'
import { useAuthStore } from '@/store/auth.store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttendanceSettings from './settings/AttendanceSettings';
import GeneralSettings from './settings/GeneralSettings';

function Settings() {
    const { user } = useAuthStore()
    const isSuperAdmin = user?.role?.name === "super_admin";

    if (isSuperAdmin) {
        return (
            <div className='text-center py-8 text-muted-foreground'>
                Settings are company-specific. Please select or assign yourself to a company to configure settings.            </div>
        )
    }

    return (
        <div>
            <Tabs defaultValue="general">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <GeneralSettings />
                </TabsContent>
                <TabsContent value="attendance" >
                    <AttendanceSettings />
                </TabsContent>
            </Tabs>

        </div>
    )
}

export default Settings
