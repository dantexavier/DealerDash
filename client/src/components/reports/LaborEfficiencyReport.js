import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Line, Bar, ComposedChart, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart 
} from 'recharts';
import EfficiencyGauge from '../dashboard/EfficiencyGauge';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { errorToast } from '../../utils/toastConfig';

const LaborEfficiencyReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/stats/dashboard?period=${period}`);
        setData(res.data);
      } catch (err) {
        errorToast('Failed to fetch labor efficiency data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [period]);
  
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };
  
  if (loading) {
    return <LoadingSpinner size="large" text="Loading efficiency data..." />;
  }
  
  if (!data || !data.labor) {
    return (
      <EmptyState
        title="No Labor Efficiency Data"
        message="There is no labor data available for the selected period."
        icon="tools"
      />
    );
  }
  
  // Transform mechanic data for the chart
  const mechanicData = Object.entries(data.labor.byMechanic)
    .map(([name, info]) => ({
      name: name,
      efficiency: info.efficiency || 0,
      hours: info.hours || 0,
      standardHours: info.standardHours || 0
    }))
    .sort((a, b) => a.efficiency - b.efficiency);
  
  // Get color based on efficiency
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 100) return '#34a853';
    if (efficiency >= 80) return '#fbbc04';
    return '#ea4335';
  };
  
  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Labor Efficiency Report</h1>
        <div className="period-selector">
          <label htmlFor="period">Time Period:</label>
          <select id="period" value={period} onChange={handlePeriodChange}>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      <div className="report-section">
        <div className="overview-cards">
          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: 'rgba(52, 168, 83, 0.1)' }}>
              <i className="fas fa-tachometer-alt" style={{ color: '#34a853' }}></i>
            </div>
            <div className="metric-content">
              <div className="metric-title">Overall Efficiency</div>
              <div className="metric-value">{data.labor.efficiency.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: 'rgba(66, 133, 244, 0.1)' }}>
              <i className="fas fa-clock" style={{ color: '#4285f4' }}></i>
            </div>
            <div className="metric-content">
              <div className="metric-title">Book Hours</div>
              <div className="metric-value">{data.labor.totalStandardHours.toFixed(1)}</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: 'rgba(234, 67, 53, 0.1)' }}>
              <i className="fas fa-stopwatch" style={{ color: '#ea4335' }}></i>
            </div>
            <div className="metric-content">
              <div className="metric-title">Actual Hours</div>
              <div className="metric-value">{data.labor.totalHours.toFixed(1)}</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: 'rgba(251, 188, 4, 0.1)' }}>
              <i className="fas fa-dollar-sign" style={{ color: '#fbbc04' }}></i>
            </div>
            <div className="metric-content">
              <div className="metric-title">Effective Rate</div>
              <div className="metric-value">${data.labor.effectiveLaborRate.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="report-row">
        <div className="report-col">
          <div className="report-card">
            <h2>Overall Efficiency</h2>
            <div className="center-gauge">
              <EfficiencyGauge value={data.labor.efficiency} size="large" />
            </div>
            <div className="efficiency-explanation">
              <p>
                <strong>What this means:</strong> {
                  data.labor.efficiency >= 100 
                    ? "Your team is completing work faster than industry standards, which is excellent for profitability." 
                    : data.labor.efficiency >= 80 
                      ? "Your team is working at a good pace relative to industry standards." 
                      : "Your team is taking longer than industry standards to complete work, which may affect profitability."
                }
              </p>
            </div>
          </div>
        </div>
        <div className="report-col">
          <div className="report-card">
            <h2>Hours Comparison</h2>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={mechanicData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value.toFixed(1), name === 'efficiency' ? 'Efficiency %' : name]} />
                <Legend />
                <Bar dataKey="hours" name="Actual Hours" fill="#4285f4" />
                <Bar dataKey="standardHours" name="Book Hours" fill="#34a853" />
                <Line dataKey="efficiency" name="Efficiency %" stroke="#ea4335" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="report-section">
        <div className="report-card">
          <h2>Mechanic Efficiency Comparison</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={mechanicData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 120]} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Efficiency']} />
              <Legend />
              <Bar dataKey="efficiency" name="Efficiency %" barSize={20}>
                {
                  mechanicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getEfficiencyColor(entry.efficiency)} />
                  ))
                }
              </Bar>
              <ReferenceLine x={100} stroke="#34a853" label="Target" />
              <ReferenceLine x={80} stroke="#fbbc04" strokeDasharray="3 3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="report-section">
        <div className="report-card">
          <h2>Recommendations</h2>
          <div className="recommendations">
            {data.labor.efficiency < 80 && (
              <div className="recommendation-item">
                <div className="recommendation-icon warning">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="recommendation-content">
                  <h3>Improve Overall Efficiency</h3>
                  <p>Your team's efficiency is below the target of 80%. Consider:</p>
                  <ul>
                    <li>Reviewing training procedures</li>
                    <li>Evaluating tool and equipment needs</li>
                    <li>Analyzing workflow for bottlenecks</li>
                  </ul>
                </div>
              </div>
            )}
            
            {Object.entries(data.labor.byMechanic).some(([_, info]) => info.efficiency < 80) && (
              <div className="recommendation-item">
                <div className="recommendation-icon info">
                  <i className="fas fa-user-cog"></i>
                </div>
                <div className="recommendation-content">
                  <h3>Individual Performance Coaching</h3>
                  <p>Some mechanics are below 80% efficiency. Consider personalized coaching for:</p>
                  <ul>
                    {Object.entries(data.labor.byMechanic)
                      .filter(([_, info]) => info.efficiency < 80)
                      .map(([name, _]) => (
                        <li key={name}>{name}</li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            )}
            
            {Object.entries(data.labor.byMechanic).some(([_, info]) => info.efficiency > 120) && (
              <div className="recommendation-item">
                <div className="recommendation-icon success">
                  <i className="fas fa-award"></i>
                </div>
                <div className="recommendation-content">
                  <h3>Recognize Top Performers</h3>
                  <p>Some mechanics are exceeding expectations with 120%+ efficiency. Consider:</p>
                  <ul>
                    <li>Implementing recognition programs</li>
                    <li>Having them mentor lower-performing team members</li>
                    <li>Evaluating if standard hours are accurate for these individuals</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaborEfficiencyReport;