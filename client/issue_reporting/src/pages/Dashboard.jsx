import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import { FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Dashboard.css'; // New CSS for carousel and other styles

// Reusable Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, error }) => {
    if (!isOpen) return null;
    return (
        <div className="confirmation-modal">
            <div className="confirmation-modal-content">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete this issue? This action cannot be undone.</p>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="confirmation-modal-buttons">
                    <button className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>Cancel</button>
                    <button className="btn btn-danger" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const sliderRef = useRef(null);

    // State for deletion modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        const fetchIssues = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get('http://localhost:5000/my-issues', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data.success) {
                    setIssues(response.data.issues);
                } else {
                    setError(response.data.message || 'Failed to fetch issues.');
                }
            } catch (err) {
                console.error('Error fetching issues:', err);
                if (err.response && err.response.status === 403) {
                    setError('Session expired. Please log in again.');
                    navigate('/login');
                } else {
                    setError('An error occurred while fetching issues.');
                }
            }
            setLoading(false);
        };
        fetchIssues();
    }, [navigate]);

    const handleDeleteClick = (issueId) => {
        setItemToDelete(issueId);
        setShowConfirmModal(true);
        setDeleteError('');
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        setDeleteError('');
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/issues/${itemToDelete}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIssues(prevIssues => prevIssues.filter(issue => issue.issue_id !== itemToDelete));
            setShowConfirmModal(false);
            setItemToDelete(null);
        } catch (err) {
            console.error('Error deleting issue:', err);
            setDeleteError(err.response?.data?.message || 'Failed to delete issue.');
        } finally {
            setIsDeleting(false);
        }
    };

    const Arrow = ({ className, style, onClick, type }) => (
        <div
            className={`${className} carousel-arrow ${type}-arrow`}
            style={{ ...style, display: 'block' }}
            onClick={onClick}
        >
            {type === 'prev' ? <FaChevronLeft /> : <FaChevronRight />}
        </div>
    );

    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        nextArrow: <Arrow type="next" />,
        prevArrow: <Arrow type="prev" />,
        responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } },
        ],
    };

    if (loading) return <div className="container mt-5 text-center">Loading issues...</div>;
    if (error) return <div className="container mt-5 alert alert-danger text-center">{error}</div>;

    return (
        <div className="container mt-5 dashboard-container">
            <h2 className="mb-4">My Reported Issues</h2>
            {issues.length === 0 ? (
                <div className="alert alert-info">No issues reported yet.</div>
            ) : (
                <Slider ref={sliderRef} {...settings} className="issue-carousel">
                    {issues.map((issue) => (
                        <div key={issue.issue_id}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{issue.issue_name}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">{issue.issue_site}</h6>
                                    <p className="card-text"><strong>Location:</strong> {issue.location}</p>
                                    <p className="card-text flex-grow-1"><strong>Details:</strong> {issue.issue_details}</p>
                                    {issue.image_path && (
                                        <img src={`http://localhost:5000${issue.image_path}`} alt="Issue" className="img-fluid rounded my-2" style={{ maxHeight: '150px', objectFit: 'cover' }} />
                                    )}
                                    <p className="card-text mt-auto"><small className="text-muted">Reported: {new Date(issue.date_time).toLocaleString()}</small></p>
                                </div>
                                <div className="card-footer">
                                    <button className="btn btn-sm btn-outline-danger delete-btn" onClick={() => handleDeleteClick(issue.issue_id)}>
                                        <span className="btn-text">Delete</span>
                                        <span className="trash-icon"><FaTrash /></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            )}
            <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Back to Home</button>

            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                error={deleteError}
            />
        </div>
    );
};

export default Dashboard;
