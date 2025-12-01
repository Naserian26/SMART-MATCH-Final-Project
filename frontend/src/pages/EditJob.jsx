// frontend/src/pages/EditJob.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { toast } from 'react-toastify';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    industry: '',
    location: '',
    jobType: '',
    workplaceType: '',
    experienceLevel: '',
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    description: '',
    requirements: [''],
    benefits: [''],
    skills: [''],
    applicationDeadline: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await jobsAPI.getJob(id);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
        navigate('/employer/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Filter out empty items from arrays
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
        skills: formData.skills.filter(skill => skill.trim() !== '')
      };
      
      await jobsAPI.updateJob(id, cleanedData);
      toast.success('Job updated successfully!');
      navigate('/employer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="mb-4">Edit Job</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="title" className="form-label">Job Title *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="title" 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="company" className="form-label">Company *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="company" 
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="industry" className="form-label">Industry *</label>
                    <select 
                      className="form-select" 
                      id="industry" 
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Industry</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Sales</option>
                      <option value="customer-service">Customer Service</option>
                      <option value="hr">Human Resources</option>
                      <option value="design">Design</option>
                      <option value="engineering">Engineering</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label">Location *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="location" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, State or Remote"
                      required
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="jobType" className="form-label">Job Type *</label>
                    <select 
                      className="form-select" 
                      id="jobType" 
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Job Type</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="temporary">Temporary</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="workplaceType" className="form-label">Workplace Type *</label>
                    <select 
                      className="form-select" 
                      id="workplaceType" 
                      name="workplaceType"
                      value={formData.workplaceType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Workplace Type</option>
                      <option value="on-site">On-site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="experienceLevel" className="form-label">Experience Level *</label>
                    <select 
                      className="form-select" 
                      id="experienceLevel" 
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Experience Level</option>
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="mid">Mid Level (3-5 years)</option>
                      <option value="senior">Senior Level (6-10 years)</option>
                      <option value="director">Director (11-15 years)</option>
                      <option value="executive">Executive (15+ years)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Salary Range</label>
                  <div className="row g-2">
                    <div className="col-4">
                      <select 
                        className="form-select" 
                        name="salary.currency"
                        value={formData.salary.currency}
                        onChange={handleChange}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div className="col-4">
                      <input 
                        type="number" 
                        className="form-control" 
                        name="salary.min"
                        value={formData.salary.min}
                        onChange={handleChange}
                        placeholder="Min"
                      />
                    </div>
                    <div className="col-4">
                      <input 
                        type="number" 
                        className="form-control" 
                        name="salary.max"
                        value={formData.salary.max}
                        onChange={handleChange}
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Job Description *</label>
                  <textarea 
                    className="form-control" 
                    id="description" 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Requirements *</label>
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="input-group mb-2">
                      <input 
                        type="text" 
                        className="form-control" 
                        value={requirement}
                        onChange={(e) => handleArrayChange(index, 'requirements', e.target.value)}
                        placeholder="Enter a requirement"
                      />
                      {formData.requirements.length > 1 && (
                        <button 
                          className="btn btn-outline-danger" 
                          type="button"
                          onClick={() => removeArrayItem(index, 'requirements')}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => addArrayItem('requirements')}
                  >
                    <i className="bi bi-plus-circle me-1"></i> Add Requirement
                  </button>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Benefits</label>
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="input-group mb-2">
                      <input 
                        type="text" 
                        className="form-control" 
                        value={benefit}
                        onChange={(e) => handleArrayChange(index, 'benefits', e.target.value)}
                        placeholder="Enter a benefit"
                      />
                      {formData.benefits.length > 1 && (
                        <button 
                          className="btn btn-outline-danger" 
                          type="button"
                          onClick={() => removeArrayItem(index, 'benefits')}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => addArrayItem('benefits')}
                  >
                    <i className="bi bi-plus-circle me-1"></i> Add Benefit
                  </button>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Skills Required *</label>
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="input-group mb-2">
                      <input 
                        type="text" 
                        className="form-control" 
                        value={skill}
                        onChange={(e) => handleArrayChange(index, 'skills', e.target.value)}
                        placeholder="Enter a skill"
                      />
                      {formData.skills.length > 1 && (
                        <button 
                          className="btn btn-outline-danger" 
                          type="button"
                          onClick={() => removeArrayItem(index, 'skills')}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => addArrayItem('skills')}
                  >
                    <i className="bi bi-plus-circle me-1"></i> Add Skill
                  </button>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="applicationDeadline" className="form-label">Application Deadline</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      id="applicationDeadline" 
                      name="applicationDeadline"
                      value={formData.applicationDeadline}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="contactEmail" className="form-label">Contact Email *</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="contactEmail" 
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="contactPhone" className="form-label">Contact Phone</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    id="contactPhone" 
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/employer/dashboard')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJob;