// frontend/src/components/JobTable.jsx
import React from 'react';

const JobTable = ({ jobs }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success">Active</span>;
      case 'expired':
        return <span className="badge bg-secondary">Expired</span>;
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Job</th>
                <th>Company</th>
                <th>Location</th>
                <th>Posted</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job._id}>
                  <td>
                    <div>
                      <div>{job.title}</div>
                      <div className="text-muted small">{job.jobType}</div>
                    </div>
                  </td>
                  <td>{job.company}</td>
                  <td>{job.location}</td>
                  <td>{new Date(job.postedDate).toLocaleDateString()}</td>
                  <td>{job.applicationsCount || 0}</td>
                  <td>{getStatusBadge(job.status)}</td>
                  <td>
                    <div className="dropdown">
                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="bi bi-three-dots"></i>
                      </button>
                      <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <li><a className="dropdown-item" href="#">View Job</a></li>
                        <li><a className="dropdown-item" href="#">View Applications</a></li>
                        <li><a className="dropdown-item" href="#">Edit Job</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item text-danger" href="#">Delete Job</a></li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobTable;