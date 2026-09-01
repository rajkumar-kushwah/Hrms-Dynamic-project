import { Router } from "express";
import {
    countries,
    statesByCountry,
    citiesByState,
    pincodesByCity,
} from "../controllers/location.controller.js";

const router = Router();

router.get("/countries", countries);
router.get("/states/:countryCode", statesByCountry);
router.get("/cities/:countryCode/:stateCode", citiesByState);
router.get("/pincodes/:city", pincodesByCity);

export default router;