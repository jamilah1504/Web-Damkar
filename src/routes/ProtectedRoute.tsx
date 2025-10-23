import { ReactElement, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import paths, { rootPaths } from '../routes/paths';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps): ReactElement => {
  const location = useLocation();

  const token = localStorage.getItem('token');
  const storedRole = localStorage.getItem('role') ?? '';
  const role = storedRole.replace(/\s/g, '').toLowerCase();

  useEffect(() => {
    const isAuthorized = role && allowedRoles.includes(role);
    console.log('--- Protected Route Check ---');
    console.log('Token:', token ? token : 'No token found');
    console.log('Stored Role:', storedRole);
    console.log('Processed Role:', role);
    console.log('Allowed Roles:', allowedRoles);
    console.log('Is Authorized:', isAuthorized);
    console.log('Current Path:', location.pathname);
    console.log('-----------------------------');
  }, [token, role, allowedRoles, location.pathname]);

  if (!token) {
    console.log('Redirecting to login: No token detected');
    return (
      <Navigate to={`/${rootPaths.authRoot}/${paths.login}`} state={{ from: location }} replace />
    );
  }

  if (role && allowedRoles.includes(role)) {
    console.log('Access granted to:', location.pathname);
    return <Outlet />;
  }

  console.log('Redirecting to unauthorized: Role not allowed');
  return <Navigate to={paths.unauthorized} replace />;
};

export default ProtectedRoute;
