// frontend/src/components/CategoryCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link to={`/jobs?category=${category.name}`} className="text-decoration-none">
      <div className="card h-100 category-card">
        <div className="card-body text-center">
          <div className="mb-3">
            <i className={`bi ${category.icon} fs-1 text-primary`}></i>
          </div>
          <h5 className="card-title">{category.name}</h5>
          <p className="card-text text-muted">{category.count} Jobs</p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;