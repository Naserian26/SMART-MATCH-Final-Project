// frontend/src/components/ApplicationCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ApplicationCard = ({ application }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'viewed':
        return <span className="badge bg-info">Viewed</span>;
      case 'shortlisted':
        return <span className="badge bg-primary">Shortlisted</span>;
      case 'interview':
        return <span className="badge bg-success">Interview</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'hired':
        return <span className="badge bg-success">Hired</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="card job-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <img 
              src={application.companyLogo || `https://picsum.photos/seed/${application._id}/50/50.jpg`} 
              alt={application.company} 
              className="company-logo me-3"
              width="50"
              height="50"
            />
            <div>
              <h5 className="card-title mb-1">{application.jobTitle}</h5>
              <p className="text-muted mb-0">{application.company}</p>
            </div>
          </div>
          <div>
            {getStatusBadge(application.status)}
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted">
            Applied on {formatDate(application.appliedDate)}
          </div>
          <Link to={`/jobs/${application.jobId}`} className="btn btn-sm btn-outline-primary">
            View Job
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;