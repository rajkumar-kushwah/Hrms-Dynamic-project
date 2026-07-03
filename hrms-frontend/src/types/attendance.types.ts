
export interface Attendance {
    
    id: string;
    userId: string;
    companyId: string;
    branchId: string;
    date: string;
    punchInTime: string;
    punchOutTime: string;
    punchInLat?: number;
    punchInLng?: number;
    punchOutLat?: number;
    punchOutLng?: number;
    isWithinGeoFence: boolean;
    status: string;
    workingHours: number;
     createdAt: string;
     updatedAt: string;
     user: {
        id: string;
        name: string;
        employeeCode: string;
        designation: string;
     }
     branch: {
        id: string;
        name: string;
     }

}