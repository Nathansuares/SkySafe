import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; 

const SignupPage = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [designation, setDesignation] = useState('Pilot');
    const navigate = useNavigate();

    const handleSubmit = async (e) => { 
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/signup', { 
                name,
                username,
                password,
                designation
            });
            alert(response.data.message);
            if (response.data.success) {
                navigate('/login'); 
            }
        } catch (error) {
            console.error('Signup error:', error.response ? error.response.data : error.message);
            alert(error.response ? error.response.data.message : 'An error occurred during signup.');
        }
    };

    return (
        <div className="container-fluid bg-light min-vh-100 d-flex justify-content-center align-items-center p-4">
            <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="card-title text-center mb-4 fw-bold">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="nameInput" className="form-label">Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="nameInput" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="usernameInput" className="form-label">Username</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="usernameInput" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="passwordInput" className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            id="passwordInput" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirmPasswordInput" className="form-label">Confirm Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            id="confirmPasswordInput" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="designationInput" className="form-label">Designation</label>
                        <select 
                            id="designationInput" 
                            className="form-select" 
                            value={designation} 
                            onChange={(e) => setDesignation(e.target.value)} 
                            required
                        >
                            <option value="Pilot">Pilot</option>
                            <option value="Cabin crew">Cabin crew</option>
                            <option value="Ground Staff">Ground Staff</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-success w-100 mb-3">Sign Up</button>
                    <p className="text-center mb-0">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
