// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5 className="mb-3">SmartMatch</h5>
            <p className="text-muted">Connecting talented professionals with their dream jobs through intelligent matching.</p>
            <div className="d-flex">
              <a href="#" className="text-white me-3"><i className="bi bi-facebook fs-5"></i></a>
              <a href="#" className="text-white me-3"><i className="bi bi-twitter fs-5"></i></a>
              <a href="#" className="text-white me-3"><i className="bi bi-linkedin fs-5"></i></a>
              <a href="#" className="text-white"><i className="bi bi-instagram fs-5"></i></a>
            </div>
          </div>
          <div className="col-md-2 mb-4 mb-md-0">
            <h6 className="mb-3">For Job Seekers</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/jobs" className="text-muted text-decoration-none">Browse Jobs</Link></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Career Advice</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Resume Builder</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Job Alerts</a></li>
            </ul>
          </div>
          <div className="col-md-2 mb-4 mb-md-0">
            <h6 className="mb-3">For Employers</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/employer/post-job" className="text-muted text-decoration-none">Post a Job</Link></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Pricing</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Talent Search</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Recruiting Solutions</a></li>
            </ul>
          </div>
          <div className="col-md-2 mb-4 mb-md-0">
            <h6 className="mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">About Us</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Contact</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Privacy Policy</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Terms of Service</a></li>
            </ul>
          </div>
          <div className="col-md-2">
            <h6 className="mb-3">Resources</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Help Center</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Blog</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">API</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Developers</a></li>
            </ul>
          </div>
        </div>
        <hr className="my-4 bg-secondary" />
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0 text-muted">&copy; {new Date().getFullYear()} SmartMatch. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <button className="btn btn-sm btn-outline-light me-2">
              <i className="bi bi-moon-fill me-1"></i> Dark Mode
            </button>
            <select className="form-select form-select-sm d-inline-block w-auto">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;