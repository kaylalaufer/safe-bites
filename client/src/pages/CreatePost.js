import React, { useState } from 'react';
import { createPost } from '../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreatePost() {
    const [formData, setFormData] = useState({
        restaurant: '',
        location: '',
        allergens: [],
        user: '',
        review: '',
        rating: '',
    });

    // Handle input changes
    const handleChange = (e) => {
        const {name, value } = e.target;
        setFormData({...formData, [name]: value});
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await createPost(formData);
            console.log('Post created:', response.data);
            toast.success('Post Created! 🥳', {
                position: 'top-right',
                autoClose: 3000, // Closes in 3 seconds
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
                progressStyle: {
                    background: '#065F46', // Tailwind emerald-800
                },
            });
            // Reset the form after successful submission
            setFormData({
                restaurant: '',
                location: '',
                allergens: [],
                user: '',
                review: '',
                rating: '',
            });
        } catch (error) {
            console.error('⚠️ Error creating post: ', error);
            toast.error('Error creating post. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
                progressStyle: {
                    background: '#065F46', // Tailwind emerald-800
                },
            });
        }
    };

    const availableAllergens = [
        'Peanuts',
        'Tree Nuts',
        'Gluten',
        'Dairy',
        'Soy',
        'Eggs',
        'Fish',
        'Shellfish',
        'Sesame',
    ];

    // Handle tag selection
    const handleTagClick = (allergen) => {
        setFormData((prevData) => {
            if (prevData.allergens.includes(allergen)) {
                // Remove allergen if it's already selected
                return {
                    ...prevData,
                    allergens: prevData.allergens.filter((item) => item !== allergen),
                };
            } else {
                // Add allergen if it's not selected
                return {
                    ...prevData,
                    allergens: [...prevData.allergens, allergen],
                };
            }
        });
    };

    // UPDATE ALLERGEN TAGS BELOW

    return (
        <div className='p-6'>
            <ToastContainer/>
            <h1 className='text-3xl font-bold text-center mb-6 text-pink-900'>Post a Review</h1>
            <form onSubmit={handleSubmit} className='max-w-lg mx-auto space-y-4'>
                {/* Restaurant Name */}
                <div>
                    <label className='block font-bold mb-2'>Restaurant Name *</label>
                    <input
                        type='text'
                        name='restaurant'
                        value={formData.restaurant}
                        onChange={handleChange}
                        className='w-full p-2 border rounded'
                        placeholder='Enter restaurant name'
                        required
                    />
                </div>

                {/* Location */}
                <div>
                    <label className='block font-bold mb-2'>Location *</label>
                    <input
                        type='text'
                        name='location'
                        value={formData.location}
                        onChange={handleChange}
                        className='w-full p-2 border rounded'
                        placeholder='Enter Location'
                        required
                    />
                </div>

                {/* Allergen Tags */} 
                <div>
                    <label className='block font-bold mb-2'>Allergens *</label>
                    <div className='flex flex-wrap gap-2'>
                        {availableAllergens.map((allergen) => (
                            <button
                                type='button'
                                key={allergen}
                                onClick={() => handleTagClick(allergen)}
                                className={`px-3 py-1 rounded-full border ${
                                    formData.allergens.includes(allergen)
                                        ? 'bg-emerald-800 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                {allergen}
                            </button>
                        ))}
                    </div>
                    <p className='text-sm text-gray-500 mt-2'>
                        Click on allergens to select or deselect them.
                    </p>
                </div>

                {/* Review (Optional) */}
                <div>
                    <label className='block font-bold mb-2'>Review</label>
                    <textarea
                        name='review'
                        value={formData.review}
                        onChange={handleChange}
                        className='w-full p-2 border rounded'
                        placeholder='Write your review (optional)'
                    />
                </div>

                {/* Rating (Optional) */}
                <div>
                    <label className="block font-bold mb-2">Rating (1-5)</label>
                    <input
                        type="number"
                        name="rating"
                        value={formData.rating}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="Enter a rating (optional)"
                        min="1"
                        max="5"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type='submit'
                    className='w-full bg-stone-300 text-pink-900 p-2 rounded hover:bg-pink-100'
                >
                    Share Post!
                </button>
            </form>
        </div>
    );
}

export default CreatePost;