import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data);
      } catch (err) {
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (loading) {
    return <div className="loading">Loading users...</div>;
  }
  
  return (
    <div className="user-list-container">
      <div className="list-header">
        <h1>Users</h1>
        <Link to="/users/add" className="btn btn-primary">
          Add User
        </Link>
      </div>
      
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <Link to={`/users/${user._id}/edit`} className="btn-sm btn-primary">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(user._id)}
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
    </div>
  );
};

export default UserList;