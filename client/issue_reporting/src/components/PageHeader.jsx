import React from 'react';

// Header component for documents and circulars pages
const PageHeader = ({ title, onBack }) => (
    <div className="bg-gray-200 p-4 flex items-center justify-between border-b-2 border-gray-400">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <button onClick={onBack} className="text-gray-700 hover:text-gray-900">
            <i className="fas fa-home text-2xl"></i>
        </button>
    </div>
);

export default PageHeader;
