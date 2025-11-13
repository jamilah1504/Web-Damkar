import { ReactElement, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import paths, { rootPaths } from '../routes/paths';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactElement; // <<< 1. TAMBAHKAN 'children' di sini
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps): ReactElement => { // <<< 2. TERIMA 'children' di sini
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
    return children; // <<< 3. UBAH DARI <Outlet /> MENJADI 'children'
  }

  console.log('Redirecting to unauthorized: Role not allowed');
  return <Navigate to={paths.unauthorized} replace />;
};

export default ProtectedRoute;