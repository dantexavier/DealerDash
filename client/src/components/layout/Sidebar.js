import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Sidebar = ({ isOpen }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-links">
        <Link to="/" className={isActive('/')}>
          <i className="fas fa-tachometer-alt"></i> Dashboard
        </Link>
        <Link to="/vehicles" className={isActive('/vehicles')}>
          <i className="fas fa-car"></i> Vehicles
        </Link>
        <Link to="/labor" className={isActive('/labor')}>
          <i className="fas fa-tools"></i> Labor
        </Link>
        <Link to="/reports" className={isActive('/reports')}>
          <i className="fas fa-chart-bar"></i> Reports
        </Link>
        {isAdmin && (
          <Link to="/users" className={isActive('/users')}>
            <i className="fas fa-users"></i> Users
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;