import React from 'react';

// Tab button component for a consistent look and feel
const TabButton = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-1/2 py-2 text-center font-semibold rounded-t-lg transition-colors duration-300 ${isActive ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-600 hover:bg-gray-400'}`}
    >
        {label}
    </button>
);

export default TabButton;
