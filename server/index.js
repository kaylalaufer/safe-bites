import express from "express";
import cors from "cors"
const app = express();
import fetch from "node-fetch";

const GOOGLE_API_KEY = "AIzaSyBJBUdkvdz0P0TlU8z2QCona8e2i0U6l-o";

// Middleware
app.use(cors());
app.use(express.json());

// Import posts route
import postsRoutes from './routes/posts.js';
app.use('/api/posts', postsRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Proxy route for Places Autocomplete
app.get("/api/autocomplete", async (req, res) => {
    const input = req.query.input; // Get the input query from the frontend

    try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${GOOGLE_API_KEY}&types=establishment`;
        const response = await fetch(url);
        const data = await response.json();

        res.json(data); // Send the response back to the frontend
    } catch (error) {
        console.error("Error fetching autocomplete data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
