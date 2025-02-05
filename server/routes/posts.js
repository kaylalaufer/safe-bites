const express = require('express');
const router = express.Router();

// Example posts data
const posts = [
    { id: 1, user: 'Chris', restaurant: 'Donut Pub', location: 'New York', allergens: ['Peanuts'], review: 'Amazing experience!' },
    { id: 2, user: 'Alex', restaurant: 'Green Plate', location: 'San Francisco', allergens: ['Dairy'], review: 'Great for dairy allergies!' },
];

// GET all posts
router.get('/', (req, res) => {
    res.json(posts);
});

// POST a new post
router.post('/', (req, res) => {
    // Retrieve the data from the request body
    const newPost = {
        ...req.body,
        allergens: req.body.allergens || [], // Default to an empty array
    };

    // THIS WILL NEED TO BE UPDATED LATER
    newPost.id = posts.length + 1; // Assign a unique ID

    posts.push(newPost); // Add the new post to the in-memory storage
    res.status(201).json(newPost); // Respond with the created post
});

module.exports = router;