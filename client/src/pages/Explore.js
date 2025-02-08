import React, { useEffect, useState, useMemo } from 'react';
import { fetchPosts } from '../utils/api';
import debounce from 'lodash.debounce';
import Map from "../components/Map";

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
        <div>
            <h1 className="text-2xl font-bold mb-4">Explore Allergy-Friendly Places</h1>
            <Map />
        </div>
    );   
}

export default Explore;