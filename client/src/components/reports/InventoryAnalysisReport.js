import React from 'react';
import EmptyState from '../common/EmptyState';

const InventoryAnalysisReport = () => {
  return (
    <EmptyState
      title="Inventory Analysis Report"
      message="This report module is being built. Soon you'll be able to analyze your inventory aging, turnover, and more."
      icon="warehouse"
      actionButton={
        <button className="btn btn-primary" onClick={() => window.history.back()}>
          Return to Dashboard
        </button>
      }
    />
  );
};

export default InventoryAnalysisReport;