import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssues = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/my-issues', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          setIssues(response.data.issues);
        } else {
          setError(response.data.message || 'Failed to fetch issues.');
        }
      } catch (err) {
        console.error('Error fetching issues:', err);
        if (err.response && err.response.status === 403) {
          setError('Session expired or invalid token. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          navigate('/login');
        } else {
          setError('An error occurred while fetching issues.');
        }
      }
      setLoading(false);
    };

    fetchIssues();
  }, [navigate]);

  if (loading) {
    return <div className="container mt-5 text-center">Loading issues...</div>;
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger text-center">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Reported Issues</h2>
      {issues.length === 0 ? (
        <div className="alert alert-info">No issues reported yet.</div>
      ) : (
        <div className="row">
          {issues.map((issue) => (
            <div key={issue.issue_id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{issue.issue_name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{issue.issue_site}</h6>
                  <p className="card-text"><strong>Location:</strong> {issue.location}</p>
                  <p className="card-text"><strong>Details:</strong> {issue.issue_details}</p>
                  <p className="card-text"><small className="text-muted">Reported: {new Date(issue.date_time).toLocaleString()}</small></p>
                  {issue.image_path && (
                    <img src={`http://localhost:5000${issue.image_path}`} alt="Issue" className="img-fluid rounded mt-2" style={{ maxHeight: '200px', objectFit: 'cover' }} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

export default Dashboard;
