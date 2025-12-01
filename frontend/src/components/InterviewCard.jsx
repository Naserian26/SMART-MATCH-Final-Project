// frontend/src/components/InterviewCard.jsx
import React, { useState } from 'react';
import { employersAPI } from '../services/api';
import { toast } from 'react-toastify';

const InterviewCard = ({ interview }) => {
  const [status, setStatus] = useState(interview?.status || 'scheduled');
  
  const handleStatusChange = async (newStatus) => {
    try {
      // In a real app, this would call the API to update the interview status
      setStatus(newStatus);
      toast.success(`Interview ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update interview status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <span className="badge bg-primary">Scheduled</span>;
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'cancelled':
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card interview-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <img 
              src="https://picsum.photos/seed/interviewee/50/50.jpg" 
              alt="Interviewee" 
              className="rounded-circle me-3"
              width="50"
              height="50"
            />
            <div>
              <h5 className="card-title mb-1">Interview with John Doe</h5>
              <p className="text-muted mb-0">Senior Developer Position</p>
            </div>
          </div>
          <div>
            {getStatusBadge(status)}
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-muted mb-1">Date & Time</p>
          <p className="mb-0">{formatDate('2023-12-15T10:00:00')}</p>
        </div>
        
        <div className="mb-3">
          <p className="text-muted mb-1">Location</p>
          <p className="mb-0">Video Call (Zoom)</p>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted">
            Scheduled 3 days ago
          </div>
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              Actions
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li><a className="dropdown-item" href="#">Reschedule</a></li>
              <li><a className="dropdown-item" href="#">Send Reminder</a></li>
              <li><a className="dropdown-item" href="#" onClick={() => handleStatusChange('completed')}>Mark as Completed</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item text-danger" href="#" onClick={() => handleStatusChange('cancelled')}>Cancel Interview</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;