// frontend/src/pages/EmployerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { employersAPI, jobsAPI } from '../services/api';
import JobCard from '../components/JobCard';
import CandidateCard from '../components/CandidateCard';
import InterviewCard from '../components/InterviewCard';
import LoadingSpinner from '../components/LoadingSpinner';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be separate API calls
        // For now, we'll use mock data
        const mockDashboardData = {
          activeJobs: 5,
          totalApplications: 42,
          totalViews: 256,
          interviewScheduled: 8,
          hired: 3,
          profileCompletion: 90
        };
        
        setDashboardData(mockDashboardData);
        
        // Fetch posted jobs
        const jobsResponse = await employersAPI.getPostedJobs();
        setPostedJobs(jobsResponse.data.jobs);
        
        // Fetch interviews
        const interviewsResponse = await employersAPI.getInterviews();
        setInterviews(interviewsResponse.data.interviews);
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
                  className={`list-group-item list-group-item-action ${activeTab === 'jobs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('jobs')}
                >
                  <i className="bi bi-briefcase me-2"></i> Posted Jobs
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'candidates' ? 'active' : ''}`}
                  onClick={() => setActiveTab('candidates')}
                >
                  <i className="bi bi-people me-2"></i> Candidates
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'interviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('interviews')}
                >
                  <i className="bi bi-calendar-check me-2"></i> Interviews
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  <i className="bi bi-graph-up me-2"></i> Analytics
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-building me-2"></i> Company Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-9">
          {activeTab === 'overview' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Dashboard Overview</h2>
                <Link to="/employer/post-job" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-1"></i> Post a Job
                </Link>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Active Jobs</h5>
                      <h2 className="mb-0">{dashboardData.activeJobs}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Applications</h5>
                      <h2 className="mb-0">{dashboardData.totalApplications}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Views</h5>
                      <h2 className="mb-0">{dashboardData.totalViews}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body">
                      <h5 className="card-title">Hired</h5>
                      <h2 className="mb-0">{dashboardData.hired}</h2>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Recent Applications</h5>
                      <div className="application-item mb-3">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <img 
                              src="https://picsum.photos/seed/user1/40/40.jpg" 
                              alt="User" 
                              className="rounded-circle"
                              width="40"
                              height="40"
                            />
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">John Doe applied for Senior Developer</h6>
                            <p className="text-muted mb-0">2 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="application-item mb-3">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <img 
                              src="https://picsum.photos/seed/user2/40/40.jpg" 
                              alt="User" 
                              className="rounded-circle"
                              width="40"
                              height="40"
                            />
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">Jane Smith applied for UX Designer</h6>
                            <p className="text-muted mb-0">5 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="application-item">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <img 
                              src="https://picsum.photos/seed/user3/40/40.jpg" 
                              alt="User" 
                              className="rounded-circle"
                              width="40"
                              height="40"
                            />
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">Mike Johnson applied for Product Manager</h6>
                            <p className="text-muted mb-0">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Upcoming Interviews</h5>
                      <div className="interview-item mb-3">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-calendar-check"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">Interview with John Doe</h6>
                            <p className="text-muted mb-0">Tomorrow, 10:00 AM</p>
                          </div>
                        </div>
                      </div>
                      <div className="interview-item mb-3">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-calendar-check"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">Interview with Jane Smith</h6>
                            <p className="text-muted mb-0">Dec 15, 2:00 PM</p>
                          </div>
                        </div>
                      </div>
                      <div className="interview-item">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-calendar-check"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">Interview with Mike Johnson</h6>
                            <p className="text-muted mb-0">Dec 17, 11:00 AM</p>
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
                    <h5 className="card-title mb-0">Posted Jobs</h5>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setActiveTab('jobs')}
                    >
                      View All
                    </button>
                  </div>
                  <div className="row">
                    {postedJobs.slice(0, 3).map(job => (
                      <div key={job._id} className="col-md-6 col-lg-4 mb-3">
                        <JobCard job={job} compact={true} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'jobs' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Posted Jobs</h2>
                <Link to="/employer/post-job" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-1"></i> Post a Job
                </Link>
              </div>
              
              {postedJobs.length > 0 ? (
                <div className="row g-4">
                  {postedJobs.map(job => (
                    <div key={job._id} className="col-md-6">
                      <div className="card job-card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h5 className="card-title">{job.title}</h5>
                              <p className="text-muted mb-0">{job.company}</p>
                            </div>
                            <div className="dropdown">
                              <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="bi bi-three-dots"></i>
                              </button>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                <li><Link className="dropdown-item" to={`/employer/edit-job/${job._id}`}>Edit</Link></li>
                                <li><a className="dropdown-item" href="#">View Applications</a></li>
                                <li><a className="dropdown-item" href="#">Analytics</a></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><a className="dropdown-item text-danger" href="#">Delete</a></li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <span className="badge bg-light text-dark">
                              <i className="bi bi-geo-alt me-1"></i> {job.location}
                            </span>
                            <span className="badge bg-light text-dark">
                              <i className="bi bi-briefcase me-1"></i> {job.jobType}
                            </span>
                            <span className={`badge ${job.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {job.status}
                            </span>
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="text-primary fw-bold">
                              {job.salary ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}` : 'Competitive'}
                            </div>
                            <div className="text-muted">
                              <i className="bi bi-people me-1"></i> {job.applicationsCount || 0} Applications
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-briefcase fs-1 text-muted"></i>
                  <h3 className="mt-3">No jobs posted yet</h3>
                  <p className="text-muted">Post your first job to start finding candidates</p>
                  <Link to="/employer/post-job" className="btn btn-primary">
                    Post a Job
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'candidates' && (
            <div>
              <h2 className="mb-4">Candidates</h2>
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <select className="form-select">
                        <option value="">All Jobs</option>
                        <option value="1">Senior Developer</option>
                        <option value="2">UX Designer</option>
                        <option value="3">Product Manager</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <select className="form-select">
                        <option value="">All Status</option>
                        <option value="applied">Applied</option>
                        <option value="viewed">Viewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <input type="text" className="form-control" placeholder="Search candidates..." />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row g-4">
                <div className="col-12">
                  <CandidateCard />
                </div>
                <div className="col-12">
                  <CandidateCard />
                </div>
                <div className="col-12">
                  <CandidateCard />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'interviews' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Interviews</h2>
                <button className="btn btn-primary">
                  <i className="bi bi-plus-circle me-1"></i> Schedule Interview
                </button>
              </div>
              
              {interviews.length > 0 ? (
                <div className="row g-4">
                  {interviews.map(interview => (
                    <div key={interview._id} className="col-12">
                      <InterviewCard interview={interview} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-check fs-1 text-muted"></i>
                  <h3 className="mt-3">No interviews scheduled</h3>
                  <p className="text-muted">Schedule interviews with shortlisted candidates</p>
                  <button className="btn btn-primary">
                    Schedule Interview
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div>
              <h2 className="mb-4">Analytics</h2>
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Job Performance</h5>
                      <canvas id="jobPerformanceChart" height="200"></canvas>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Application Funnel</h5>
                      <canvas id="applicationFunnelChart" height="200"></canvas>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Job Statistics</h5>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Posted Date</th>
                          <th>Views</th>
                          <th>Applications</th>
                          <th>Interviews</th>
                          <th>Hires</th>
                          <th>Conversion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Senior Developer</td>
                          <td>Nov 15, 2023</td>
                          <td>125</td>
                          <td>32</td>
                          <td>8</td>
                          <td>2</td>
                          <td>6.25%</td>
                        </tr>
                        <tr>
                          <td>UX Designer</td>
                          <td>Nov 10, 2023</td>
                          <td>98</td>
                          <td>24</td>
                          <td>5</td>
                          <td>1</td>
                          <td>4.17%</td>
                        </tr>
                        <tr>
                          <td>Product Manager</td>
                          <td>Nov 5, 2023</td>
                          <td>87</td>
                          <td>18</td>
                          <td>4</td>
                          <td>0</td>
                          <td>0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div>
              <h2 className="mb-4">Company Profile</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title mb-0">Company Information</h5>
                    <button className="btn btn-primary">
                      Edit Profile
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-4 text-center mb-4">
                      <img 
                        src="https://picsum.photos/seed/company/150/150.jpg" 
                        alt="Company Logo" 
                        className="mb-3"
                        width="150"
                        height="150"
                      />
                      <h4>TechCorp</h4>
                      <p className="text-muted">Technology Company</p>
                    </div>
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h6 className="text-muted">About</h6>
                        <p>TechCorp is a leading technology company specializing in innovative software solutions for businesses worldwide.</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Location</h6>
                        <p>San Francisco, CA</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Website</h6>
                        <p>www.techcorp.com</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Company Size</h6>
                        <p>201-500 employees</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-muted">Industry</h6>
                        <p>Information Technology</p>
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

export default EmployerDashboard;