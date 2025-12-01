// frontend/src/components/UserTable.jsx
import React from 'react';

const UserTable = ({ users }) => {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge bg-danger">Admin</span>;
      case 'employer':
        return <span className="badge bg-primary">Employer</span>;
      case 'jobseeker':
        return <span className="badge bg-success">Job Seeker</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success">Active</span>;
      case 'suspended':
        return <span className="badge bg-warning">Suspended</span>;
      case 'pending':
        return <span className="badge bg-info">Pending</span>;
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
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <img 
                        src={user.avatar || `https://picsum.photos/seed/${user._id}/40/40.jpg`} 
                        alt={user.name} 
                        className="rounded-circle me-2"
                        width="40"
                        height="40"
                      />
                      <div>
                        <div>{user.name}</div>
                        <div className="text-muted small">{user.headline}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="dropdown">
                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="bi bi-three-dots"></i>
                      </button>
                      <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <li><a className="dropdown-item" href="#">View Profile</a></li>
                        <li><a className="dropdown-item" href="#">Edit User</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item text-danger" href="#">Suspend User</a></li>
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

export default UserTable;