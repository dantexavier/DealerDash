import React from 'react';
import './EmptyState.css';

const EmptyState = ({ 
  title = 'No data found', 
  message = 'There are no items to display at this time.', 
  icon = 'inbox', 
  actionButton = null 
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className={`fas fa-${icon}`}></i>
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionButton && (
        <div className="empty-state-action">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EmptyState;