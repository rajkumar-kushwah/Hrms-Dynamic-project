export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  countryCode: string;
  city?: string;
  state?: string;
  pincode?: string;
  managerName?: string;
  latitude?: number;
  longitude?: number;
  geoRadius?: number;
  locationName?: string;
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
  countryCode: string;
  city?: string;
  state?: string;
  pincode?: string;
  managerName?: string;
  latitude?: number;
  longitude?: number;
  geoRadius?: number;
  locationName?: string;
}

export interface UpdateBranchPayload {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  countryCode?: string;
  city?: string;
  state?: string;
  pincode?: string;
  managerName?: string;
  latitude?: number;
  longitude?: number;
  geoRadius?: number;
  isActive?: boolean;
  locationName?: string;
}

export interface Country {
    iso2: string;
    name: string;
}

export interface State {
    iso2: string;
    name: string;
}

export interface City {
    name: string;
}

export interface Pincode {
    Name: string;
    Pincode: string;
    State: string;
    Country: string;
    District: string;
    Division: string;
    Region: string;
    Circle: string;
    BranchType: string;
    DeliveryStatus: string;
    Description: string | null;
}