// frontend/src/components/CandidateCard.jsx
import React, { useState } from 'react';
import { employersAPI } from '../services/api';
import { toast } from 'react-toastify';

const CandidateCard = () => {
  const [candidateStatus, setCandidateStatus] = useState('applied');
  
  const handleStatusChange = async (newStatus) => {
    try {
      // In a real app, this would call the API to update the candidate status
      setCandidateStatus(newStatus);
      toast.success(`Candidate ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update candidate status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return <span className="badge bg-warning">Applied</span>;
      case 'viewed':
        return <span className="badge bg-info">Viewed</span>;
      case 'shortlisted':
        return <span className="badge bg-primary">Shortlisted</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  return (
    <div className="card candidate-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <img 
              src="https://picsum.photos/seed/candidate/60/60.jpg" 
              alt="Candidate" 
              className="rounded-circle me-3"
              width="60"
              height="60"
            />
            <div>
              <h5 className="card-title mb-1">John Doe</h5>
              <p className="text-muted mb-0">Senior Software Engineer</p>
              <div className="d-flex flex-wrap gap-1 mt-1">
                <span className="badge bg-light text-dark">React</span>
                <span className="badge bg-light text-dark">Node.js</span>
                <span className="badge bg-light text-dark">MongoDB</span>
              </div>
            </div>
          </div>
          <div>
            {getStatusBadge(candidateStatus)}
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-muted mb-1">Match Score</p>
          <div className="d-flex align-items-center">
            <div className="progress flex-grow-1 me-2" style={{ height: '10px' }}>
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{ width: '85%' }}
                aria-valuenow="85" 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
            <span className="badge bg-success">85%</span>
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted">
            Applied 2 days ago
          </div>
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              Update Status
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li><a className="dropdown-item" href="#" onClick={() => handleStatusChange('viewed')}>Mark as Viewed</a></li>
              <li><a className="dropdown-item" href="#" onClick={() => handleStatusChange('shortlisted')}>Shortlist</a></li>
              <li><a className="dropdown-item" href="#" onClick={() => handleStatusChange('rejected')}>Reject</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;