import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import StatCard from './StatCard';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import EfficiencyGauge from './EfficiencyGauge';
import { 
  InventoryStatusChart, 
  SalesTrendChart, 
  SalespersonChart, 
  AgeDistributionChart,
  MechanicEfficiencyChart
} from './DashboardCharts';
import { successToast, errorToast } from '../../utils/toastConfig';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  
  // Use ref to track initial load
  const initialLoadComplete = useRef(false);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/stats/dashboard?period=${period}`);
        setStats(res.data);
        
        // Only show success toast on the first successful load
        if (!initialLoadComplete.current) {
          successToast('Dashboard data loaded successfully');
          initialLoadComplete.current = true;
        }
      } catch (err) {
        errorToast(err.response?.data?.msg || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    // Only depend on period changes to prevent unnecessary rerenders
  }, [period]);
  
  const handlePeriodChange = e => {
    setPeriod(e.target.value);
  };
  
  // Sample data for sales trend chart (would be provided by API in a real scenario)
  const sampleSalesTrendData = [
    { month: 'Jan', sales: 24, profit: 48 },
    { month: 'Feb', sales: 31, profit: 62 },
    { month: 'Mar', sales: 28, profit: 52 },
    { month: 'Apr', sales: 35, profit: 71 },
    { month: 'May', sales: 29, profit: 57 },
    { month: 'Jun', sales: 38, profit: 79 }
  ];
  
  // Calculate additional data for age distribution
  const calculateAgeDistribution = () => {
    if (!stats) return { current: 0, aged30: 0, aged60: 0, aged90Plus: 0 };
    
    const current = stats.inventory.ready - 
                    stats.inventory.aging['30-60days'] - 
                    stats.inventory.aging['60-90days'] - 
                    stats.inventory.aging['90plus'];
    
    return {
      current: current > 0 ? current : 0,
      aged30: stats.inventory.aging['30-60days'],
      aged60: stats.inventory.aging['60-90days'],
      aged90Plus: stats.inventory.aging['90plus']
    };
  };
  
  if (loading && !stats) {
    return <LoadingSpinner size="large" text="Loading dashboard data..." />;
  }
  
  if (!stats) {
    return (
      <EmptyState
        title="No Dashboard Data"
        message="Unable to load dashboard data at this time. Please try again later."
        icon="chart-bar"
      />
    );
  }
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="period-selector">
          <label htmlFor="period">Time Period:</label>
          <select 
            id="period" 
            value={period} 
            onChange={handlePeriodChange}
            disabled={loading}
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <LoadingSpinner size="medium" text="Updating data..." />
      ) : (
        <>
          <div className="stat-cards">
            <StatCard 
              title="Units Sold" 
              value={stats.sales.unitsSold} 
              icon="tag" 
              color="#1a73e8"
            />
            <StatCard 
              title="Gross Profit / Unit" 
              value={`$${stats.sales.grossProfitPerUnit.toFixed(2)}`} 
              icon="dollar-sign" 
              color="#34a853"
            />
            <StatCard 
              title="Total Gross Profit" 
              value={`$${stats.sales.totalGrossProfit.toFixed(2)}`} 
              icon="chart-line" 
              color="#ea4335"
            />
            <StatCard 
              title="Avg Days to Sell" 
              value={stats.timing.avgDaysToSell.toFixed(1)} 
              icon="clock" 
              color="#fbbc04"
            />
          </div>
          
          <div className="dashboard-row">
            <div className="dashboard-col">
              <div className="dashboard-card">
                <h2>Inventory Status</h2>
                <InventoryStatusChart data={{
                  ready: stats.inventory.ready,
                  inRecon: stats.inventory.inRecon,
                  inTransport: stats.inventory.inTransport,
                  purchased: stats.inventory.purchased
                }} />
              </div>
            </div>
            <div className="dashboard-col">
              <div className="dashboard-card">
                <h2>Sales Trend</h2>
                <SalesTrendChart data={sampleSalesTrendData} />
              </div>
            </div>
          </div>
          
          <div className="dashboard-row">
            <div className="dashboard-col">
              <div className="dashboard-card">
                <h2>Sales by Salesperson</h2>
                <SalespersonChart data={stats.sales.salesBySalesperson} />
              </div>
            </div>
            <div className="dashboard-col">
              <div className="dashboard-card">
                <h2>Inventory Age Distribution</h2>
                <AgeDistributionChart data={calculateAgeDistribution()} />
              </div>
            </div>
          </div>
          
          <div className="dashboard-row">
            <div className="dashboard-col">
              <div className="dashboard-card">
                <h2>Overall Labor Efficiency</h2>
                <div className="efficiency-container">
                  <EfficiencyGauge value={stats.labor.efficiency || 0} size="large" />
                  <div className="efficiency-details">
                    <p>Book Hours: <strong>{stats.labor.totalStandardHours?.toFixed(1) || "0.0"}</strong></p>
                    <p>Actual Hours: <strong>{stats.labor.totalHours?.toFixed(1) || "0.0"}</strong></p>
                    <p>Efficiency Rating: <strong>{stats.labor.efficiency?.toFixed(1) || "0.0"}%</strong></p>
                    {stats.labor.efficiency < 80 && (
                      <div className="efficiency-alert">
                        <i className="fas fa-exclamation-triangle"></i>
                        Labor efficiency is below target. Review processes to improve efficiency.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboard-col">
              <div className="dashboard-card">
                <h2>Mechanic Efficiency</h2>
                <MechanicEfficiencyChart data={stats.labor.byMechanic || {}} />
              </div>
            </div>
          </div>
          
          <div className="dashboard-row">
            <div className="dashboard-col">
              <div className="dashboard-card">
                <h2>Timing Metrics (Days)</h2>
                <table className="detail-table">
                  <tbody>
                    <tr>
                      <td>Average Days to Sell:</td>
                      <td><strong>{stats.timing.avgDaysToSell.toFixed(1)}</strong></td>
                    </tr>
                    <tr>
                      <td>Average Transport Time:</td>
                      <td><strong>{stats.timing.avgTransportTime.toFixed(1)}</strong></td>
                    </tr>
                    <tr>
                      <td>Average Reconditioning Time:</td>
                      <td><strong>{stats.timing.avgReconTime.toFixed(1)}</strong></td>
                    </tr>
                    <tr>
                      <td>Average Time to Front Line:</td>
                      <td><strong>{stats.timing.avgTimeToLine.toFixed(1)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="dashboard-col">
              <div className="dashboard-card">
                <h2>Labor Metrics</h2>
                <table className="detail-table">
                  <tbody>
                    <tr>
                      <td>Total Labor Hours:</td>
                      <td><strong>{stats.labor.totalHours.toFixed(1)}</strong></td>
                    </tr>
                    <tr>
                      <td>Total Labor Cost:</td>
                      <td><strong>${stats.labor.totalCost.toFixed(2)}</strong></td>
                    </tr>
                    <tr>
                      <td>Effective Labor Rate:</td>
                      <td><strong>${stats.labor.effectiveLaborRate.toFixed(2)}/hr</strong></td>
                    </tr>
                    <tr>
                      <td>Recon Cost Per Unit:</td>
                      <td><strong>${stats.reconditioning.avgCostPerUnit.toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;