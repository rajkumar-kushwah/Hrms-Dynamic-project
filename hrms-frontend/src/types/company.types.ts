export interface Company {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


// create company
export interface CreateCompanyPayload {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  logo?: string;
}

// update company
export interface UpdateCompanyPayload {
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  logo?: string;
  isActive?: boolean;
}