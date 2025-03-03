import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const LaborList = ({ vehicleId }) => {
  const [labor, setLabor] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLabor = async () => {
      try {
        const url = vehicleId
          ? `/api/labor/vehicle/${vehicleId}`
          : '/api/labor';
        
        const res = await axios.get(url);
        setLabor(res.data);
      } catch (err) {
        toast.error('Failed to fetch labor entries');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLabor();
  }, [vehicleId]);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this labor entry?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/labor/${id}`);
      setLabor(labor.filter(entry => entry._id !== id));
      toast.success('Labor entry deleted successfully');
    } catch (err) {
      toast.error('Failed to delete labor entry');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };
  
  if (loading) {
    return <div className="loading">Loading labor data...</div>;
  }
  
  if (labor.length === 0) {
    return <div className="no-data">No labor entries found.</div>;
  }
  
  return (
    <div className="labor-list">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            {!vehicleId && <th>Vehicle</th>}
            <th>Mechanic</th>
            <th>Description</th>
            <th>Hours</th>
            <th>Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {labor.map(entry => (
            <tr key={entry._id}>
              <td>{formatDate(entry.date)}</td>
              {!vehicleId && (
                <td>
                  {entry.vehicle.year} {entry.vehicle.make} {entry.vehicle.model} 
                  <span className="small">(#{entry.vehicle.stock})</span>
                </td>
              )}
              <td>{entry.mechanic ? entry.mechanic.name : 'N/A'}</td>
              <td>{entry.description}</td>
              <td>{entry.hours}</td>
              <td>{formatCurrency(entry.cost)}</td>
              <td>
                <Link to={`/labor/${entry._id}/edit`} className="btn-sm btn-primary">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(entry._id)}
                  className="btn-sm btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LaborList;