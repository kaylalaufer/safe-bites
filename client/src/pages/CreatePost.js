import React, { useState } from "react";
import { createPost } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Autocomplete } from "@react-google-maps/api";

function CreatePost() {
    const [formData, setFormData] = useState({
        restaurant: "",
        location: "",
        hidden_allergens: "",
        allergens: [],
        restrictions: [],
        experience: "",
        user: "",
        review: "",
    });

    const [autocomplete, setAutocomplete] = useState(null);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle Google Maps Autocomplete selection
    const handlePlaceSelect = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            setFormData({
                ...formData,
                restaurant: place.name || "",
                location: place.formatted_address || "",
            });
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await createPost(formData);
            console.log("Post created:", response.data);
            toast.success("Post Created! 🥳", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
                progressStyle: {
                    background: "#065F46",
                },
            });

            setFormData({
                restaurant: "",
                location: "",
                hidden_allergens: "",
                allergens: [],
                restrictions: [],
                experience: "",
                user: "",
                review: "",
            });
        } catch (error) {
            console.error("⚠️ Error creating post: ", error);
            toast.error("Error creating post. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
                progressStyle: {
                    background: "#065F46",
                },
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
        {/* Centered Title Above the Card */}
        <h1 className="text-3xl font-bold text-pink-900 mb-4 text-center">Post a Review</h1>

        {/* Form Container */}
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
            <ToastContainer />
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Restaurant Search with Google Maps Autocomplete */}
                <div>
                    <label className="block font-bold mb-2">Restaurant Name *</label>
                    <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={handlePlaceSelect}>
                        <input
                            type="text"
                            name="restaurant"
                            value={formData.restaurant}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg"
                            placeholder="Search for a restaurant..."
                            required
                        />
                    </Autocomplete>
                </div>

                {/* Location (Autofilled) */}
                <div>
                    <label className="block font-bold mb-2">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        className="w-full p-3 border rounded-lg bg-gray-100"
                        disabled
                    />
                </div>

                {/* Hidden Allergen */}
                <div>
                    <label className="block font-bold mb-2">Were there any hidden allergens?</label>
                    <input
                        type="text"
                        name="hidden_allergens"
                        value={formData.hidden_allergens}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg"
                        placeholder="Cross-contamination, allergens not listed on menu, etc."
                    />
                </div>

                {/* Experience Type with Hover Tooltips */}
                <div>
                    <label className="block font-bold mb-2">How was your experience? *</label>
                    <div className="flex gap-6">
                        {/* Safe */}
                        <label className="relative flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="experience"
                                value="safe"
                                checked={formData.experience === "safe"}
                                onChange={() => setFormData({ ...formData, experience: "safe" })}
                                required
                            />
                            ✅ Safe
                            <span className="absolute left-0 top-8 w-48 text-xs text-gray-700 bg-gray-100 p-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                No cross-contamination, restaurant fully understands allergies.
                            </span>
                        </label>

                        {/* Accommodating */}
                        <label className="relative flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="experience"
                                value="accommodating"
                                checked={formData.experience === "accommodating"}
                                onChange={() => setFormData({ ...formData, experience: "accommodating" })}
                                required
                            />
                            🟡 Accommodating
                            <span className="absolute left-0 top-8 w-48 text-xs text-gray-700 bg-gray-100 p-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                Staff was aware but some minor risks (e.g., shared kitchen).
                            </span>
                        </label>

                        {/* Unsafe */}
                        <label className="relative flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="experience"
                                value="unsafe"
                                checked={formData.experience === "unsafe"}
                                onChange={() => setFormData({ ...formData, experience: "unsafe" })}
                                required
                            />
                            ❌ Unsafe
                            <span className="absolute left-0 top-8 w-48 text-xs text-gray-700 bg-gray-100 p-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                Restaurant was not allergy-friendly, high risk of contamination.
                            </span>
                        </label>
                    </div>
                </div>

                {/* Review */}
                <div>
                    <label className="block font-bold mb-2">Review *</label>
                    <textarea
                        name="review"
                        value={formData.review}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg h-24"
                        placeholder="Write your review"
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-pink-900 text-white p-3 rounded-lg hover:bg-pink-700 transition"
                >
                    Share Post!
                </button>
            </form>
        </div>
    </div>

    );
}

export default CreatePost;
