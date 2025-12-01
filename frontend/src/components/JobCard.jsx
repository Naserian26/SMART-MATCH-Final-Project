// frontend/src/components/JobCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI } from '../services/api';
import { toast } from 'react-toastify';

const JobCard = ({ job, showSaveButton = true, compact = false }) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(job.isSaved || false);
  const [saving, setSaving] = useState(false);

  const handleSaveJob = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.info('Please login to save jobs');
      return;
    }

    setSaving(true);
    try {
      if (saved) {
        await jobsAPI.unsaveJob(job._id);
        setSaved(false);
        toast.success('Job removed from saved list');
      } else {
        await jobsAPI.saveJob(job._id);
        setSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getMatchColor = (match) => {
    if (match >= 80) return 'success';
    if (match >= 60) return 'warning';
    return 'secondary';
  };

  return (
    <div className={`card job-card h-100 ${compact ? 'border-0 shadow-sm' : 'shadow-sm'}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <img 
              src={job.companyLogo || `https://picsum.photos/seed/${job._id}/50/50.jpg`} 
              alt={job.company} 
              className="company-logo me-3"
              width="50"
              height="50"
            />
            <div>
              <h5 className={`card-title mb-1 ${compact ? 'h6' : ''}`}>{job.title}</h5>
              <p className="text-muted mb-0">{job.company}</p>
            </div>
          </div>
          {showSaveButton && (
            <button 
              className={`btn btn-sm ${saved ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={handleSaveJob}
              disabled={saving}
            >
              <i className={`bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
            </button>
          )}
        </div>
        
        <div className="d-flex flex-wrap gap-2 mb-3">
          <span className="badge bg-light text-dark">
            <i className="bi bi-geo-alt me-1"></i> {job.location}
          </span>
          <span className="badge bg-light text-dark">
            <i className="bi bi-briefcase me-1"></i> {job.jobType}
          </span>
          <span className="badge bg-light text-dark">
            <i className="bi bi-clock me-1"></i> {formatDate(job.postedDate)}
          </span>
        </div>
        
        {job.matchScore !== undefined && (
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted">Match</span>
              <span className={`badge bg-${getMatchColor(job.matchScore)}`}>{job.matchScore}%</span>
            </div>
            <div className="progress" style={{ height: '5px' }}>
              <div 
                className={`progress-bar bg-${getMatchColor(job.matchScore)}`} 
                role="progressbar" 
                style={{ width: `${job.matchScore}%` }}
                aria-valuenow={job.matchScore} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
            {job.matchReason && (
              <div className="small text-muted mt-1">
                <i className="bi bi-info-circle me-1"></i> {job.matchReason}
              </div>
            )}
          </div>
        )}
        
        {!compact && (
          <p className="card-text text-truncate-2">{job.description}</p>
        )}
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-primary fw-bold">
            {job.salary ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}` : 'Competitive'}
          </div>
          <Link to={`/jobs/${job._id}`} className="btn btn-sm btn-outline-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;