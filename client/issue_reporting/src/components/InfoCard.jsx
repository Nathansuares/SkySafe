import React from 'react';

// Reusable component for document/circular items
const InfoCard = ({ title, subtitle, icon, onIconClick, showIcon }) => (
    <div className="bg-white p-3 rounded-lg shadow-md flex items-center justify-between mb-3 border border-gray-300">
        <div className="flex items-center">
            <i className="fas fa-file-pdf text-red-500 text-3xl mr-4"></i>
            <div>
                <h3 className="font-bold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
        </div>
        {showIcon && (
            <button onClick={onIconClick} className="text-gray-500 hover:text-gray-800">
                {icon}
            </button>
        )}
    </div>
);

export default InfoCard;
