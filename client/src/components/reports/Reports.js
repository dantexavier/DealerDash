import React, { useState } from 'react';
import LaborEfficiencyReport from './LaborEfficiencyReport';
import SalesPerformanceReport from './SalesPerformanceReport';
import InventoryAnalysisReport from './InventoryAnalysisReport';
import './Reports.css';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('laborEfficiency');
  
  const renderActiveReport = () => {
    switch (activeReport) {
      case 'laborEfficiency':
        return <LaborEfficiencyReport />;
      case 'sales':
        return <SalesPerformanceReport />;
      case 'inventory':
        return <InventoryAnalysisReport />;
      default:
        return <LaborEfficiencyReport />;
    }
  };
  
  return (
    <div className="reports-container">
      <div className="reports-tabs">
        <button 
          className={`report-tab ${activeReport === 'laborEfficiency' ? 'active' : ''}`}
          onClick={() => setActiveReport('laborEfficiency')}
        >
          <i className="fas fa-tools"></i> Labor Efficiency
        </button>
        <button 
          className={`report-tab ${activeReport === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveReport('sales')}
        >
          <i className="fas fa-chart-line"></i> Sales Performance
        </button>
        <button 
          className={`report-tab ${activeReport === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveReport('inventory')}
        >
          <i className="fas fa-warehouse"></i> Inventory Analysis
        </button>
      </div>
      
      <div className="active-report">
        {renderActiveReport()}
      </div>
    </div>
  );
};

export default Reports;