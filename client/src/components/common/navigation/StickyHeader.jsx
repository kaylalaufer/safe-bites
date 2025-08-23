import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // if using lucide for icons

const StickyHeader = ({ title = "Back" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/explore");
    }
  };

  return (
    <div className="fixed top-0 left-0 z-50 p-3">
      <button
        onClick={handleBack}
        className="text-sm text-gray-700 hover:text-pink-600 font-medium"
      >
        <ArrowLeft size={24} />
      </button>
    </div>
  );
};

export default StickyHeader;
