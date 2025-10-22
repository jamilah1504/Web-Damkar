// router.ts
import { Suspense, lazy } from 'react';
import { Outlet, RouteObject, createBrowserRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';

// Komponen Wajib
import PageLoader from '../components/loading/PageLoader';
import Splash from '../components/loading/Splash';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminPeta from 'pages/admin/Peta';
import AdminPengguna from 'pages/admin/Pengguna';
import AdminNotifikasi from 'pages/admin/Notifikasi';
import AdminPengaturan from 'pages/admin/Pengaturan';
import AdminLaporanMasuk from 'pages/admin/laporan/LaporanMasuk';
import AdminLaporanRiwayat from 'pages/admin/laporan/LaporanRiwayat';
import AdminEdukasi from 'pages/admin/Edukasi';

// Layouts
const App = lazy(() => import('../App'));
const AuthLayout = lazy(() => import('../layouts/auth-layout'));
const AdminLayout = lazy(() => import('../layouts/admin-layout'));
const MasyarakatLayout = lazy(() => import('../layouts/masyarakat-layout'));
const PetugasLayout = lazy(() => import('../layouts/petugas-layout'));

// Halaman-halaman
const LandingPage = lazy(() => import('../pages/LandingPage'));
const Login = lazy(() => import('../pages/authentication/Login'));
const Register = lazy(() => import('../pages/authentication/SignUp'));
const Error404 = lazy(() => import('../pages/errors/Error404'));
const Unauthorized = lazy(() => import('../pages/errors/Unauthorized'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminJadwal = lazy(() => import('../pages/admin/Jadwal'));
const MasyarakatDashboard = lazy(() => import('../pages/masyarakat/MasyarakatDashboard'));
const MasyarakatBuatLaporan = lazy(() => import('../pages/masyarakat/laporan/BuatLaporan'));
const MasyarakatLacakLaporan = lazy(() => import('../pages/masyarakat/laporan/RiwayatLaporan'));
const MasyarakatAjukanKunjungan = lazy(() => import('../pages/masyarakat/InformasiPublik'));
const PetugasTugasAktif = lazy(() => import('../pages/petugas/TugasAktif'));
const PetugasRiwayat = lazy(() => import('../pages/petugas/RiwayatTugas'));
const PetugasPeta = lazy(() => import('../pages/petugas/PetaOprasional'));

const routes: RouteObject[] = [
  {
    element: (
      <Suspense fallback={<Splash />}>
        <App />
      </Suspense>
    ),
    children: [
      { path: paths.landing, element: <LandingPage /> },
      {
        path: rootPaths.authRoot, // path: 'auth'
        element: (
          <AuthLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </AuthLayout>
        ),
        children: [
          { path: paths.login, element: <Login /> },
          { path: paths.register, element: <Register /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          {
            path: rootPaths.adminRoot, // path: 'admin'
            element: (
              <AdminLayout>
                <Suspense fallback={<PageLoader />}>
                  <Outlet />
                </Suspense>
              </AdminLayout>
            ),
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: paths.adminDashboard, element: <AdminDashboard /> },
              { path: paths.adminJadwal, element: <AdminJadwal /> },
              { path: paths.adminPeta, element: <AdminPeta /> },
              { path: paths.adminNotifikasi, element: <AdminNotifikasi /> },
              { path: paths.adminPengguna, element: <AdminPengguna /> },
              { path: paths.adminPengaturan, element: <AdminPengaturan /> },
              { path: paths.adminLaporanMasuk, element: <AdminLaporanMasuk /> },
              { path: paths.adminLaporanRiwayat, element: <AdminLaporanRiwayat /> },
              { path: paths.AdminEdukasi, element: <AdminEdukasi /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['masyarakat']} />,
        children: [
          {
            path: rootPaths.masyarakatRoot, // path: 'masyarakat'
            element: (
              <MasyarakatLayout>
                <Suspense fallback={<PageLoader />}>
                  <Outlet />
                </Suspense>
              </MasyarakatLayout>
            ),
            children: [
              { index: true, element: <MasyarakatDashboard /> },
              { path: paths.masyarakatDashboard, element: <MasyarakatDashboard /> },
              { path: paths.masyarakatBuatLaporan, element: <MasyarakatBuatLaporan /> },
              { path: paths.masyarakatLacakLaporan, element: <MasyarakatLacakLaporan /> },
              { path: paths.masyarakatAjukanKunjungan, element: <MasyarakatAjukanKunjungan /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['petugas']} />,
        children: [
          {
            path: rootPaths.petugasRoot, // path: 'petugas'
            element: (
              <PetugasLayout>
                <Suspense fallback={<PageLoader />}>
                  <Outlet />
                </Suspense>
              </PetugasLayout>
            ),
            children: [
              { index: true, element: <PetugasTugasAktif /> }, // Default route for petugas
              { path: paths.petugasTugasAktif, element: <PetugasTugasAktif /> },
              { path: paths.petugasRiwayat, element: <PetugasRiwayat /> },
              { path: paths.petugasPeta, element: <PetugasPeta /> },
            ],
          },
        ],
      },
      { path: paths.unauthorized, element: <Unauthorized /> },
      { path: paths.notFound, element: <Error404 /> },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
