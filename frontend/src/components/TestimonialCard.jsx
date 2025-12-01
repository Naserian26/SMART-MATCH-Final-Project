// frontend/src/components/TestimonialCard.jsx
import React from 'react';

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex mb-3">
          {[...Array(5)].map((_, i) => (
            <i key={i} className="bi bi-star-fill text-warning"></i>
          ))}
        </div>
        <p className="card-text">"{testimonial.text}"</p>
        <div className="d-flex align-items-center mt-3">
          <img 
            src={testimonial.image} 
            alt={testimonial.name} 
            className="rounded-circle me-3"
            width="50"
            height="50"
          />
          <div>
            <h6 className="mb-0">{testimonial.name}</h6>
            <p className="text-muted mb-0">{testimonial.position}, {testimonial.company}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;