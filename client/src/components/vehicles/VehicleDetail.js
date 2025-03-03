import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LaborList from '../labor/LaborList';

const VehicleDetail = () => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`/api/vehicles/${id}`);
        setVehicle(res.data);
      } catch (err) {
        toast.error('Failed to fetch vehicle');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicle();
  }, [id]);
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/vehicles/${id}`);
      toast.success('Vehicle deleted successfully');
      navigate('/vehicles');
    } catch (err) {
      toast.error('Failed to delete vehicle');
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
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'ready': return 'status-ready';
      case 'in_recon': return 'status-recon';
      case 'in_transport': return 'status-transport';
      case 'purchased': return 'status-purchased';
      case 'sold': return 'status-sold';
      default: return '';
    }
  };
  
  if (loading) {
    return <div className="loading">Loading vehicle details...</div>;
  }
  
  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }
  
  return (
    <div className="vehicle-detail-container">
      <div className="detail-header">
        <h1>
          {vehicle.year} {vehicle.make} {vehicle.model} 
          <span className="vehicle-stock">Stock# {vehicle.stock}</span>
        </h1>
        
        <div className="detail-actions">
          <Link to={`/vehicles/${id}/edit`} className="btn btn-primary">
            Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
      
      <div className="vehicle-status">
        <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
          {vehicle.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="detail-row">
        <div className="detail-col">
          <div className="detail-card">
            <h2>Vehicle Information</h2>
            <table className="detail-table">
              <tbody>
                <tr>
                  <td>VIN:</td>
                  <td>{vehicle.vin}</td>
                </tr>
                <tr>
                  <td>Year:</td>
                  <td>{vehicle.year}</td>
                </tr>
                <tr>
                  <td>Make:</td>
                  <td>{vehicle.make}</td>
                </tr>
                <tr>
                  <td>Model:</td>
                  <td>{vehicle.model}</td>
                </tr>
                <tr>
                  <td>Trim:</td>
                  <td>{vehicle.trim || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Color:</td>
                  <td>{vehicle.color || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Mileage:</td>
                  <td>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="detail-col">
          <div className="detail-card">
            <h2>Purchase & Sales</h2>
            <table className="detail-table">
              <tbody>
                <tr>
                  <td>Purchase Date:</td>
                  <td>{formatDate(vehicle.purchaseDate)}</td>
                </tr>
                <tr>
                  <td>Purchase Price:</td>
                  <td>{formatCurrency(vehicle.purchasePrice)}</td>
                </tr>
                <tr>
                  <td>Purchase Location:</td>
                  <td>{vehicle.purchaseLocation || 'N/A'}</td>
                </tr>
                <tr>
                  <td>List Price:</td>
                  <td>{formatCurrency(vehicle.listPrice)}</td>
                </tr>
                <tr>
                  <td>Sold Date:</td>
                  <td>{formatDate(vehicle.soldDate)}</td>
                </tr>
                <tr>
                  <td>Sold Price:</td>
                  <td>{formatCurrency(vehicle.soldPrice)}</td>
                </tr>
                <tr>
                  <td>Sold By:</td>
                  <td>{vehicle.soldBy ? vehicle.soldBy.name : 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="detail-row">
        <div className="detail-col full-width">
          <div className="detail-card">
            <h2>Notes</h2>
            <div className="vehicle-notes">
              {vehicle.notes || 'No notes available.'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="detail-row">
        <div className="detail-col full-width">
          <div className="detail-card">
            <div className="detail-card-header">
              <h2>Labor & Reconditioning</h2>
              <Link to={`/labor/add?vehicle=${vehicle._id}`} className="btn-sm btn-primary">
                Add Labor
              </Link>
            </div>
            <LaborList vehicleId={vehicle._id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;