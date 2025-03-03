import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <Link to="/">Dealership Management System</Link>
      </div>
      <div className="navbar-menu">
        {user && (
          <>
            <span className="user-name">
              Welcome, {user.name}
            </span>
            <button onClick={logout} className="btn-sm">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;