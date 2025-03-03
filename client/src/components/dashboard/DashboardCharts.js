import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';

// Inventory Status Chart
export const InventoryStatusChart = ({ data }) => {
  const COLORS = ['#34A853', '#FBBC04', '#4285F4', '#9C27B0'];
  
  const chartData = [
    { name: 'Ready', value: data.ready },
    { name: 'In Recon', value: data.inRecon },
    { name: 'In Transport', value: data.inTransport },
    { name: 'Purchased', value: data.purchased }
  ];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false} // Changed from true to false
          outerRadius={80}  // Reduced from 100
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          // Using a more compact label format
          label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} vehicles`, 'Count']} />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{
            paddingTop: 20,
            fontSize: 12
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
// Sales Trend Chart
export const SalesTrendChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dadce0" />
        <XAxis dataKey="month" stroke="#5f6368" />
        <YAxis stroke="#5f6368" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: 'none', 
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }} 
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="sales" 
          stroke="#1a73e8" 
          strokeWidth={2}
          activeDot={{ r: 8, fill: "#1a73e8", stroke: "white", strokeWidth: 2 }}
        />
        <Line 
          type="monotone" 
          dataKey="profit" 
          stroke="#34a853" 
          strokeWidth={2} 
          activeDot={{ r: 8, fill: "#34a853", stroke: "white", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Salesperson Performance Chart
export const SalespersonChart = ({ data }) => {
  // Transform the data from object to array for the chart
  const chartData = Object.entries(data).map(([name, info]) => ({
    name,
    sales: info.count,
    profit: parseFloat((info.profit / 1000).toFixed(1)) // Convert to thousands for better display
  }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dadce0" />
        <XAxis dataKey="name" stroke="#5f6368" />
        <YAxis yAxisId="left" orientation="left" stroke="#1a73e8" />
        <YAxis yAxisId="right" orientation="right" stroke="#34a853" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: 'none', 
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }} 
          formatter={(value, name) => {
            if (name === 'profit') return [`$${value}k`, 'Profit'];
            return [value, 'Sales'];
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="sales" fill="#1a73e8" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="right" dataKey="profit" fill="#34a853" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Age Distribution Chart
export const AgeDistributionChart = ({ data }) => {
  const chartData = [
    { name: '0-30 Days', value: data.current },
    { name: '30-60 Days', value: data.aged30 },
    { name: '60-90 Days', value: data.aged60 },
    { name: '90+ Days', value: data.aged90Plus }
  ];
  
  // Color scale from green to red
  const COLORS = ['#34A853', '#FBBC04', '#F9AB00', '#EA4335'];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#dadce0" horizontal={false} />
        <XAxis type="number" stroke="#5f6368" />
        <YAxis dataKey="name" type="category" stroke="#5f6368" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: 'none', 
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }} 
          formatter={(value) => [`${value} vehicles`, 'Count']}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Mechanic Efficiency Chart
export const MechanicEfficiencyChart = ({ data }) => {
  // Transform data from object to array
  const chartData = Object.entries(data)
    .map(([name, info]) => ({
      name,
      efficiency: info.efficiency || 0,
      hours: info.hours || 0
    }))
    .sort((a, b) => b.hours - a.hours) // Sort by most hours worked
    .slice(0, 5); // Show top 5 mechanics by hours
  
  // Color function based on efficiency
  const getColor = (efficiency) => {
    if (efficiency >= 100) return '#34a853';
    if (efficiency >= 80) return '#fbbc04';
    return '#ea4335';
  };
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dadce0" />
        <XAxis dataKey="name" stroke="#5f6368" />
        <YAxis domain={[0, 120]} stroke="#5f6368" />
        <Tooltip 
          formatter={(value) => [`${value.toFixed(1)}%`, 'Efficiency']}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: 'none', 
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Bar dataKey="efficiency" name="Efficiency %" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.efficiency)} />
          ))}
        </Bar>
        <ReferenceLine y={100} stroke="#34a853" strokeDasharray="3 3" />
      </BarChart>
    </ResponsiveContainer>
  );
};