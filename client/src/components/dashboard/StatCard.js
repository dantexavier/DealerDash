import React from 'react';

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <i className={`fas fa-${icon}`}></i>
      </div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
};

export default StatCard;