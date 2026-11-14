// components/HelpModal.js
import React from "react";

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4 text-pink-700">Welcome to Safe Bites!</h2>
        <ul className="space-y-3 text-gray-700 text-sm list-disc list-inside">
          <li>Use the <strong>Explore</strong> page to find restaurants filtered by allergens and restaurant type.</li>
          <li>Click the heart icon to save a restaurant to your favorites.</li>
          <li>Go to a restaurant page to view or post reviews. Filter by allergens for personalized safety info.</li>
          <li>Your allergy profile helps tailor what you see — update it anytime from your profile.</li>
          <li>Hidden allergens show ingredients users found but were not listed — take them seriously!</li>
          <li><strong>Note:</strong> Some features are locked if you are not logged in (i.e., posting a review and saving favorites)</li>
        </ul>
        <button
          className="mt-6 w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700"
          onClick={onClose}
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
