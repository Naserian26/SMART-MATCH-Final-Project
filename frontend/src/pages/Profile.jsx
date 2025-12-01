// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    headline: '',
    about: '',
    location: '',
    phone: '',
    website: '',
    linkedin: '',
    github: '',
    skills: [],
    experience: [],
    education: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await usersAPI.getProfile();
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await usersAPI.updateProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('resume', file);
      
      try {
        await usersAPI.uploadResume(formData);
        toast.success('Resume uploaded successfully');
        setResumeFile(file);
      } catch (error) {
        toast.error('Failed to upload resume');
      }
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        await usersAPI.uploadAvatar(formData);
        toast.success('Avatar updated successfully');
        setAvatarFile(file);
      } catch (error) {
        toast.error('Failed to update avatar');
      }
    }
  };

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
                  className={`list-group-item list-group-item-action ${activeTab === 'personal' ? 'active' : ''}`}
                  onClick={() => setActiveTab('personal')}
                >
                  <i className="bi bi-person me-2"></i> Personal Information
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'professional' ? 'active' : ''}`}
                  onClick={() => setActiveTab('professional')}
                >
                  <i className="bi bi-briefcase me-2"></i> Professional Details
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'skills' ? 'active' : ''}`}
                  onClick={() => setActiveTab('skills')}
                >
                  <i className="bi bi-star me-2"></i> Skills
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'experience' ? 'active' : ''}`}
                  onClick={() => setActiveTab('experience')}
                >
                  <i className="bi bi-graph-up me-2"></i> Experience
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'education' ? 'active' : ''}`}
                  onClick={() => setActiveTab('education')}
                >
                  <i className="bi bi-mortarboard me-2"></i> Education
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'documents' ? 'active' : ''}`}
                  onClick={() => setActiveTab('documents')}
                >
                  <i className="bi bi-file-earmark me-2"></i> Documents
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-9">
          {activeTab === 'personal' && (
            <div>
              <h2 className="mb-4">Personal Information</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                      <div className="col-md-4 text-center">
                        <div className="mb-3">
                          <img 
                            src={user?.avatar || `https://picsum.photos/seed/${user?._id}/150/150.jpg`} 
                            alt={user?.name} 
                            className="rounded-circle mb-3"
                            width="150"
                            height="150"
                          />
                          <div className="mb-3">
                            <label htmlFor="avatar" className="btn btn-outline-primary btn-sm">
                              Change Avatar
                            </label>
                            <input 
                              type="file" 
                              className="d-none" 
                              id="avatar"
                              onChange={handleAvatarUpload}
                              accept="image/*"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-8">
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">Full Name</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="name" 
                            name="name"
                            value={profileData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email Address</label>
                          <input 
                            type="email" 
                            className="form-control" 
                            id="email" 
                            name="email"
                            value={profileData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="phone" className="form-label">Phone Number</label>
                          <input 
                            type="tel" 
                            className="form-control" 
                            id="phone" 
                            name="phone"
                            value={profileData.phone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="headline" className="form-label">Professional Headline</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="headline" 
                        name="headline"
                        value={profileData.headline}
                        onChange={handleChange}
                        placeholder="e.g. Senior Software Engineer"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="about" className="form-label">About</label>
                      <textarea 
                        className="form-control" 
                        id="about" 
                        name="about"
                        value={profileData.about}
                        onChange={handleChange}
                        rows="5"
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="location" className="form-label">Location</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="location" 
                        name="location"
                        value={profileData.location}
                        onChange={handleChange}
                        placeholder="City, State, Country"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="website" className="form-label">Website</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        id="website" 
                        name="website"
                        value={profileData.website}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="linkedin" className="form-label">LinkedIn Profile</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        id="linkedin" 
                        name="linkedin"
                        value={profileData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="github" className="form-label">GitHub Profile</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        id="github" 
                        name="github"
                        value={profileData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                    
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
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'professional' && (
            <div>
              <h2 className="mb-4">Professional Details</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="industry" className="form-label">Industry</label>
                      <select className="form-select" id="industry" name="industry" value={profileData.industry} onChange={handleChange}>
                        <option value="">Select Industry</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Sales</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="experienceLevel" className="form-label">Experience Level</label>
                      <select className="form-select" id="experienceLevel" name="experienceLevel" value={profileData.experienceLevel} onChange={handleChange}>
                        <option value="">Select Experience Level</option>
                        <option value="entry">Entry Level (0-2 years)</option>
                        <option value="mid">Mid Level (3-5 years)</option>
                        <option value="senior">Senior Level (6-10 years)</option>
                        <option value="director">Director (11-15 years)</option>
                        <option value="executive">Executive (15+ years)</option>
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="jobType" className="form-label">Preferred Job Type</label>
                      <select className="form-select" id="jobType" name="jobType" value={profileData.jobType} onChange={handleChange}>
                        <option value="">Select Job Type</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="temporary">Temporary</option>
                        <option value="internship">Internship</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="workplaceType" className="form-label">Preferred Workplace Type</label>
                      <select className="form-select" id="workplaceType" name="workplaceType" value={profileData.workplaceType} onChange={handleChange}>
                        <option value="">Select Workplace Type</option>
                        <option value="on-site">On-site</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="salaryExpectation" className="form-label">Salary Expectation</label>
                      <div className="row g-2">
                        <div className="col-6">
                          <input 
                            type="number" 
                            className="form-control" 
                            id="salaryMin" 
                            name="salaryMin"
                            value={profileData.salaryMin}
                            onChange={handleChange}
                            placeholder="Min"
                          />
                        </div>
                        <div className="col-6">
                          <input 
                            type="number" 
                            className="form-control" 
                            id="salaryMax" 
                            name="salaryMax"
                            value={profileData.salaryMax}
                            onChange={handleChange}
                            placeholder="Max"
                          />
                        </div>
                      </div>
                    </div>
                    
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
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'skills' && (
            <div>
              <h2 className="mb-4">Skills</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="mb-4">
                    <label htmlFor="newSkill" className="form-label">Add New Skill</label>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        id="newSkill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Enter a skill"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      />
                      <button className="btn btn-outline-primary" type="button" onClick={handleAddSkill}>
                        Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h5>Your Skills</h5>
                    {profileData.skills.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <span key={index} className="badge bg-primary d-flex align-items-center">
                            {skill}
                            <button 
                              type="button" 
                              className="btn-close btn-close-white ms-1" 
                              style={{ fontSize: '0.65em' }}
                              onClick={() => handleRemoveSkill(skill)}
                            ></button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">No skills added yet</p>
                    )}
                  </div>
                  
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleSubmit}
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
              </div>
            </div>
          )}
          
          {activeTab === 'experience' && (
            <div>
              <h2 className="mb-4">Experience</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  {profileData.experience.length > 0 ? (
                    <div className="timeline">
                      {profileData.experience.map((exp, index) => (
                        <div key={index} className="timeline-item mb-4">
                          <div className="d-flex">
                            <div className="flex-shrink-0">
                              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-briefcase"></i>
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <h5>{exp.title}</h5>
                              <h6 className="text-muted">{exp.company} | {exp.period}</h6>
                              <p>{exp.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No experience added yet</p>
                  )}
                  
                  <button className="btn btn-primary">
                    <i className="bi bi-plus-circle me-1"></i> Add Experience
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'education' && (
            <div>
              <h2 className="mb-4">Education</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  {profileData.education.length > 0 ? (
                    <div className="timeline">
                      {profileData.education.map((edu, index) => (
                        <div key={index} className="timeline-item mb-4">
                          <div className="d-flex">
                            <div className="flex-shrink-0">
                              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-mortarboard"></i>
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <h5>{edu.degree}</h5>
                              <h6 className="text-muted">{edu.institution} | {edu.period}</h6>
                              <p>{edu.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No education added yet</p>
                  )}
                  
                  <button className="btn btn-primary">
                    <i className="bi bi-plus-circle me-1"></i> Add Education
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'documents' && (
            <div>
              <h2 className="mb-4">Documents</h2>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="mb-4">
                    <h5>Resume</h5>
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-file-earmark-pdf fs-3 text-danger me-3"></i>
                      <div className="flex-grow-1">
                        <p className="mb-0">My Resume.pdf</p>
                        <p className="text-muted small">Uploaded on Nov 15, 2023</p>
                      </div>
                      <button className="btn btn-sm btn-outline-danger">Delete</button>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="resume" className="btn btn-outline-primary">
                        Upload New Resume
                      </label>
                      <input 
                        type="file" 
                        className="d-none" 
                        id="resume"
                        onChange={handleResumeUpload}
                        accept=".pdf,.doc,.docx"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5>Cover Letter</h5>
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-file-earmark-text fs-3 text-primary me-3"></i>
                      <div className="flex-grow-1">
                        <p className="mb-0">Cover Letter.pdf</p>
                        <p className="text-muted small">Uploaded on Nov 10, 2023</p>
                      </div>
                      <button className="btn btn-sm btn-outline-danger">Delete</button>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="coverLetter" className="btn btn-outline-primary">
                        Upload Cover Letter
                      </label>
                      <input 
                        type="file" 
                        className="d-none" 
                        id="coverLetter"
                        accept=".pdf,.doc,.docx"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5>Portfolio</h5>
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-file-earmark-zip fs-3 text-success me-3"></i>
                      <div className="flex-grow-1">
                        <p className="mb-0">Portfolio.zip</p>
                        <p className="text-muted small">Uploaded on Nov 5, 2023</p>
                      </div>
                      <button className="btn btn-sm btn-outline-danger">Delete</button>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="portfolio" className="btn btn-outline-primary">
                        Upload Portfolio
                      </label>
                      <input 
                        type="file" 
                        className="d-none" 
                        id="portfolio"
                        accept=".zip,.pdf"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;