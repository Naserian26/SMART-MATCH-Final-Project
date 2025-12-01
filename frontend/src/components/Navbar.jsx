// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';

const Navbar = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark sticky-top ${scrolled ? 'bg-dark shadow' : 'bg-primary'}`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-briefcase-fill me-2"></i>
          <span className="fw-bold">SmartMatch</span>
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/jobs') ? 'active' : ''}`} to="/jobs" onClick={() => setMobileMenuOpen(false)}>
                Browse Jobs
              </Link>
            </li>
            {user && user.role === 'employer' && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="employerDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Employer
                </a>
                <ul className="dropdown-menu" aria-labelledby="employerDropdown">
                  <li><Link className="dropdown-item" to="/employer/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/employer/post-job" onClick={() => setMobileMenuOpen(false)}>Post a Job</Link></li>
                  <li><Link className="dropdown-item" to="/employer/dashboard?tab=analytics" onClick={() => setMobileMenuOpen(false)}>Analytics</Link></li>
                </ul>
              </li>
            )}
            {user && user.role === 'admin' && (
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`} to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </Link>
              </li>
            )}
          </ul>

          <form className="d-flex me-3" onSubmit={handleSearch}>
            <div className="input-group">
              <input 
                className="form-control" 
                type="search" 
                placeholder="Search jobs..." 
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-light" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link position-relative" to="/chat">
                    <i className="bi bi-chat-dots-fill"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      3
                    </span>
                  </Link>
                </li>
                <li className="nav-item">
                  <NotificationDropdown />
                </li>
                <li className="nav-item">
                  <UserDropdown />
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;