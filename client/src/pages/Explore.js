import React, { useEffect, useState } from 'react';
import { fetchPosts } from '../utils/api';

function Explore() {
    const [posts, setPosts] = useState([]);

    // Fetch posts when the component loads
    useEffect(() => {
        fetchPosts()
            .then((response) => setPosts(response.data))
            .catch((error) => console.error('Error fetching posts:', error));
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-center text-pink-900 mb-6">Explore Posts</h1>
            <div className="max-w-4xl mx-auto">   
                {posts.length > 0 ? (
                    <ul className="space-y-4">
                        {posts.map((post) => (
                            <li key={post.id} className="bg-white p-4 shadow rounded">
                                <h2 className="text-xl font-bold">{post.restaurant}</h2>
                                <p className='text-gray-500'>Location: {post.location}</p>
                                <p className="text-gray-500">Allergen: {post.allergen}</p>
                                <p className="mt-2">{post.review}</p>
                                <p className="mt-4 text-sm text-gray-400">- {post.user}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className='text-center text-gray-600'>No posts available.</p>
                )}
            </div>
        </div>
    );
}

export default Explore;