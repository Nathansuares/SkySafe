import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import TabButton from '../components/TabButton';
import InfoCard from '../components/InfoCard';
import { mockData } from '../data/mockData';

const CircularsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('regulatory');

    return (
        <div className="container-fluid bg-light min-vh-100 p-4 d-flex flex-column">
            <PageHeader title="Circulars" onBack={() => navigate('/')} />
            
            <div className="d-flex justify-content-center mb-4">
                <TabButton label="Regulatory" isActive={activeTab === 'regulatory'} onClick={() => setActiveTab('regulatory')} />
                <TabButton label="Internal" isActive={activeTab === 'internal'} onClick={() => setActiveTab('internal')} />
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                    <div className="bg-white rounded-3 shadow-sm p-4">
                        {activeTab === 'regulatory' && (
                            <div>
                                <h5 className="fw-bold mb-3">Regulatory Circulars</h5>
                                {mockData.regulatoryCirculars.length > 0 ? (
                                    <div className="list-group">
                                        {mockData.regulatoryCirculars.map(circ => (
                                            <a key={circ.id} href="#" className="list-group-item list-group-item-action">
                                                <h6 className="mb-1">{circ.name}</h6>
                                                <small className="text-muted">Issue: {circ.issuedOn} | Expiry: {circ.expiry}</small>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted">No regulatory circulars found.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'internal' && (
                            <div>
                                <h5 className="fw-bold mb-3">Internal Circulars</h5>
                                {mockData.internalCirculars.length > 0 ? (
                                    <div className="list-group">
                                        {mockData.internalCirculars.map(circ => (
                                            <a key={circ.id} href="#" className="list-group-item list-group-item-action">
                                                <h6 className="mb-1">{circ.name}</h6>
                                                <small className="text-muted">{circ.details}</small>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted">No internal circulars found.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CircularsPage;