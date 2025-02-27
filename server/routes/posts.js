import express from "express";
const router = express.Router();

// Example posts data
const posts = [
    { id: 1, user: 'Chris', restaurant: 'Donut Pub', location: 'New York', allergens: ['Peanuts'], restrictions: [], review: 'Amazing experience!' },
    { id: 2, user: 'Alex', restaurant: 'Green Plate', location: 'San Francisco', allergens: ['Dairy'], restrictions: [], review: 'Great for dairy allergies!' },
];

// GET all posts
router.get('/', (req, res) => {
    res.json(posts);
});

// POST a new post
router.post('/', (req, res) => {
    const { user, restaurant, location, allergens, restrictions, safety, review } = req.body;

    // Validation: Require user, restaurant, and location
    if (!user || !restaurant || !location) {
        return res.status(400).json({ error: 'User, restaurant, and location are required.' });
    }

    // Ensure safety is either "safe", "caution", "unsafe", or default to "not provided"
    const validSafetyOptions = ["safe", "caution", "unsafe"];
    const safetyCategory = validSafetyOptions.includes(safety) ? safety : "not provided";

    // Create a new post object
    const newPost = {
        id: posts.length + 1, // Assign unique ID (temporary, will use DB later)
        user,
        restaurant,
        location,
        allergens: allergens || [], // Default empty array
        restrictions: restrictions || [],
        safety: safetyCategory, // Ensures safety falls within valid categories
        review: review || "",
    };

    posts.push(newPost); // Add to in-memory posts array
    res.status(201).json(newPost); // Respond with the created post
});

export default router;