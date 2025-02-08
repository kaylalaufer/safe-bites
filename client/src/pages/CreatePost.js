import React, { useState } from 'react';
import { createPost } from '../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreatePost() {
    const [formData, setFormData] = useState({
        restaurant: '',
        location: '',
        allergens: [],
        restrictions: [],
        positive: true,
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
                restrictions: [],
                positive: true,
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

    const availableRestrictions = [
        'Gluten-Free',
        'Vegan',
        'Vegetarian',
        'Pescatarian',
        'Kosher',
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

    // Handle tag selection
    const handleRestrictionClick = (restriction) => {
        setFormData((prevData) => {
            if (prevData.restrictions.includes(restriction)) {
                // Remove restriction if it's already selected
                return {
                    ...prevData,
                    restrictions: prevData.restrictions.filter((item) => item !== restriction),
                };
            } else {
                // Add restriction if it's not selected
                return {
                    ...prevData,
                    restrictions: [...prevData.restrictions, restriction],
                };
            }
        });
    };

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
                                        ? 'bg-emerald-800 text-white border-emerald-800'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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

                {/* Restriction Tags */} 
                <div>
                    <label className='block font-bold mb-2'>Restrictions *</label>
                    <div className='flex flex-wrap gap-2'>
                        {availableRestrictions.map((restriction) => (
                            <button
                                type='button'
                                key={restriction}
                                onClick={() => handleRestrictionClick(restriction)}
                                className={`px-3 py-1 rounded-full border ${
                                    formData.restrictions.includes(restriction)
                                        ? 'bg-emerald-800 text-white border-emerald-800'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {restriction}
                            </button>
                        ))}
                    </div>
                    <p className='text-sm text-gray-500 mt-2'>
                        Click on restrictions to select or deselect them.
                    </p>
                </div>

                {/* Experience Type */}
                <div className="mb-4">
                    <label className="block font-medium mb-2">
                        How allergy-friendly was this restaurant?
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="safety"
                                value="safe"
                                checked={formData.safety === 'safe'}
                                onChange={() => setFormData({ ...formData, safety: 'safe' })}
                            />
                            ✅ Safe & Allergy-Friendly
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="safety"
                                value="caution"
                                checked={formData.safety === 'caution'}
                                onChange={() => setFormData({ ...formData, safety: 'caution' })}
                            />
                            🟡 Accommodating, but some risk
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="safety"
                                value="unsafe"
                                checked={formData.safety === 'unsafe'}
                                onChange={() => setFormData({ ...formData, safety: 'unsafe' })}
                            />
                            ❌ Unsafe for my allergy
                        </label>
                    </div>
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