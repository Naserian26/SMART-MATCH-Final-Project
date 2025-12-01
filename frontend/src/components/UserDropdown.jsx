// frontend/src/components/UserDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'jobseeker':
        return '/seeker/dashboard';
      case 'employer':
        return '/employer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button 
        className="btn btn-link nav-link text-white d-flex align-items-center" 
        type="button" 
        id="userDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={user?.avatar || `https://picsum.photos/seed/${user?._id || 'default'}/32/32.jpg`} 
          alt={user?.name || 'User'} 
          className="rounded-circle me-2"
          width="32"
          height="32"
        />
        <span className="d-none d-md-inline">{user?.name || 'Account'}</span>
        <i className="bi bi-chevron-down ms-1"></i>
      </button>
      
      <ul className={`dropdown-menu dropdown-menu-end ${isOpen ? 'show' : ''}`} aria-labelledby="userDropdown">
        <li>
          <Link className="dropdown-item" to="/profile">
            <i className="bi bi-person me-2"></i> My Profile
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={getDashboardLink()}>
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to="/chat">
            <i className="bi bi-chat-dots me-2"></i> Messages
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to="/settings">
            <i className="bi bi-gear me-2"></i> Settings
          </Link>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button className="dropdown-item" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default UserDropdown;