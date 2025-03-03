import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';
import { successToast, errorToast } from '../../utils/toastConfig';

const LaborForm = () => {
  const initialFormState = {
    vehicle: '',
    description: '',
    hours: '',
    standardHours: '', // Added standard hours field
    cost: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commonTasks, setCommonTasks] = useState([]);  // For common service tasks
  
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedVehicle = queryParams.get('vehicle');
  
  const isEdit = !!id;
  
  // Common service tasks with standard hours (these would typically come from a database)
  useEffect(() => {
    setCommonTasks([
      { task: 'Oil Change', standardHours: 0.5 },
      { task: 'Tire Rotation', standardHours: 0.5 },
      { task: 'Brake Pad Replacement', standardHours: 1.5 },
      { task: 'Fluid Change', standardHours: 1.0 },
      { task: 'Air Filter Replacement', standardHours: 0.3 },
      { task: 'Full Inspection', standardHours: 2.0 },
      { task: 'Battery Replacement', standardHours: 0.5 },
      { task: 'Spark Plug Replacement', standardHours: 1.2 },
      { task: 'Wheel Alignment', standardHours: 1.0 },
      { task: 'Headlight Replacement', standardHours: 0.5 },
    ]);
  }, []);
  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get('/api/vehicles');
        setVehicles(res.data);
      } catch (err) {
        errorToast('Failed to fetch vehicles');
      }
    };
    
    fetchVehicles();
    
    if (preSelectedVehicle) {
      setFormData(prev => ({ ...prev, vehicle: preSelectedVehicle }));
    }
    
    if (isEdit) {
      const fetchLabor = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`/api/labor/${id}`);
          
          // Format date for the input field
          const formattedData = {
            ...res.data,
            date: res.data.date ? new Date(res.data.date).toISOString().split('T')[0] : '',
            vehicle: res.data.vehicle._id,
            standardHours: res.data.standardHours || '' // Handle existing records
          };
          
          setFormData(formattedData);
        } catch (err) {
          console.error('Detailed fetch error:', err);
          errorToast('Failed to fetch labor entry: ' + (err.response?.data?.msg || err.message));
        } finally {
          setLoading(false);
        }
      };
      
      fetchLabor();
    }
  }, [id, isEdit, preSelectedVehicle]);
  
  const onChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleCommonTaskSelection = e => {
    const taskName = e.target.value;
    if (taskName) {
      const selectedTask = commonTasks.find(task => task.task === taskName);
      if (selectedTask) {
        setFormData({
          ...formData,
          description: selectedTask.task,
          standardHours: selectedTask.standardHours
        });
      }
    }
  };
  
  const calculateEfficiency = () => {
    const hours = parseFloat(formData.hours) || 0;
    const standardHours = parseFloat(formData.standardHours) || 0;
    
    if (hours === 0 || standardHours === 0) return 0;
    return (standardHours / hours) * 100;
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validation
      if (!formData.standardHours) {
        errorToast('Standard hours is required. Please select a task or enter a value.');
        setLoading(false);
        return;
      }
      
      if (isEdit) {
        await axios.put(`/api/labor/${id}`, formData);
        successToast('Labor entry updated successfully');
      } else {
        await axios.post('/api/labor', formData);
        successToast('Labor entry added successfully');
      }
      
      // Redirect to appropriate page
      if (preSelectedVehicle) {
        navigate(`/vehicles/${preSelectedVehicle}`);
      } else {
        navigate('/labor');
      }
    } catch (err) {
      errorToast(err.response?.data?.msg || 'Failed to save labor entry');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEdit) {
    return <LoadingSpinner size="large" text="Loading labor data..." />;
  }
  
  const fetchLabor = async () => {
    try {
      setLoading(true);
      // Verify the ID is in the correct format for MongoDB (_id should be a 24-char hex string)
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        throw new Error('Invalid labor entry ID format');
      }
      
      const res = await axios.get(`/api/labor/${id}`);
      
      // Format date for the input field
      const formattedData = {
        ...res.data,
        date: res.data.date ? new Date(res.data.date).toISOString().split('T')[0] : '',
        vehicle: res.data.vehicle._id || res.data.vehicle,
        standardHours: res.data.standardHours || '' // Handle existing records
      };
      
      setFormData(formattedData);
    } catch (err) {
      console.error('Detailed fetch error:', err);
      
      // More specific error messages based on status code
      if (err.response && err.response.status === 404) {
        errorToast('Labor entry not found. It may have been deleted.');
      } else {
        errorToast('Failed to fetch labor entry: ' + (err.response?.data?.msg || err.message));
      }
      
      // Redirect back to the vehicle or labor list if entry not found
      setTimeout(() => {
        if (preSelectedVehicle) {
          navigate(`/vehicles/${preSelectedVehicle}`);
        } else {
          navigate('/labor');
        }
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const efficiency = calculateEfficiency();
  const efficiencyClass = efficiency >= 100 ? 'good-efficiency' : efficiency >= 80 ? 'fair-efficiency' : 'poor-efficiency';
  
  return (
    <div className="form-container">
      <h1>{isEdit ? 'Edit Labor Entry' : 'Add Labor Entry'}</h1>
      
      <form onSubmit={onSubmit}>
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicle">Vehicle</label>
              <select
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={onChange}
                required
                disabled={!!preSelectedVehicle || isEdit}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} (Stock: {vehicle.stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={onChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="commonTask">Common Service Tasks</label>
              <select
                id="commonTask"
                onChange={handleCommonTaskSelection}
                value={commonTasks.find(task => task.task === formData.description)?.task || ''}
              >
                <option value="">Select a common task...</option>
                {commonTasks.map((task, index) => (
                  <option key={index} value={task.task}>
                    {task.task} (Book Time: {task.standardHours}hr)
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="Brief description of the work performed"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="standardHours">Book Time / Standard Hours</label>
              <input
                type="number"
                id="standardHours"
                name="standardHours"
                value={formData.standardHours}
                onChange={onChange}
                step="0.1"
                placeholder="Standard time for this task"
                required
              />
              <small>Industry standard time to complete this task</small>
            </div>
            <div className="form-group">
              <label htmlFor="hours">Actual Hours</label>
              <input
                type="number"
                id="hours"
                name="hours"
                value={formData.hours}
                onChange={onChange}
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cost">Cost ($)</label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={onChange}
                step="0.01"
                required
              />
            </div>
          </div>
          
          {formData.hours && formData.standardHours && (
            <div className="efficiency-indicator">
              <label>Labor Efficiency:</label>
              <div className={`efficiency-value ${efficiencyClass}`}>
                {efficiency.toFixed(1)}%
                {efficiency >= 100 ? 
                  <span> <i className="fas fa-check-circle"></i> Great!</span> : 
                  efficiency >= 80 ? 
                    <span> <i className="fas fa-info-circle"></i> Satisfactory</span> : 
                    <span> <i className="fas fa-exclamation-circle"></i> Needs Improvement</span>
                }
              </div>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={onChange}
                rows="3"
                placeholder="Additional details about the labor performed"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Labor Entry'}
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

export default LaborForm;