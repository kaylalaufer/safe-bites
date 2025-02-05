import React, { useEffect, useState } from 'react';
import { fetchPosts } from '../utils/api';

function Explore() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    // Fetch posts when the component loads
    useEffect(() => {
        // Fetch posts from the backend
        const loadPosts = async () => {
            try {
                const response = await fetchPosts();
                setPosts(response.data); // Update state with fetched posts
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false); // Stop loading
            }
        };
        loadPosts();
    }, []);

    if (loading) {
        return <p className='text-center text-gray-500'>Loading posts...</p>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-center text-pink-900 mb-6">Explore Posts</h1>
            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white shadow rounded p-4">
                        <h2 className="text-xl font-bold">{post.restaurant}</h2>
                        <p className="text-gray-600">Location: {post.location}</p>
                        <p className="text-gray-600">
                            Allergens: {post.allergens ? post.allergens.join(', ') : 'None specified'}
                        </p>
                        {post.review && <p className="text-gray-800 mt-2">{post.review}</p>}
                        <p className="text-gray-500 text-sm mt-2">- {post.user}</p>
                    </div>
                ))}
                {posts.length === 0 && (
                    <p className="text-center text-gray-500">No posts available.</p>
                )}
            </div>
        </div>
    );
}

export default Explore;