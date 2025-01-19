const express = require('express');
const router = express.Router();

// Example posts data
const posts = [
    { id: 1, user: 'Chris', restaurant: 'Donut Pub', location: 'New York', allergen: 'Peanuts', review: 'Amazing experience!' },
    { id: 2, user: 'Alex', restaurant: 'Green Plate', location: 'San Francisco', allergen: 'Dairy', review: 'Great for dairy allergies!' },
];

// GET all posts
router.get('/', (req, res) => {
    res.json(posts);
});

module.exports = router;