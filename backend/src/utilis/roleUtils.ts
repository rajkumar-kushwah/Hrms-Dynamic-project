export const isAdminRole = (role?: string | null) => {
    const normalized = role
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "_");

    return (
        normalized === "super_admin" ||
        normalized === "company_admin"
    );
};