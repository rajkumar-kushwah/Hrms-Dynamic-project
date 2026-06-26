export interface Module {
  id: number;
  name: string;
  displayName: string;
}

export interface Permission {
  moduleId: number;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  isSystemRole: boolean;
  company?: {
    id: string;
    name: string;
  } | null;

  permissions: {
    module: Module;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }[];

  _count: {
    user: number;
  };
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface UpdateRolePayload {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Role {
  id: number;
  name: string;
}