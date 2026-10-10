export const isAdminRole = (
    roleName?: string | null
): boolean => {
    const normalizedRole = roleName
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "_");

    return (
        normalizedRole === "super_admin" ||
        normalizedRole === "company_admin"
    );
};