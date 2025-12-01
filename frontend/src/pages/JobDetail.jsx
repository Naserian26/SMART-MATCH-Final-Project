// frontend/src/pages/JobDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import SimilarJobs from '../components/SimilarJobs';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await jobsAPI.getJob(id);
        setJob(response.data);
        setSaved(response.data.isSaved || false);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      toast.info('Please login to apply for this job');
      return;
    }

    if (user.role !== 'jobseeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    setShowApplicationForm(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setApplying(true);

    try {
      const formData = new FormData();
      formData.append('coverLetter', applicationData.coverLetter);
      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }

      await jobsAPI.applyToJob(id, formData);
      toast.success('Application submitted successfully!');
      setShowApplicationForm(false);
      setApplicationData({ coverLetter: '', resume: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      toast.info('Please login to save jobs');
      return;
    }

    try {
      if (saved) {
        await jobsAPI.unsaveJob(id);
        setSaved(false);
        toast.success('Job removed from saved list');
      } else {
        await jobsAPI.saveJob(id);
        setSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!job) {
    return (
      <div className="container py-5 text-center">
        <h2>Job Not Found</h2>
        <p className="text-muted">The job you're looking for doesn't exist or has been removed.</p>
        <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="d-flex align-items-center">
                  <img 
                    src={job.companyLogo || `https://picsum.photos/seed/${job._id}/80/80.jpg`} 
                    alt={job.company} 
                    className="me-3"
                    width="80"
                    height="80"
                  />
                  <div>
                    <h1 className="h2 mb-1">{job.title}</h1>
                    <h4 className="text-muted mb-2">{job.company}</h4>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge bg-light text-dark">
                        <i className="bi bi-geo-alt me-1"></i> {job.location}
                      </span>
                      <span className="badge bg-light text-dark">
                        <i className="bi bi-briefcase me-1"></i> {job.jobType}
                      </span>
                      <span className="badge bg-light text-dark">
                        <i className="bi bi-clock me-1"></i> Posted {formatDate(job.postedDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    className={`btn ${saved ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={handleSaveJob}
                  >
                    <i className={`bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="h5 mb-2">Salary</h3>
                <p className="fs-5 text-primary fw-bold">
                  {job.salary ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}` : 'Competitive'}
                </p>
              </div>
              
              {job.matchScore !== undefined && (
                <div className="mb-4 p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Match Score</h5>
                    <span className="badge bg-success fs-6">{job.matchScore}%</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: `${job.matchScore}%` }}
                      aria-valuenow={job.matchScore} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
                  {job.matchReason && (
                    <p className="mb-0 text-muted">
                      <i className="bi bi-info-circle me-1"></i> {job.matchReason}
                    </p>
                  )}
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="h5 mb-3">Job Description</h3>
                <div dangerouslySetInnerHTML={{ __html: job.description }} />
              </div>
              
              <div className="mb-4">
                <h3 className="h5 mb-3">Requirements</h3>
                <ul>
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <h3 className="h5 mb-3">Benefits</h3>
                <ul>
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <h3 className="h5 mb-3">Skills Required</h3>
                <div className="d-flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="badge bg-primary">{skill}</span>
                  ))}
                </div>
              </div>
              
              <div className="d-flex gap-3">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Applying...
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </button>
                <button 
                  className="btn btn-outline-secondary btn-lg"
                  onClick={handleSaveJob}
                >
                  {saved ? 'Saved' : 'Save Job'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Similar Jobs */}
          <SimilarJobs currentJobId={job._id} category={job.category} />
        </div>
        
        <div className="col-lg-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Company Information</h5>
              <div className="d-flex align-items-center mb-3">
                <img 
                  src={job.companyLogo || `https://picsum.photos/seed/${job._id}/60/60.jpg`} 
                  alt={job.company} 
                  className="me-3"
                  width="60"
                  height="60"
                />
                <div>
                  <h6 className="mb-0">{job.company}</h6>
                  <p className="text-muted mb-0">{job.industry}</p>
                </div>
              </div>
              <p className="mb-3">{job.companyDescription}</p>
              <div className="d-grid">
                <Link to={`/companies/${job.companyId}`} className="btn btn-outline-primary">
                  View Company Profile
                </Link>
              </div>
            </div>
          </div>
          
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Job Details</h5>
              <div className="mb-3">
                <h6 className="text-muted">Location</h6>
                <p>{job.location}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted">Job Type</h6>
                <p>{job.jobType}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted">Experience Level</h6>
                <p>{job.experienceLevel}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted">Posted Date</h6>
                <p>{formatDate(job.postedDate)}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted">Application Deadline</h6>
                <p>{formatDate(job.applicationDeadline)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Apply for {job.title}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowApplicationForm(false)}
                ></button>
              </div>
              <form onSubmit={submitApplication}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="coverLetter" className="form-label">Cover Letter</label>
                    <textarea 
                      className="form-control" 
                      id="coverLetter" 
                      rows="5"
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="resume" className="form-label">Resume (Optional)</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      id="resume"
                      onChange={(e) => setApplicationData({...applicationData, resume: e.target.files[0]})}
                      accept=".pdf,.doc,.docx"
                    />
                    <div className="form-text">Upload your resume (PDF, DOC, DOCX)</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowApplicationForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={applying}
                  >
                    {applying ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;