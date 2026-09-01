import type { Request, Response } from "express";
import {
    getCountries,
    getStatesByCountry,
    getCitiesByState,
    getPincodesByCity,
} from "../services/location.service.js";


// Get all countries
export const countries = async (req: Request, res: Response) => {
    try {
        const data = await getCountries();

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || "Failed to fetch countries",
        });
    }
};


// Get states by country
export const statesByCountry = async (
    req: Request,
    res: Response
) => {
    try {
        const countryCode = String(req.params.countryCode);

        if (!countryCode) {
            return res.status(400).json({
                success: false,
                message: "Country code is required",
            });
        }

        const data = await getStatesByCountry(countryCode);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || "Failed to fetch states",
        });
    }
};


// Get cities by state
export const citiesByState = async (
    req: Request,
    res: Response
) => {
    try {
        const countryCode = String(req.params.countryCode);
        const stateCode = String(req.params.stateCode);

        if (!countryCode || !stateCode) {
            return res.status(400).json({
                success: false,
                message: "Country code and state code are required",
            });
        }

        const data = await getCitiesByState(
            countryCode,
            stateCode
        );

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || "Failed to fetch cities",
        });
    }
};


// Get pincodes by city
export const pincodesByCity = async (
    req: Request,
    res: Response
) => {
    try {
        const city = String(req.params.city);

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City is required",
            });
        }

        const data = await getPincodesByCity(city);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || "Failed to fetch pincodes",
        });
    }
};