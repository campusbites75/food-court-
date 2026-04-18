import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const verified = localStorage.getItem("adminVerified");

  if (!verified) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default ProtectedRoute;
