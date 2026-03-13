import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // Redirect to the appropriate dashboard if they hit the wrong route
    if (userRole === "company") return <Navigate to="/company/dashboard" />;
    if (userRole === "jobseeker") return <Navigate to="/dashboard" />;
    return <Navigate to="/" />;
  }

  return children;
}
