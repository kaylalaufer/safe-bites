import axios from 'axios';

// Create an Axios instance for the backend
const API = axios.create({ baseURL: 'http://localhost:5001' });

// Fetch all posts
export const fetchPosts = () => API.get('/api/posts');

// Create post API
export const createPost = (postData) => API.post('/api/posts', postData);

// Export API calls as functions
//export const fetchBackend = () => API.get('/');