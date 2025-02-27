import { db } from "../config/firebaseConfig.js";
import { collection, getDocs, query, where } from "firebase/firestore";

// Get restaurants within a location radius
export const getRestaurantsByLocation = async (req, res) => {
    
    try {
        const { lat, lng, radius } = req.query; // Get user's location and radius
        if (!lat || !lng || !radius) {
            console.log("Restaurant Location:", { lat, lng, radius });
            return res.status(400).json({error:"Missing required location parameters"});
        }

        // Convert radius (miles) to Firestore lat/lng boundaries
        const RADIUS_IN_DEGREES = radius / 69;
        const LARGER_RADIUS = RADIUS_IN_DEGREES *2;
        console.log(LARGER_RADIUS);

        const restaurantsRef = collection(db, "restaurants");
        
        const minLat = parseFloat(lat) - LARGER_RADIUS;
        const maxLat = parseFloat(lat) + LARGER_RADIUS;
        const minLng = parseFloat(lng) - LARGER_RADIUS;
        const maxLng = parseFloat(lng) + LARGER_RADIUS;

        console.log("Lat Range:", minLat, "to", maxLat);
        console.log("Lng Range:", minLng, "to", maxLng);

        const q = query(restaurantsRef);

        const querySnapshot = await getDocs(q);
        let restaurants = [];
        //console.log("Query Snapshot:", querySnapshot);
        querySnapshot.forEach((doc) => {
            console.log("HERE");
            let data = doc.data();
            const location = data.location;

            // Calculate the distance from the query point to the restaurant's location
            const distance = getDistanceFromLatLonInKm(lat, lng, location.latitude, location.longitude);
            console.log(`Distance: ${distance} km`);

            // If the restaurant is within the radius, push it into the result
            if (distance <= radius) {
                restaurants.push({
                    id: doc.id,
                    place_id: data.place_id,
                    name: data.name,
                    location: data.location,
                    category: data.category, // Google Places category
                    likesCount: data.likesCount || 0,
                    experiences: data.experiences || { positive: {}, negative: {} },
                });
            }
        });

        // Sort results by most liked restaurants
        restaurants.sort((a, b) => b.likesCount - a.likesCount);

        res.json(restaurants);
    } catch (error) {
        console.error("🔥 Error fetching restaurants by location:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Helper function to calculate distance
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;  // Distance in km
};

const deg2rad = (deg) => deg * (Math.PI / 180);