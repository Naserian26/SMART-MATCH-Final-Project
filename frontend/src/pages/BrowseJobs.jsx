// frontend/src/pages/BrowseJobs.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';

const BrowseJobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    jobType: searchParams.get('jobType') || '',
    salaryMin: searchParams.get('salaryMin') || '',
    salaryMax: searchParams.get('salaryMax') || '',
    experience: searchParams.get('experience') || '',
    remote: searchParams.get('remote') === 'true',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Sales', 'Customer Service', 'HR', 'Design', 'Engineering'
  ];

  const jobTypes = [
    'Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Freelance'
  ];

  const experienceLevels = [
    'Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = { ...filters };
        
        // Remove empty values
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });
        
        const response = await jobsAPI.getJobs(params);
        setJobs(response.data.jobs);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalJobs: response.data.totalJobs
        });
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      page: 1 // Reset to first page when changing filters
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined && key !== 'page') {
        params.set(key, filters[key]);
      }
    });
    
    params.set('page', filters.page);
    setSearchParams(params);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      location: '',
      category: '',
      jobType: '',
      salaryMin: '',
      salaryMax: '',
      experience: '',
      remote: false,
      page: 1,
      limit: 10
    });
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    applyFilters();
  }, [filters.page]);

  return (
    <div className="container py-4">
      <div className="row">
        {/* Filters Sidebar */}
        <div className={`col-lg-3 mb-4 ${showFilters ? 'd-block' : 'd-none d-lg-block'}`}>
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Filters</h5>
              <button 
                className="btn btn-sm btn-outline-secondary d-lg-none"
                onClick={() => setShowFilters(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="search" className="form-label">Keywords</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="search" 
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Job title, skills..."
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="location" className="form-label">Location</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="location" 
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="City, state..."
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="category" className="form-label">Category</label>
                <select 
                  className="form-select" 
                  id="category" 
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="jobType" className="form-label">Job Type</label>
                <select 
                  className="form-select" 
                  id="jobType" 
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="experience" className="form-label">Experience Level</label>
                <select 
                  className="form-select" 
                  id="experience" 
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                >
                  <option value="">All Levels</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Salary Range</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input 
                      type="number" 
                      className="form-control" 
                      name="salaryMin"
                      value={filters.salaryMin}
                      onChange={handleFilterChange}
                      placeholder="Min"
                    />
                  </div>
                  <div className="col-6">
                    <input 
                      type="number" 
                      className="form-control" 
                      name="salaryMax"
                      value={filters.salaryMax}
                      onChange={handleFilterChange}
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="remote"
                    name="remote"
                    checked={filters.remote}
                    onChange={handleFilterChange}
                  />
                  <label className="form-check-label" htmlFor="remote">
                    Remote Only
                  </label>
                </div>
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={applyFilters}
                >
                  Apply Filters
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Jobs List */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              {filters.search || filters.location || filters.category || filters.jobType || filters.experience || filters.remote
                ? 'Search Results'
                : 'All Jobs'
              }
            </h2>
            <div className="d-flex align-items-center">
              <span className="me-3 text-muted">{pagination.totalJobs} jobs found</span>
              <button 
                className="btn btn-outline-secondary d-lg-none"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="bi bi-funnel me-1"></i> Filters
              </button>
            </div>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : jobs.length > 0 ? (
            <>
              <div className="row g-4 mb-4">
                {jobs.map(job => (
                  <div key={job._id} className="col-md-6">
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
              
              <Pagination 
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-search fs-1 text-muted"></i>
              <h3 className="mt-3">No jobs found</h3>
              <p className="text-muted">Try adjusting your filters or search terms</p>
              <button 
                className="btn btn-primary"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseJobs;