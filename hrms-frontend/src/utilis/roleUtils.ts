export const normalizeRole = (role?: string | null) => {
    return role
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_");
};

export const isAdminRole = (role?: string | null) => {
    const normalizedRole = normalizeRole(role);

    return ["super_admin", "company_admin"].includes(
        normalizedRole ?? ""
    );
};



export const isCompanyAdminRole = (role?: string | null) => {
    return normalizeRole(role) === "company_admin";
};

export const isSuperAdminRole = (role?: string | null) => {
    return normalizeRole(role) === "super_admin";
};

export const isEmployeeRole = (role?: string | null) => {
    const roleName = normalizeRole(role);

    return (
        !!roleName &&
        roleName !== "super_admin" &&
        roleName !== "company_admin"
    );
};

