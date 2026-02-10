import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-heading text-sm uppercase tracking-wider text-muted-foreground">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some((r) => roles.includes(r as any))) {
    // Redirect to appropriate dashboard based on role
    if (roles.includes("admin")) return <Navigate to="/admin" replace />;
    if (roles.includes("merchant")) return <Navigate to="/merchant" replace />;
    if (roles.includes("delivery_partner")) return <Navigate to="/delivery" replace />;
    return <Navigate to="/order" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
