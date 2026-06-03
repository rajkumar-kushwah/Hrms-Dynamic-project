// permissions.seed.ts


// her ek page ka permission assign 

export const permissionCategories = [

    {
        module: "ROLE",
        menu: true,
        permissions: [
            "VIEW",
            "CREATE",
            "UPDATE",
            "DELETE"
        ]
    },
    {
        module: "MONTHLY_ATTENDANCE",
        menu: true,
        permissions: [
            "VIEW",
            "FILTER",
            "IMPORT",
            "EXPORT",
            "TEMPLATE"
        ]
    },
    {
        module: "EMPLOYEE",
        menu: true,
        permissions: [
            "VIEW",
            "CREATE",
            "UPDATE",
            "DELETE",
            "FILTER",
        ],
    },
    {
        module: "CHECKIN",
        menu: true,
        permissions: [
            "VIEW",
            "CHECKIN",
            "CHECKOUT",
            "UPDATE",
            "DELETE",
            "FILTER",
        ],
    }
];
