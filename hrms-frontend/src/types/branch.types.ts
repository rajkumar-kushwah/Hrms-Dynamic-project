export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  pincode?: string;
  managerName?: string;
  latitude?: number;
  longitude?: number;
  geoRadius?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
  };
}

export interface CreateBranchPayload {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  pincode?: string;
  managerName?: string;
  latitude?: number;
  longitude?: number;
  geoRadius?: number;
}

export interface UpdateBranchPayload {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  pincode?: string;
  managerName?: string;
  latitude?: number;
  longitude?: number;
  geoRadius?: number;
  isActive?: boolean;
}