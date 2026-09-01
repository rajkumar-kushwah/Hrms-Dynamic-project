const BASE_URL = "https://api.countrystatecity.in/v1";

const getHeaders = () => ({
    "X-CSCAPI-KEY": process.env.CSC_API_KEY || "",
});

// Get all countries
export const getCountries = async () => {
    const response = await fetch(`${BASE_URL}/countries`, {
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch countries");
    }

    return await response.json();
};


// Get states by country
export const getStatesByCountry = async (countryCode: string) => {
    const response = await fetch(
        `${BASE_URL}/countries/${countryCode}/states`,
        {
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch states");
    }

    return await response.json();
};


// Get cities by state
export const getCitiesByState = async (
    countryCode: string,
    stateCode: string
) => {
    const response = await fetch(
        `${BASE_URL}/countries/${countryCode}/states/${stateCode}/cities`,
        {
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch cities");
    }

    return await response.json();
};


// Get pincodes by city
export const getPincodesByCity = async (city: string) => {
    const response = await fetch(
        `https://api.postalpincode.in/postoffice/${encodeURIComponent(city)}`,
    );

    if (!response.ok) {
        throw new Error("Failed to fetch pincode");
    }

    const data = await response.json();

    if (!data?.[0] || data[0].Status !== "Success") {
        return [];
    }

    return data[0].PostOffice || [];
};