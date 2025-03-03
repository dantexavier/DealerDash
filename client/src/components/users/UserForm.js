import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserForm = () => {
  const initialFormState = {
    name: '',
    email: '',
    password: '',
    role: 'salesperson'
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  useEffect(() => {
    if (isEdit) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`/api/users/${id}`);
          setFormData({
            ...res.data,
            password: '' // Don't include password in edit mode
          });
        } catch (err) {
          toast.error('Failed to fetch user data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchUser();
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
      
      // If editing and password is empty, remove it from the request
      const submitData = {...formData};
      if (isEdit && !submitData.password) {
        delete submitData.password;
      }
      
      if (isEdit) {
        await axios.put(`/api/users/${id}`, submitData);
        toast.success('User updated successfully');
      } else {
        await axios.post('/api/users', submitData);
        toast.success('User added successfully');
      }
      
      navigate('/users');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEdit) {
    return <div className="loading">Loading user data...</div>;
  }
  
  return (
    <div className="form-container">
      <h1>{isEdit ? 'Edit User' : 'Add User'}</h1>
      
      <form onSubmit={onSubmit}>
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                {isEdit ? 'Password (leave blank to keep current)' : 'Password'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                required={!isEdit}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={onChange}
                required
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="salesperson">Salesperson</option>
                <option value="mechanic">Mechanic</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save User'}
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

export default UserForm;