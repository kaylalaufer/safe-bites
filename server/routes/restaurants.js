import express from "express";
import { getRestaurantsByLocation } from "../controllers/restaurantController.js";

const router = express.Router();
// Route to get restaurants filtered by location
router.get("/", getRestaurantsByLocation);

export default router;