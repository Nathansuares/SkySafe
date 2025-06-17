import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserName = localStorage.getItem('userName');

        if (!token) {
            // If no token, redirect to login
            navigate('/login');
        } else if (storedUserName) {
            setUserName(storedUserName);
        } else {
            // If token exists but userName is missing, try to fetch user info or redirect
            // For now, we'll just set a generic name or redirect to login if userName is crucial
            setUserName('User'); // Fallback to a generic name
            // Alternatively, you could navigate('/login') here if userName is strictly required
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    return (
        <div className="container-fluid bg-light min-vh-100 p-4 d-flex flex-column justify-content-center align-items-center">
            <div className="bg-white rounded-3 shadow-sm p-4 text-center" style={{ maxWidth: '28rem', width: '100%' }}>
                <h1 className="mb-4 fw-bold">Welcome {userName}</h1>
                <button className="btn btn-primary me-2" onClick={() => navigate('/dashboard')}>Dashboard</button>
                <button className="btn btn-danger me-2" onClick={handleLogout}>Logout</button>
                
                <div className="d-grid gap-3 mb-4">
                    <button 
                        onClick={() => navigate('/report')} 
                        className="btn btn-primary btn-lg rounded-3 fw-bold"
                    >
                        Issue Reporting
                    </button>
                    
                    <button 
                        onClick={() => navigate('/documents')} 
                        className="btn btn-success btn-lg rounded-3 fw-bold"
                    >
                        Documents
                    </button>
                    
                    <button 
                        onClick={() => navigate('/circulars')} 
                        className="btn btn-info btn-lg rounded-3 fw-bold"
                    >
                        Circulars
                    </button>
                </div>
                
                <div className="bg-light rounded-3 shadow-inner p-3 h-48 overflow-auto">
                    <h3 className="mb-2 fw-semibold">News & Updates</h3>
                    <p className="text-muted">
                        Here are the latest updates. The system will be undergoing scheduled maintenance this Friday. Please save your work.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;