import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/contextValue";

const PrivateRoute = ({ allowedRoles }) => {
  // Defensive: sometimes during HMR the context module can be temporarily
  // undefined which would cause destructure errors. Guard against that.
  const ctx = useContext(UserContext) || {};
  const { user, loading } = ctx;

  if (loading || loading === undefined) {
    return <div>Đang tải...</div>; // Show a loading indicator
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
