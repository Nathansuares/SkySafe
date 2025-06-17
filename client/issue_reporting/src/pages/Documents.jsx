import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { mockData } from '../data/mockData';

const PageHeader = ({ title, onBack, backIcon }) => (
    <div className="d-flex align-items-center justify-content-between p-3 bg-primary text-white sticky-top">
        <button onClick={onBack} className="btn btn-link text-white text-decoration-none d-flex align-items-center">
            {backIcon || '← Back'}
        </button>
        <h2 className="mb-0">{title}</h2>
        <div style={{ width: '40px' }}></div>
    </div>
);

const TabButton = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`btn ${isActive ? 'btn-primary' : 'btn-outline-primary'} mx-2 fw-bold`}
    >
        {label}
    </button>
);

const DocumentItem = ({ doc }) => (
    <div className="list-group-item d-flex justify-content-between align-items-center p-3 mb-2 rounded-3 shadow-sm">
        <div>
            <h6 className="mb-1 fw-bold">{doc.document_name}</h6>
            <p className="mb-1 text-muted">Issued: {format(new Date(doc.issue_date), 'PPP')}</p>
            {doc.expiry_date && <p className="mb-0 text-muted">Expires: {format(new Date(doc.expiry_date), 'PPP')}</p>}
        </div>
        {doc.document_file_path && 
            <a href={`http://localhost:5000${doc.document_file_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">View</a>
        }
    </div>
);

const AddDocumentModal = ({ isOpen, onClose, onDocumentAdded }) => {
    const [documentName, setDocumentName] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [documentFile, setDocumentFile] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!documentName || !issueDate) {
            setError('Document Name and Issue Date are required.');
            return;
        }
        setSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append('document_name', documentName);
        formData.append('issue_date', issueDate);
        if (expiryDate) {
            formData.append('expiry_date', expiryDate);
        }
        if (documentFile) {
            formData.append('document_file_path', documentFile);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.success) {
                onDocumentAdded(response.data.document);
                onClose(); // Close modal on success
            }
        } catch (err) {
            console.error('Error submitting document:', err);
            setError(err.response?.data?.message || 'Failed to submit document.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">Add New Document</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="mb-3">
                                <label htmlFor="docName" className="form-label">Document Name</label>
                                <input type="text" className="form-control" id="docName" value={documentName} onChange={(e) => setDocumentName(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="issueDate" className="form-label">Issue Date</label>
                                <input type="date" className="form-control" id="issueDate" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="expiryDate" className="form-label">Expiry Date (Optional)</label>
                                <input type="date" className="form-control" id="expiryDate" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="docFile" className="form-label">Upload File</label>
                                <input type="file" className="form-control" id="docFile" onChange={(e) => setDocumentFile(e.target.files[0])} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Close</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Document'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const DocumentsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [personalDocs, setPersonalDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/my-documents', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setPersonalDocs(response.data.documents);
            }
        } catch (err) {
            console.error('Error fetching documents:', err);
            setError('Failed to fetch documents.');
            if (err.response && err.response.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleDocumentAdded = (newDocument) => {
        setPersonalDocs(prevDocs => [newDocument, ...prevDocs].sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date)));
    };

    return (
        <div className="container-fluid bg-light min-vh-100 p-4 d-flex flex-column">
            <PageHeader title="Documents" onBack={() => navigate('/')} backIcon={<span style={{ color: 'white' }}>← Back</span>}/>

            <div className="d-flex justify-content-center mb-4">
                <TabButton label="Personal" isActive={activeTab === 'personal'} onClick={() => setActiveTab('personal')} />
                <TabButton label="Aircraft" isActive={activeTab === 'aircraft'} onClick={() => setActiveTab('aircraft')} />
            </div>

            <div className="row justify-content-center flex-grow-1">
                <div className="col-lg-8 col-md-10">
                    <div className="bg-white rounded-3 shadow-sm p-4">
                        {loading && <p className="text-center">Loading documents...</p>}
                        {error && <p className="text-center text-danger">{error}</p>}
                        
                        {!loading && !error && activeTab === 'personal' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold mb-0">Personal Documents</h5>
                                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Document</button>
                                </div>
                                <div className="list-group">
                                    {personalDocs.length > 0 ? (
                                        personalDocs.map(doc => <DocumentItem key={doc.document_id} doc={doc} />)
                                    ) : (
                                        <p className="text-center text-muted">No personal documents found.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {!loading && activeTab === 'aircraft' && (
                            <div>
                                <h5 className="fw-bold mb-3">Aircraft Documents</h5>
                                <div className="list-group">
                                    {mockData.aircraftDocs.map(doc => (
                                        <div key={doc.id} className="list-group-item d-flex justify-content-between align-items-center p-3 mb-2 rounded-3 shadow-sm">
                                            <div>
                                                <h6 className="mb-1 fw-bold">{doc.name}</h6>
                                                <p className="mb-1 text-muted">Issued: {doc.issueDate}</p>
                                                {doc.expiryDate && <p className="mb-0 text-muted">Expires: {doc.expiryDate}</p>}
                                            </div>
                                            <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">View</a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddDocumentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onDocumentAdded={handleDocumentAdded} 
            />
        </div>
    );
};

export default DocumentsPage;