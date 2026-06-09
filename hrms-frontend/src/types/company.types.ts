export interface Company {
  users: any;
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  logo?: string;
  gstNumber?: string;
  subscriptionPlan?: string;
  maxBranches?: number;
  maxEmployees?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyPayload {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  logo?: string;
  gstNumber?: string;
  subscriptionPlan?: string;
  maxBranches?: number;
  maxEmployees?: number;
}

export interface UpdateCompanyPayload {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  logo?: string;
  gstNumber?: string;
  subscriptionPlan?: string;
  maxBranches?: number;
  maxEmployees?: number;
  isActive?: boolean;
}

export interface AssignAdminPayload {
  name: string;
  email: string;
  password: string;
}