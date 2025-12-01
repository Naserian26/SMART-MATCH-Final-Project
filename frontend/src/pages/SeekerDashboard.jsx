// frontend/src/pages/SeekerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI, usersAPI } from '../services/api';
import JobCard from '../components/JobCard';
import ApplicationCard from '../components/ApplicationCard';
import SkillGapAnalysis from '../components/SkillGapAnalysis';
import LoadingSpinner from '../components/LoadingSpinner';

const SeekerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be separate API calls
        // For now, we'll use mock data
        const mockDashboardData = {
          profileCompletion: 85,
          applicationsCount: 12,
          interviewsCount: 3,
          savedJobsCount: 8,
          viewsCount: 24,
          applicationStatus: {
            pending: 5,
            viewed: 4,
            shortlisted: 2,
            rejected: 1
          }
        };
        
        setDashboardData(mockDashboardData);
        
        // Fetch recommended jobs
        const recommendedResponse = await jobsAPI.getRecommendedJobs();
        setRecommendedJobs(recommendedResponse.data.jobs);
        
        // Fetch saved jobs
        const savedResponse = await jobsAPI.getSavedJobs();
        setSavedJobs(savedResponse.data.jobs);
        
        // Fetch applications
        const applicationsResponse = await usersAPI.getApplications();
        setApplications(applicationsResponse.data.applications);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3 mb-4">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className="bi bi-speedometer2 me-2"></i> Overview
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'recommended' ? 'active' : ''}`}
                  onClick={() => setActiveTab('recommended')}
                >
                  <i className="bi bi-star me-2"></i> Recommended Jobs
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setActiveTab('saved')}
                >
                  <i className="bi bi-bookmark me-2"></i> Saved Jobs
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'applications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('applications')}
                >
                  <i className="bi bi-file-text me-2"></i> Applications
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'skill-gap' ? 'active' : ''}`}
                  onClick={() => setActiveTab('skill-gap')}
                >
                  <i className="bi bi-graph-up me-2"></i> Skill Gap Analysis
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person me-2"></i> Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-9">
          {activeTab === 'overview' && (
            <div>
              <h2 className="mb-4">Dashboard Overview</h2>
              
              <div className="row mb-4">
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Profile Completion</h5>
                      <h2 className="mb-0">{dashboardData.profileCompletion}%</h2>
                      <div className="progress mt-2" style={{ height: '5px' }}>
                        <div 
                          className="progress-bar bg-white" 
                          role="progressbar" 
                          style={{ width: `${dashboardData.profileCompletion}%` }}
                          aria-valuenow={dashboardData.profileCompletion} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h5 className="card-title">Applications</h5>
                      <h2 className="mb-0">{dashboardData.applicationsCount}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h5 className="card-title">Interviews</h5>
                      <h2 className="mb-0">{dashboardData.interviewsCount}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body">
                      <h5 className="card-title">Profile Views</h5>
                      <h2 className="mb-0">{dashboardData.viewsCount}</h2>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Application Status</h5>
                      <div className="mb-2 d-flex justify-content-between">
                        <span>Pending</span>
                        <span className="badge bg-warning">{dashboardData.applicationStatus.pending}</span>
                      </div>
                      <div className="mb-2 d-flex justify-content-between">
                        <span>Viewed</span>
                        <span className="badge bg-info">{dashboardData.applicationStatus.viewed}</span>
                      </div>
                      <div className="mb-2 d-flex justify-content-between">
                        <span>Shortlisted</span>
                        <span className="badge bg-success">{dashboardData.applicationStatus.shortlisted}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Rejected</span>
                        <span className="badge bg-danger">{dashboardData.applicationStatus.rejected}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Recent Activity</h5>
                      <div className="activity-item mb-3">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-file-text"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">Applied to Senior Developer</h6>
                            <p className="text-muted mb-0">2 days ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="activity-item mb-3">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <div className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-calendar-check"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">Interview scheduled with TechCorp</h6>
                            <p className="text-muted mb-0">5 days ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <div className="bg-info rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-eye"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">Profile viewed by 3 employers</h6>
                            <p className="text-muted mb-0">1 week ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Recommended Jobs</h5>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setActiveTab('recommended')}
                    >
                      View All
                    </button>
                  </div>
                  <div className="row">
                    {recommendedJobs.slice(0, 3).map(job => (
                      <div key={job._id} className="col-md-6 col-lg-4 mb-3">
                        <JobCard job={job} compact={true} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'recommended' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Recommended Jobs</h2>
              </div>
              
              {recommendedJobs.length > 0 ? (
                <div className="row g-4">
                  {recommendedJobs.map(job => (
                    <div key={job._id} className="col-md-6">
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-star fs-1 text-muted"></i>
                  <h3 className="mt-3">No recommended jobs yet</h3>
                  <p className="text-muted">Complete your profile to get personalized job recommendations</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('profile')}
                  >
                    Complete Profile
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'saved' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Saved Jobs</h2>
              </div>
              
              {savedJobs.length > 0 ? (
                <div className="row g-4">
                  {savedJobs.map(job => (
                    <div key={job._id} className="col-md-6">
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-bookmark fs-1 text-muted"></i>
                  <h3 className="mt-3">No saved jobs</h3>
                  <p className="text-muted">Save jobs you're interested in to apply later</p>
                  <Link to="/jobs" className="btn btn-primary">
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'applications' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Applications</h2>
              </div>
              
              {applications.length > 0 ? (
                <div className="row g-4">
                  {applications.map(application => (
                    <div key={application._id} className="col-12">
                      <ApplicationCard application={application} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-file-text fs-1 text-muted"></i>
                  <h3 className="mt-3">No applications yet</h3>
                  <p className="text-muted">Start applying to jobs to track your applications here</p>
                  <Link to="/jobs" className="btn btn-primary">
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'skill-gap' && (
            <div>
              <h2 className="mb-4">Skill Gap Analysis</h2>
              <SkillGapAnalysis />
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div>
              <h2 className="mb-4">My Profile</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title mb-0">Profile Information</h5>
                    <Link to="/profile" className="btn btn-primary">
                      Edit Profile
                    </Link>
                  </div>
                  <div className="row">
                    <div className="col-md-4 text-center mb-4">
                      <img 
                        src={user?.avatar || `https://picsum.photos/seed/${user?._id}/150/150.jpg`} 
                        alt={user?.name} 
                        className="rounded-circle mb-3"
                        width="150"
                        height="150"
                      />
                      <h4>{user?.name}</h4>
                      <p className="text-muted">{user?.email}</p>
                    </div>
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h6 className="text-muted">Headline</h6>
                        <p>{user?.headline || 'No headline added'}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">About</h6>
                        <p>{user?.about || 'No information added'}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Location</h6>
                        <p>{user?.location || 'No location added'}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Skills</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {user?.skills?.length > 0 ? (
                            user.skills.map((skill, index) => (
                              <span key={index} className="badge bg-primary">{skill}</span>
                            ))
                          ) : (
                            <p>No skills added</p>
                          )}
                        </div>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Experience</h6>
                        <p>{user?.experience || 'No experience added'}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Education</h6>
                        <p>{user?.education || 'No education added'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;