import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { successToast, errorToast } from '../../utils/toastConfig';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './VehicleList.css';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortDir: 'desc'
  });
  
  const initialLoadComplete = useRef(false);
  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/vehicles');
        setVehicles(res.data);
        
        // Only show the toast on initial load
        if (!initialLoadComplete.current) {
          successToast(`${res.data.length} vehicles loaded`);
          initialLoadComplete.current = true;
        }
      } catch (err) {
        errorToast(err.response?.data?.msg || 'Failed to fetch vehicles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);
  
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Apply filters and sorting
  const filteredVehicles = vehicles
    .filter(vehicle => {
      // Status filter
      if (filters.status && vehicle.status !== filters.status) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          vehicle.stock?.toLowerCase().includes(searchTerm) ||
          vehicle.vin?.toLowerCase().includes(searchTerm) ||
          vehicle.make?.toLowerCase().includes(searchTerm) ||
          vehicle.model?.toLowerCase().includes(searchTerm)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sorting
      const sortField = filters.sortBy;
      const dir = filters.sortDir === 'asc' ? 1 : -1;
      
      if (!a[sortField] && !b[sortField]) return 0;
      if (!a[sortField]) return dir;
      if (!b[sortField]) return -dir;
      
      if (sortField === 'createdAt' || sortField === 'updatedAt' || sortField === 'purchaseDate') {
        return dir * (new Date(a[sortField]) - new Date(b[sortField]));
      }
      
      if (typeof a[sortField] === 'string') {
        return dir * a[sortField].localeCompare(b[sortField]);
      }
      
      return dir * (a[sortField] - b[sortField]);
    });
  
  if (loading) {
    return <LoadingSpinner size="large" text="Loading vehicles..." />;
  }
  
  if (vehicles.length === 0) {
    return (
      <EmptyState
        title="No Vehicles Found"
        message="There are no vehicles in the system. Add your first vehicle to get started."
        icon="car"
        actionButton={
          <Link to="/vehicles/add" className="btn btn-primary">
            Add First Vehicle
          </Link>
        }
      />
    );
  }
  
  return (
    <div className="vehicle-list-container">
      <div className="list-header">
        <h1>Vehicles</h1>
        <Link to="/vehicles/add" className="btn btn-primary">
          <i className="fas fa-plus"></i> Add Vehicle
        </Link>
      </div>
      
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="status">Status:</label>
          <select 
            id="status" 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="purchased">Purchased</option>
            <option value="in_transport">In Transport</option>
            <option value="in_recon">In Reconditioning</option>
            <option value="ready">Ready to Sell</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by stock #, VIN, make or model"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="sortBy">Sort By:</label>
          <select 
            id="sortBy" 
            name="sortBy" 
            value={filters.sortBy} 
            onChange={handleFilterChange}
          >
            <option value="createdAt">Date Added</option>
            <option value="year">Year</option>
            <option value="make">Make</option>
            <option value="purchaseDate">Purchase Date</option>
            <option value="listPrice">List Price</option>
          </select>
          
          <select 
            id="sortDir" 
            name="sortDir" 
            value={filters.sortDir} 
            onChange={handleFilterChange}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
      
      <div className="vehicle-count">
        Showing {filteredVehicles.length} vehicles
      </div>
      
      {filteredVehicles.length === 0 ? (
        <EmptyState
          title="No Matching Vehicles"
          message="No vehicles match your current filter criteria. Try adjusting your filters."
          icon="filter"
        />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Stock #</th>
                <th>Year</th>
                <th>Make</th>
                <th>Model</th>
                <th>Purchase Date</th>
                <th>Status</th>
                <th>List Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <TransitionGroup component={null}>
                {filteredVehicles.map(vehicle => (
                  <CSSTransition
                    key={vehicle._id}
                    timeout={300}
                    classNames="fade"
                  >
                    <tr>
                      <td>{vehicle.stock}</td>
                      <td>{vehicle.year}</td>
                      <td>{vehicle.make}</td>
                      <td>{vehicle.model}</td>
                      <td>{formatDate(vehicle.purchaseDate)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                          {vehicle.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{vehicle.listPrice ? `$${vehicle.listPrice.toLocaleString()}` : '-'}</td>
                      <td>
                        <Link to={`/vehicles/${vehicle._id}`} className="btn-sm btn-info">
                          <i className="fas fa-eye"></i> View
                        </Link>
                        <Link to={`/vehicles/${vehicle._id}/edit`} className="btn-sm btn-primary">
                          <i className="fas fa-edit"></i> Edit
                        </Link>
                      </td>
                    </tr>
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VehicleList;