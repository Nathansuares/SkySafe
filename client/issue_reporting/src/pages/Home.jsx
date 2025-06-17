import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { FaFileAlt, FaExclamationTriangle, FaTasks } from 'react-icons/fa';

const Home = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserName = localStorage.getItem('userName');

        if (!token) {
            navigate('/login');
        } else if (storedUserName) {
            setUserName(storedUserName);
        } else {
            setUserName('User'); 
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1 className="welcome-message">Welcome, {userName}</h1>
                <nav>
                    <button className="btn btn-outline-light me-2" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                </nav>
            </header>

            <main className="home-main">
                <div className="feature-card" onClick={() => navigate('/report')}>
                    <FaExclamationTriangle size={40} className="feature-icon" />
                    <h2>Report an Issue</h2>
                    <p>Submit a new issue report. Provide details about the problem, and attach relevant screenshots or documents to help us resolve it quickly.</p>
                    <button className="btn btn-primary">Go to Reporting</button>
                </div>
                <div className="feature-card" onClick={() => navigate('/documents')}>
                    <FaFileAlt size={40} className="feature-icon" />
                    <h2>View Documents</h2>
                    <p>Access and review all submitted documents and reports. Search, filter, and manage your files in one centralized location.</p>
                    <button className="btn btn-primary">Go to Documents</button>
                </div>
                <div className="feature-card" onClick={() => navigate('/status')}>
                    <FaTasks size={40} className="feature-icon" />
                    <h2>Check Status</h2>
                    <p>Track the status of your reported issues. See the progress, view updates from the support team, and know when your issue is resolved.</p>
                    <button className="btn btn-primary">Go to Status</button>
                </div>
            </main>
        </div>
    );
};

export default Home;