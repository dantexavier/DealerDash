import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;