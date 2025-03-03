import React from 'react';
import EmptyState from '../common/EmptyState';

const SalesPerformanceReport = () => {
  return (
    <EmptyState
      title="Sales Performance Report"
      message="This report is currently under development. Check back soon for detailed sales analytics."
      icon="chart-line"
      actionButton={
        <button className="btn btn-primary" onClick={() => window.history.back()}>
          Return to Dashboard
        </button>
      }
    />
  );
};

export default SalesPerformanceReport;