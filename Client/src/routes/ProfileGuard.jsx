import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProfileGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div />;

  if (!user?.profile?.full_name) {
    return (
      <Navigate
        to="/edit-profile"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
