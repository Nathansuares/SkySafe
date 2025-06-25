import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import { FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ReactDOM from 'react-dom';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './AdminDashboard.css'; // Using dedicated CSS for the admin dashboard


const ResolveIssueModal = ({ isOpen, issue, onClose, onSubmit }) => {
    const [response, setResponse] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (response.trim()) {
            onSubmit(response);
        } else {
            alert('Please provide a response.');
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="resolve-issue-modal">
            <div className="resolve-issue-modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Resolve Issue #{issue.issue_id}</h2>
                <p><strong>Issue:</strong> {issue.issue_name}</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="response-text">Response to User:</label>
                    <textarea
                        id="response-text"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Explain the resolution..."
                        required
                        style={{ width: '100%', minHeight: '120px', padding: '10px', marginTop: '5px' }}
                    />
                    <div style={{ marginTop: '15px', textAlign: 'right' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ marginRight: '10px' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Submit Resolution</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

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

const AdminDashboard = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const sliderRef = useRef(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // State for the resolve modal
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);



    useEffect(() => {
        const fetchAdminIssues = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get('http://localhost:5000/admin/issues', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data.success) {
                    setIssues(response.data.issues);
                } else {
                    setError(response.data.message || 'Failed to fetch issues.');
                }
            } catch (err) {
                console.error('Error fetching admin issues:', err);
                if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                    setError('Access Denied. Please log in as an admin.');
                    navigate('/login');
                } else {
                    setError('An error occurred while fetching issues.');
                }
            }
            setLoading(false);
        };
        fetchAdminIssues();
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
            await axios.delete(`http://localhost:5000/admin/issues/${itemToDelete}`, {
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

    const handleUnderProcess = async (issueId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:5000/admin/issues/${issueId}/under-process`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Update the issue status in the local state to provide immediate feedback
            setIssues(prevIssues =>
                prevIssues.map(issue =>
                    issue.issue_id === issueId ? { ...issue, status: 'under process', status_updated_at: new Date().toISOString() } : issue
                )
            );
        } catch (err) {
            console.error('Error updating issue status:', err);
            setError(err.response?.data?.message || 'Failed to update status.');
        }
    };

    const handleResolveClick = (issue) => {
        setSelectedIssue(issue);
        setShowResolveModal(true);
    };

    const handleResolveSubmit = async (response) => {
        if (!selectedIssue) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:5000/admin/issues/${selectedIssue.issue_id}/resolve`, 
                { response }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Remove the resolved issue from the list
            setIssues(prevIssues => prevIssues.filter(issue => issue.issue_id !== selectedIssue.issue_id));
            setShowResolveModal(false);
            setSelectedIssue(null);
        } catch (err) {
            console.error('Error resolving issue:', err);
            // Optionally, display an error within the modal
            alert(err.response?.data?.message || 'Failed to resolve issue.');
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
            <h2 className="mb-4">Admin Dashboard - All Reported Issues</h2>
            
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
                                    <p className="card-text"><strong>Reported by:</strong> {issue.reporter_name} ({issue.reporter_designation})</p>
                                    <p className="card-text"><strong>Location:</strong> {issue.location}</p>
                                    <p className="card-text flex-grow-1"><strong>Details:</strong> {issue.issue_details}</p>
                                    {issue.image_path && (
                                        <img src={`http://localhost:5000${issue.image_path}`} alt="Issue" className="img-fluid rounded my-2" style={{ maxHeight: '150px', objectFit: 'cover' }} />
                                    )}
                                
                                    <p className="card-text"><small className="text-muted">Reported by {issue.reporter_username} ({issue.reporter_designation}) on {new Date(issue.date_time).toLocaleString()}</small></p>
                                    <p className="card-text"><small className="text-muted">Status: {issue.status}, {new Date(issue.status_updated_at).toLocaleString()}</small></p>
                                </div>
                                <div className="card-footer d-flex justify-content-around">
                                    <button className="btn btn-sm btn-outline-warning" onClick={() => handleUnderProcess(issue.issue_id)}>
                                        Under Process
                                    </button>
                                    <button className="btn btn-sm btn-outline-success" onClick={() => handleResolveClick(issue)}>
                                        Resolve
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger delete-btn" onClick={() => handleDeleteClick(issue.issue_id)}>
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

            <ResolveIssueModal
                isOpen={showResolveModal}
                issue={selectedIssue}
                onClose={() => setShowResolveModal(false)}
                onSubmit={handleResolveSubmit}
            />
        </div>
    );
};

export default AdminDashboard;
