// frontend/src/components/SkillGapAnalysis.jsx
import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const SkillGapAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await usersAPI.getSkillGapAnalysis();
        setAnalysis(response.data);
      } catch (error) {
        console.error('Error fetching skill gap analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Analyzing your skills..." />;
  }

  if (!analysis) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
          <h4>Unable to Generate Analysis</h4>
          <p className="text-muted">Please complete your profile to get skill gap analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-4">Skill Gap Analysis</h5>
        
        <div className="mb-4">
          <h6>Top Skills in Demand for Your Desired Role</h6>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Your Level</th>
                  <th>Required Level</th>
                  <th>Gap</th>
                </tr>
              </thead>
              <tbody>
                {analysis.skillGaps.map((skill, index) => (
                  <tr key={index}>
                    <td>{skill.name}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1 me-2" style={{ height: '10px' }}>
                          <div 
                            className="progress-bar bg-info" 
                            role="progressbar" 
                            style={{ width: `${skill.currentLevel * 20}%` }}
                            aria-valuenow={skill.currentLevel} 
                            aria-valuemin="0" 
                            aria-valuemax="5"
                          ></div>
                        </div>
                        <span>{skill.currentLevel}/5</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1 me-2" style={{ height: '10px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            role="progressbar" 
                            style={{ width: `${skill.requiredLevel * 20}%` }}
                            aria-valuenow={skill.requiredLevel} 
                            aria-valuemin="0" 
                            aria-valuemax="5"
                          ></div>
                        </div>
                        <span>{skill.requiredLevel}/5</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${skill.gap > 1 ? 'bg-danger' : skill.gap > 0 ? 'bg-warning' : 'bg-success'}`}>
                        {skill.gap > 0 ? `+${skill.gap}` : 'None'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mb-4">
          <h6>Recommended Learning Resources</h6>
          <div className="row">
            {analysis.recommendations.map((resource, index) => (
              <div key={index} className="col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title">{resource.title}</h6>
                    <p className="card-text text-muted small">{resource.description}</p>
                    <a href={resource.url} className="btn btn-sm btn-outline-primary" target="_blank" rel="noopener noreferrer">
                      View Resource
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h6>Improvement Tips</h6>
          <ul>
            {analysis.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysis;