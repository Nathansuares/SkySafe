import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import axios from 'axios';

const IssueReportingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    issueName: '',
    issueSite: '',
    location: '',
    dateTime: new Date(), // Initialize with current date
    timezone: 'UTC+05:30',
    issueDetails: ''
  });

  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [images, setImages] = useState([]);
  const [locationError, setLocationError] = useState('');

  const timezones = [
    'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00',
    'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00',
    'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+04:00', 'UTC+05:00',
    'UTC+05:30', 'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00',
    'UTC+11:00', 'UTC+12:00'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude.toFixed(8),
            lng: position.coords.longitude.toFixed(8)
          });
          setLocationError('');
        },
        (error) => {
          setLocationError('Location access denied or unavailable');
          console.error('Error getting location:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser');
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({ file, url: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newImages].slice(0, 3));
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.issueName || !formData.issueSite || !formData.location || !formData.dateTime || !formData.issueDetails) {
      alert('Please fill in all required fields');
      return;
    }

    const formattedDateTime = format(formData.dateTime, 'yyyy-MM-dd HH:mm:ss');

    const issueData = new FormData();
    issueData.append('user_id', localStorage.getItem('token') ? JSON.parse(atob(localStorage.getItem('token').split('.')[1])).user_id : ''); // Send empty string for null
    issueData.append('issue_name', formData.issueName);
    issueData.append('issue_site', formData.issueSite);
    issueData.append('location', formData.location);
    issueData.append('latitude', coordinates.lat ? parseFloat(coordinates.lat) : '');
    issueData.append('longitude', coordinates.lng ? parseFloat(coordinates.lng) : '');
    issueData.append('date_time', formattedDateTime);
    issueData.append('timezone', formData.timezone);
    issueData.append('issue_details', formData.issueDetails);
    if (images.length > 0) {
      issueData.append('image', images[0].file); // Append the actual file
    }

    try {
      const response = await axios.post('http://localhost:5000/issues', issueData);
      if (response.data.success) {
        alert('Report submitted successfully!');
        console.log('Issue submitted:', response.data);
        navigate('/');
      } else {
        alert('Failed to submit report: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('An error occurred while submitting the report.');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-6 col-md-12 mb-4">
            <div className="bg-white rounded-3 shadow-sm p-4 h-100">
              <h2 className="mb-4 fw-bold">Issue Reporting</h2>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Issue Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control form-control-lg bg-light border-2 border-dark rounded-pill" name="issueName" value={formData.issueName} onChange={handleInputChange} placeholder="Enter issue name" required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Issue Site <span className="text-danger">*</span></label>
                <input type="text" className="form-control form-control-lg bg-light border-2 border-dark rounded-pill" name="issueSite" value={formData.issueSite} onChange={handleInputChange} placeholder="Enter issue site" required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Location <span className="text-danger">*</span></label>
                <input type="text" className="form-control form-control-lg bg-light border-2 border-dark rounded-pill" name="location" value={formData.location} onChange={handleInputChange} placeholder="Enter location" required />
                <div className="d-flex align-items-center mt-2 text-muted">
                  <MapPin size={20} className="me-2" />
                  <div>
                    <div>Lat: {coordinates.lat || 'Getting location...'}</div>
                    <div>Lng: {coordinates.lng || 'Getting location...'}</div>
                  </div>
                </div>
                {locationError && <div className="text-danger small mt-1">{locationError}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Date Time <span className="text-danger">*</span></label>
                <DatePicker
                  selected={formData.dateTime}
                  onChange={(date) => setFormData(prev => ({ ...prev, dateTime: date }))}
                  showTimeSelect
                  dateFormat="Pp"
                  className="form-control form-control-lg bg-light border-2 border-dark rounded-pill"
                  required
                />
                <div className="mt-2">
                  <div className="d-flex align-items-center">
                    <span className="bg-success text-white px-3 py-2 rounded me-2 fw-semibold">UTC <span className="text-warning">*</span></span>
                    <select className="form-select border-2 border-dark" name="timezone" value={formData.timezone} onChange={handleInputChange} style={{maxWidth: '200px'}}>
                      {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 col-md-12">
            <div className="bg-light rounded-3 border-2 border-dark p-4 h-100 d-flex flex-column">
              <div className="mb-4 flex-grow-1 d-flex flex-column">
                <label className="form-label fw-semibold">Issue Details <span className="text-danger">*</span></label>
                <textarea className="form-control bg-white border-2 border-dark rounded-3 flex-grow-1" name="issueDetails" value={formData.issueDetails} onChange={handleInputChange} rows="4" placeholder="Describe the issue in detail..." required></textarea>
              </div>

              <div className="mb-4">
                <h5 className="mb-3 fw-semibold">Add Images</h5>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div>
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="d-none" id="fileUpload" />
                    <label htmlFor="fileUpload" className="btn btn-outline-primary d-flex align-items-center gap-2">Choose Files</label>
                  </div>
                </div>
                {images.length > 0 && (
                  <div className="d-flex gap-2 flex-wrap mb-3">
                    {images.map((image, index) => (
                      <div key={index} className="position-relative">
                        <img src={image.url} alt={`Preview ${index + 1}`} className="rounded border-2 border-warning" style={{width: '120px', height: '90px', objectFit: 'cover'}} />
                        <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle" style={{width: '25px', height: '25px', fontSize: '12px'}} onClick={() => removeImage(index)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="d-flex gap-3 mt-auto">
                <button type="submit" className="btn btn-success btn-lg px-4 py-3 rounded-3 fw-bold flex-fill">Send Report</button>
                <button type="button" className="btn btn-secondary btn-lg px-4 py-3 rounded-3 fw-bold flex-fill" onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default IssueReportingPage;