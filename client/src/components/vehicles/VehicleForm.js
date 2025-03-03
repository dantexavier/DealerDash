import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VehicleForm = () => {
  const initialFormState = {
    vin: '',
    stock: '',
    make: '',
    model: '',
    year: '',
    trim: '',
    color: '',
    mileage: '',
    purchaseDate: '',
    purchasePrice: '',
    purchaseLocation: '',
    arrivalDate: '',
    reconStartDate: '',
    frontLineDate: '',
    listPrice: '',
    soldDate: '',
    soldPrice: '',
    soldBy: '',
    status: 'purchased',
    notes: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [salespeople, setSalespeople] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  useEffect(() => {
    const fetchSalespeople = async () => {
      try {
        const res = await axios.get('/api/users?role=salesperson');
        setSalespeople(res.data);
      } catch (err) {
        toast.error('Failed to fetch salespeople');
      }
    };
    
    fetchSalespeople();
    
    if (isEdit) {
      const fetchVehicle = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`/api/vehicles/${id}`);
          
          // Convert dates to ISO string format for input fields
          const formattedData = {
            ...res.data,
            purchaseDate: res.data.purchaseDate ? new Date(res.data.purchaseDate).toISOString().split('T')[0] : '',
            arrivalDate: res.data.arrivalDate ? new Date(res.data.arrivalDate).toISOString().split('T')[0] : '',
            reconStartDate: res.data.reconStartDate ? new Date(res.data.reconStartDate).toISOString().split('T')[0] : '',
            frontLineDate: res.data.frontLineDate ? new Date(res.data.frontLineDate).toISOString().split('T')[0] : '',
            soldDate: res.data.soldDate ? new Date(res.data.soldDate).toISOString().split('T')[0] : '',
            soldBy: res.data.soldBy ? res.data.soldBy._id : ''
          };
          
          setFormData(formattedData);
        } catch (err) {
          toast.error('Failed to fetch vehicle data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchVehicle();
    }
  }, [id, isEdit]);
  
  const onChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Fix for ObjectId casting error - convert empty string to null
      const submissionData = { ...formData };
      if (submissionData.soldBy === '') {
        submissionData.soldBy = null;
      }
      
      if (isEdit) {
        await axios.put(`/api/vehicles/${id}`, submissionData);
        toast.success('Vehicle updated successfully');
        navigate(`/vehicles/${id}`);
      } else {
        const res = await axios.post('/api/vehicles', submissionData);
        toast.success('Vehicle added successfully');
        navigate(`/vehicles/${res.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEdit) {
    return <div className="loading">Loading vehicle data...</div>;
  }
  
  return (
    <div className="form-container">
      <h1>{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h1>
      
      <form onSubmit={onSubmit}>
        <div className="form-section">
          <h2>Vehicle Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vin">VIN</label>
              <input
                type="text"
                id="vin"
                name="vin"
                value={formData.vin}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="stock">Stock #</label>
              <input
                type="text"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={onChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="make">Make</label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={onChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="trim">Trim</label>
              <input
                type="text"
                id="trim"
                name="trim"
                value={formData.trim}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="mileage">Mileage</label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={onChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={onChange}
                required
              >
                <option value="purchased">Purchased</option>
                <option value="in_transport">In Transport</option>
                <option value="in_recon">In Reconditioning</option>
                <option value="ready">Ready to Sell</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Purchase Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="purchasePrice">Purchase Price</label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={onChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchaseLocation">Purchase Location</label>
              <input
                type="text"
                id="purchaseLocation"
                name="purchaseLocation"
                value={formData.purchaseLocation}
                onChange={onChange}
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Timeline</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="arrivalDate">Arrival Date</label>
              <input
                type="date"
                id="arrivalDate"
                name="arrivalDate"
                value={formData.arrivalDate}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reconStartDate">Recon Start Date</label>
              <input
                type="date"
                id="reconStartDate"
                name="reconStartDate"
                value={formData.reconStartDate}
                onChange={onChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="frontLineDate">Front Line Date</label>
              <input
                type="date"
                id="frontLineDate"
                name="frontLineDate"
                value={formData.frontLineDate}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="listPrice">List Price</label>
              <input
                type="number"
                id="listPrice"
                name="listPrice"
                value={formData.listPrice}
                onChange={onChange}
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Sales Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="soldDate">Sold Date</label>
              <input
                type="date"
                id="soldDate"
                name="soldDate"
                value={formData.soldDate}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="soldPrice">Sold Price</label>
              <input
                type="number"
                id="soldPrice"
                name="soldPrice"
                value={formData.soldPrice}
                onChange={onChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="soldBy">Sold By</label>
              <select
                id="soldBy"
                name="soldBy"
                value={formData.soldBy}
                onChange={onChange}
              >
                <option value="">Select Salesperson</option>
                {salespeople.map(person => (
                  <option key={person._id} value={person._id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Notes</h2>
          <div className="form-row">
            <div className="form-group">
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={onChange}
                rows="4"
                placeholder="Enter any additional notes about this vehicle"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Vehicle'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;