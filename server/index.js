const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import posts route
const postsRoutes = require('./routes/posts');
app.use('/api/posts', postsRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
