import { api } from "../api/axios";

export const getCountries = async () => {
    const response = await api.get("/location/countries");
    return response.data;
};

export const getStates = async (countryCode: string) => {
    const response = await api.get(`/location/states/${countryCode}`);
    return response.data;
};

export const getCities = async (
    countryCode: string,
    stateCode: string
) => {
    const response = await api.get(
        `/location/cities/${countryCode}/${stateCode}`
    );
    return response.data;
};

export const getPincodes = async (city: string) => {
    const response = await api.get(`/location/pincodes/${city}`);
    return response.data;
};