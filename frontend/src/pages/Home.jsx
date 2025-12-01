import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI } from '../services/api';
import JobCard from '../components/JobCard';
import TestimonialCard from '../components/TestimonialCard';
import CategoryCard from '../components/CategoryCard';

const Home = () => {
  const { user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const categories = [
    { id: 1, name: 'Technology', icon: 'bi-cpu', count: 1250 },
    { id: 2, name: 'Healthcare', icon: 'bi-heart-pulse', count: 890 },
    { id: 3, name: 'Finance', icon: 'bi-currency-dollar', count: 750 },
    { id: 4, name: 'Education', icon: 'bi-mortarboard', count: 620 },
    { id: 5, name: 'Marketing', icon: 'bi-megaphone', count: 540 },
    { id: 6, name: 'Sales', icon: 'bi-graph-up', count: 480 }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      position: 'UX Designer',
      company: 'TechCorp',
      image: 'https://picsum.photos/seed/user1/100/100.jpg',
      text: 'SmartMatch helped me find my dream job in just two weeks. The matching algorithm is incredibly accurate!'
    },
    {
      id: 2,
      name: 'Michael Chen',
      position: 'HR Manager',
      company: 'Innovate Solutions',
      image: 'https://picsum.photos/seed/user2/100/100.jpg',
      text: 'As an employer, SmartMatch has made our hiring process so much more efficient. We find qualified candidates quickly.'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      position: 'Software Developer',
      company: 'Digital Dynamics',
      image: 'https://picsum.photos/seed/user3/100/100.jpg',
      text: 'The skill gap analysis feature helped me identify what I needed to work on to land my ideal job.'
    }
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch featured jobs
        try {
          const featuredResponse = await jobsAPI.getFeaturedJobs({ limit: 6 });
          setFeaturedJobs(featuredResponse.data.jobs || []);
        } catch (featuredError) {
          console.error('Error fetching featured jobs:', featuredError);
          // Fallback to regular jobs with featured filter
          const fallbackResponse = await jobsAPI.getJobs({ featured: true, limit: 6 });
          setFeaturedJobs(fallbackResponse.data.jobs || []);
        }
        
        // Fetch recommended jobs for logged-in job seekers
        if (user && user.role === 'jobseeker') {
          try {
            const recommendedResponse = await jobsAPI.getRecommendedJobs();
            setRecommendedJobs(recommendedResponse.data.jobs || []);
          } catch (recommendedError) {
            console.error('Error fetching recommended jobs:', recommendedError);
            // Don't set error for recommended jobs, just leave empty
          }
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || location.trim()) {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery);
      if (location.trim()) params.append('location', location);
      window.location.href = `/jobs?${params.toString()}`;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">Find Your Dream Job with Smart Matching</h1>
              <p className="lead mb-4">Our intelligent algorithm matches you with the perfect job opportunities based on your skills, experience, and preferences.</p>
              {!user && (
                <div className="d-flex gap-3 mb-4">
                  <Link to="/register" className="btn btn-light btn-lg">Get Started</Link>
                  <Link to="/jobs" className="btn btn-outline-light btn-lg">Browse Jobs</Link>
                </div>
              )}
            </div>
            <div className="col-lg-6">
              <div className="bg-white text-dark p-4 rounded shadow">
                <h4 className="mb-3">Find Your Next Job</h4>
                <form onSubmit={handleSearch}>
                  <div className="mb-3">
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      placeholder="Job title, keywords, or company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      placeholder="City, state, or remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100">Search Jobs</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-4">Browse by Category</h2>
          <div className="row g-4">
            {categories.map(category => (
              <div key={category.id} className="col-md-4 col-lg-2">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Featured Jobs</h2>
            <Link to="/jobs" className="btn btn-outline-primary">View All Jobs</Link>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center">
              {error}
              <button 
                className="btn btn-sm btn-outline-danger ms-2" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No featured jobs available at the moment.</p>
              <Link to="/jobs" className="btn btn-primary">Browse All Jobs</Link>
            </div>
          ) : (
            <div className="row g-4">
              {featuredJobs.map(job => (
                <div key={job._id} className="col-md-6 col-lg-4">
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recommended Jobs Section (for logged-in job seekers) */}
      {user && user.role === 'jobseeker' && recommendedJobs.length > 0 && (
        <section className="py-5">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Recommended for You</h2>
              <Link to="/jobs?recommended=true" className="btn btn-outline-primary">View All</Link>
            </div>
            
            <div className="row g-4">
              {recommendedJobs.slice(0, 3).map(job => (
                <div key={job._id} className="col-md-6 col-lg-4">
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">How SmartMatch Works</h2>
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-person-plus-fill fs-2"></i>
              </div>
              <h4>Create Your Profile</h4>
              <p>Sign up and complete your profile with your skills, experience, and preferences.</p>
            </div>
            <div className="col-md-4 text-center">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-lightning-charge-fill fs-2"></i>
              </div>
              <h4>Get Smart Matches</h4>
              <p>Our algorithm analyzes your profile and matches you with the most suitable job opportunities.</p>
            </div>
            <div className="col-md-4 text-center">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-chat-dots-fill fs-2"></i>
              </div>
              <h4>Connect & Apply</h4>
              <p>Connect with employers directly through our platform and apply with just one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">What Our Users Say</h2>
          <div className="row g-4">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="col-md-4">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Find Your Dream Job?</h2>
          <p className="lead mb-4">Join thousands of job seekers and employers who have found success with SmartMatch.</p>
          {!user ? (
            <Link to="/register" className="btn btn-light btn-lg">Get Started Now</Link>
          ) : (
            <Link to="/jobs" className="btn btn-light btn-lg">Browse Jobs</Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;