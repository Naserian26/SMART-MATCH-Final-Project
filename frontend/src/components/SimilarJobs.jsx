// frontend/src/components/SimilarJobs.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import JobCard from './JobCard';
import LoadingSpinner from './LoadingSpinner';

const SimilarJobs = ({ currentJobId, category }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      try {
        const response = await jobsAPI.getJobs({ category, limit: 3 });
        // Filter out the current job
        const filteredJobs = response.data.jobs.filter(job => job._id !== currentJobId);
        setJobs(filteredJobs);
      } catch (error) {
        console.error('Error fetching similar jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarJobs();
  }, [currentJobId, category]);

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-4">Similar Jobs</h5>
        
        {loading ? (
          <LoadingSpinner message="Loading similar jobs..." />
        ) : jobs.length > 0 ? (
          <div className="row g-4">
            {jobs.map(job => (
              <div key={job._id} className="col-md-6 col-lg-4">
                <JobCard job={job} compact={true} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No similar jobs found</p>
        )}
        
        <div className="text-center mt-4">
          <Link to="/jobs" className="btn btn-outline-primary">
            View All Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SimilarJobs;