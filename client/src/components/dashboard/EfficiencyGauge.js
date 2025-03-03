import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

const EfficiencyGauge = ({ value = 0, size = 'medium', showLabel = true }) => {
  // Handle size variants
  const getSize = () => {
    switch(size) {
      case 'small': return { height: 160, outerRadius: 40, innerRadius: 30, fontSize: 12 };
      case 'large': return { height: 240, outerRadius: 80, innerRadius: 65, fontSize: 24 };
      default: return { height: 200, outerRadius: 60, innerRadius: 48, fontSize: 18 };
    }
  };
  
  // Calculate color based on efficiency value
  const getColor = () => {
    if (value >= 100) return '#34a853'; // Green for >= 100%
    if (value >= 80) return '#fbbc04';  // Yellow for 80-99%
    return '#ea4335';                   // Red for < 80%
  };
  
  // Get the appropriate label text
  const getLabelText = () => {
    if (value >= 100) return 'Excellent';
    if (value >= 80) return 'Good';
    return 'Needs Improvement';
  };
  
  const dimensions = getSize();
  const color = getColor();
  
  // Shape data for the gauge chart
  const data = [
    { name: 'Efficiency', value: Math.min(value, 100) },
    { name: 'Remainder', value: Math.max(0, 100 - Math.min(value, 100)) }
  ];

  return (
    <div className="efficiency-gauge-container">
      <ResponsiveContainer width="100%" height={dimensions.height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={dimensions.innerRadius}
            outerRadius={dimensions.outerRadius}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#e0e0e0" />
            <Label
              value={`${value.toFixed(1)}%`}
              position="center"
              fill={color}
              style={{ fontSize: dimensions.fontSize, fontWeight: 'bold' }}
            />
          </Pie>
          {showLabel && (
            <text
              x="50%"
              y={dimensions.outerRadius + 35}
              textAnchor="middle"
              fill="#5f6368"
              style={{ fontSize: dimensions.fontSize * 0.7 }}
            >
              {getLabelText()}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EfficiencyGauge;