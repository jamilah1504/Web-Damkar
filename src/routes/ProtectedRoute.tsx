// ProtectedRoute.tsx
import { ReactElement, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import paths, { rootPaths } from '../routes/paths'; // Impor rootPaths untuk konsistensi
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps): ReactElement => {
  const location = useLocation();
  const role = localStorage.getItem('role')?.toLowerCase();
  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log('Role di ProtectedRoute:', role, 'Allowed Roles:', allowedRoles);
  }, [role, allowedRoles]);

  if (!token) {
    return (
      <Navigate to={`/${rootPaths.authRoot}/${paths.login}`} state={{ from: location }} replace />
    );
  }

  if (role && allowedRoles.includes(role)) {
    return <Outlet />;
  }

  return <Navigate to={paths.unauthorized} replace />;
};

export default ProtectedRoute;
