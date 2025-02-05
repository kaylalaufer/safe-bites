import React, { useEffect, useState, useMemo } from 'react';
import { fetchPosts } from '../utils/api';
import debounce from 'lodash.debounce';

function Explore() {
    const [posts, setPosts] = useState([]); // State to store all posts
    const [loading, setLoading] = useState(true); // Loading state
    const [filteredPosts, setFilterPosts] = useState([]); // State to store filtered posts
    const [searchTerm, setSearchTerm] = useState(''); // For search input
    const [selectedAllergens, setSelectedAllergens] = useState([]); // For allergen filter

    useEffect(() => {
        // Fetch posts from the backend
        const loadPosts = async () => {
            try {
                const response = await fetchPosts();
                setPosts(response.data); // Update state with fetched posts
                setFilterPosts(response.data); // Initially show all posts
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false); // Stop loading
            }
        };
        loadPosts();
    }, []);

    // Debounced Search Handler
    const debounceSearch = useMemo(
        () =>
            debounce((value) => {
                const filtered = posts.filter((post) => {
                    const matchesSearch = 
                        post.restaurant.toLowerCase().includes(value.toLowerCase()) ||
                        post.location.toLowerCase().includes(value.toLowerCase()) ||
                        post.review.toLowerCase().includes(value.toLowerCase());
                    const matchesAllergens =
                        selectedAllergens.length === 0 ||
                        selectedAllergens.every((allergen) =>
                            post.allergens.includes(allergen)
                        );
                    return matchesSearch && matchesAllergens;
                });
                setFilterPosts(filtered);
            }, 900),
        [posts, selectedAllergens]
    );

    // ***
    // Trigger debounced search on searchTerm change
    useEffect(() => {
        debounceSearch(searchTerm);
        return () => debounceSearch.cancel();
    }, [searchTerm, debounceSearch]);

    const handleAllergenToggle = (allergen) => {
        setSelectedAllergens((prev) =>
            prev.includes(allergen)
            ? prev.filter((item) => item !== allergen)
            : [...prev, allergen]
        );
    };

    if (loading) {
        return <p className='text-center text-gray-500'>Loading posts...</p>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Page Title */}
            <h1 className="text-4xl font-extrabold text-center text-pink-900 mb-8">
                Explore Posts
            </h1>
    
            {/* Search Bar and Allergen Filters */}
            <div className="flex flex-col items-center gap-4 mb-8 bg-white p-6 rounded-lg shadow-md">
                {/* Centered Search Bar */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search City, Zip Code, Restaurant, or Restriction"
                    className="w-full md:w-2/3 lg:w-1/2 p-3 border rounded-lg shadow-sm focus:ring focus:ring-emerald-300 placeholder-gray-500"
                />
    
                {/* Allergen Filters */}
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                    {[
                        'Peanuts',
                        'Tree Nuts',
                        'Gluten',
                        'Dairy',
                        'Soy',
                        'Eggs',
                        'Fish',
                        'Shellfish',
                        'Sesame',
                    ].map((allergen) => (
                        <button
                            key={allergen}
                            type="button"
                            onClick={() => handleAllergenToggle(allergen)}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                                selectedAllergens.includes(allergen)
                                    ? 'bg-emerald-800 text-white border-emerald-800'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {allergen}
                        </button>
                    ))}
                </div>
            </div>
    
            {/* Posts Section */}
            <div className="space-y-6">
                {filteredPosts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-all"
                    >
                        <h2 className="text-2xl font-bold text-emerald-700 mb-2">
                            {post.restaurant}
                        </h2>
                        <p className="text-gray-600 mb-1">
                            <span className="font-semibold">Location:</span> {post.location}
                        </p>
                        <p className="text-gray-600 mb-1">
                            <span className="font-semibold">Allergens:</span>{' '}
                            {post.allergens.join(', ') || 'None specified'}
                        </p>
                        <p className="text-gray-600 mb-1">
                            <span className="font-semibold">Restrictions:</span>{' '}
                            {post.restrictions.join(', ') || 'None specified'}
                        </p>
                        {post.review && (
                            <p className="text-gray-800 mt-3 italic">"{post.review}"</p>
                        )}
                        <p className="text-sm text-gray-500 mt-4">
                            Posted by <span className="font-medium">{post.user}</span>
                        </p>
                    </div>
                ))}
    
                {filteredPosts.length === 0 && (
                    <p className="text-center text-gray-500">
                        No posts found. Try adjusting your filters.
                    </p>
                )}
            </div>
        </div>
    );    
    
}

export default Explore;