// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import UserTable from '../components/UserTable';
import JobTable from '../components/JobTable';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be separate API calls
        // For now, we'll use mock data
        const mockDashboardData = {
          totalUsers: 1250,
          totalJobs: 340,
          totalApplications: 5420,
          totalEmployers: 180,
          pendingJobs: 12,
          pendingEmployers: 8,
          monthlySignups: 85,
          monthlyJobs: 24
        };
        
        setDashboardData(mockDashboardData);
        
        // Fetch users
        const usersResponse = await adminAPI.getUsers();
        setUsers(usersResponse.data.users);
        
        // Fetch jobs
        const jobsResponse = await adminAPI.getJobs();
        setJobs(jobsResponse.data.jobs);
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
                  className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <i className="bi bi-people me-2"></i> Users
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'jobs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('jobs')}
                >
                  <i className="bi bi-briefcase me-2"></i> Jobs
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'employers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('employers')}
                >
                  <i className="bi bi-building me-2"></i> Employers
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  <i className="bi bi-graph-up me-2"></i> Analytics
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <i className="bi bi-gear me-2"></i> Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-9">
          {activeTab === 'overview' && (
            <div>
              <h2 className="mb-4">Admin Dashboard</h2>
              
              <div className="row mb-4">
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Users</h5>
                      <h2 className="mb-0">{dashboardData.totalUsers}</h2>
                      <div className="mt-2">
                        <small>
                          <i className="bi bi-arrow-up"></i> {dashboardData.monthlySignups} this month
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Jobs</h5>
                      <h2 className="mb-0">{dashboardData.totalJobs}</h2>
                      <div className="mt-2">
                        <small>
                          <i className="bi bi-arrow-up"></i> {dashboardData.monthlyJobs} this month
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Applications</h5>
                      <h2 className="mb-0">{dashboardData.totalApplications}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Employers</h5>
                      <h2 className="mb-0">{dashboardData.totalEmployers}</h2>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Pending Approvals</h5>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Pending Jobs</span>
                        <span className="badge bg-warning">{dashboardData.pendingJobs}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Pending Employers</span>
                        <span className="badge bg-warning">{dashboardData.pendingEmployers}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Recent Activity</h5>
                      <div className="activity-item mb-2">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '30px', height: '30px' }}>
                              <i className="bi bi-person-plus"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-2">
                            <h6 className="mb-0">New user registered</h6>
                            <p className="text-muted mb-0">2 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="activity-item mb-2">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <div className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '30px', height: '30px' }}>
                              <i className="bi bi-briefcase"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-2">
                            <h6 className="mb-0">New job posted</h6>
                            <p className="text-muted mb-0">5 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <div className="bg-info rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '30px', height: '30px' }}>
                              <i className="bi bi-file-text"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-2">
                            <h6 className="mb-0">New application submitted</h6>
                            <p className="text-muted mb-0">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Platform Statistics</h5>
                  <canvas id="platformStatsChart" height="100"></canvas>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div>
              <h2 className="mb-4">Users Management</h2>
              <UserTable users={users} />
            </div>
          )}
          
          {activeTab === 'jobs' && (
            <div>
              <h2 className="mb-4">Jobs Management</h2>
              <JobTable jobs={jobs} />
            </div>
          )}
          
          {activeTab === 'employers' && (
            <div>
              <h2 className="mb-4">Employers Management</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Contact Person</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Jobs Posted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>TechCorp</td>
                          <td>John Smith</td>
                          <td>john@techcorp.com</td>
                          <td><span className="badge bg-success">Verified</span></td>
                          <td>5</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1">View</button>
                            <button className="btn btn-sm btn-outline-secondary">Suspend</button>
                          </td>
                        </tr>
                        <tr>
                          <td>Innovate Solutions</td>
                          <td>Jane Doe</td>
                          <td>jane@innovatesolutions.com</td>
                          <td><span className="badge bg-warning">Pending</span></td>
                          <td>2</td>
                          <td>
                            <button className="btn btn-sm btn-outline-success me-1">Verify</button>
                            <button className="btn btn-sm btn-outline-secondary">Reject</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div>
              <h2 className="mb-4">Analytics</h2>
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">User Growth</h5>
                      <canvas id="userGrowthChart" height="200"></canvas>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Job Categories</h5>
                      <canvas id="jobCategoriesChart" height="200"></canvas>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Platform Usage</h5>
                  <canvas id="platformUsageChart" height="100"></canvas>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              <h2 className="mb-4">Admin Settings</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Platform Settings</h5>
                  <form>
                    <div className="mb-3">
                      <label htmlFor="siteName" className="form-label">Site Name</label>
                      <input type="text" className="form-control" id="siteName" defaultValue="SmartMatch" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="siteEmail" className="form-label">Site Email</label>
                      <input type="email" className="form-control" id="siteEmail" defaultValue="admin@smartmatch.com" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="maintenanceMode" className="form-label">Maintenance Mode</label>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="maintenanceMode" />
                        <label className="form-check-label" htmlFor="maintenanceMode">
                          Enable maintenance mode
                        </label>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="registrationEnabled" className="form-label">User Registration</label>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="registrationEnabled" defaultChecked />
                        <label className="form-check-label" htmlFor="registrationEnabled">
                          Enable new user registration
                        </label>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Save Settings</button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;