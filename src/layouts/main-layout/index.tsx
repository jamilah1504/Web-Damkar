import { PropsWithChildren, ReactElement, useState, useEffect, useRef } from 'react';
import { Box, Drawer, Stack, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import Navigation
import Swal from 'sweetalert2'; // Import SweetAlert2
import api from '../../api'; // Pastikan import API instance Anda

import Sidebar from 'layouts/main-layout/Sidebar/Sidebar';
import Topbar from 'layouts/main-layout/Topbar/Topbar';
import Footer from './Footer';

export const drawerWidth = 278;

// Tipe data sederhana untuk Laporan
interface Report {
  id: number;
  judul: string; // Sesuaikan dengan field API Anda
  lokasi?: string;
}

const MainLayout = ({ children }: PropsWithChildren): ReactElement => {
  const navigate = useNavigate(); // Hook navigasi
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Ref untuk menyimpan ID laporan terakhir agar tidak re-render layout
  const lastKnownReportId = useRef<number | null>(null);

  // === LOGIC POLLING LAPORAN BARU (SWAL) ===
  useEffect(() => {
    const checkNewReports = async () => {
      try {
        // 1. Ambil data dari API
        const response = await api.get('/reports'); 
        const reports: Report[] = response.data;

        // Pastikan ada data
        if (Array.isArray(reports) && reports.length > 0) {
          // Asumsi: Data index 0 adalah yang terbaru. 
          // Jika API tidak mengurutkan, lakukan sort: reports.sort((a, b) => b.id - a.id);
          const latestReport = reports[0];

          // 2. Logika Pengecekan
          if (lastKnownReportId.current === null) {
            // Load pertama kali: Simpan ID saja, jangan munculkan notif
            lastKnownReportId.current = latestReport.id;
          } else if (latestReport.id > lastKnownReportId.current) {
            // 3. KONDISI LAPORAN BARU -> MUNCULKAN SWAL
            
            // Update ID terakhir agar notif tidak muncul berulang
            lastKnownReportId.current = latestReport.id;

            // Panggil SweetAlert
            Swal.fire({
              position: 'top-end', // Muncul di pojok kanan atas
              icon: 'warning',     // Icon peringatan/info
              title: 'Laporan Baru Masuk!',
              text: `${latestReport.judul}`,
              showConfirmButton: true,
              confirmButtonText: 'Lihat Lokasi',
              showCancelButton: true,
              cancelButtonText: 'Tutup',
              timer: 10000, // Hilang otomatis setelah 10 detik jika tidak diklik
              timerProgressBar: true,
              background: '#fff',
              iconColor: '#d32f2f', // Merah Damkar
              confirmButtonColor: '#d32f2f',
              customClass: {
                container: 'highest-z-index', // Class z-index yang Anda minta sebelumnya
                popup: 'swal2-toast-style' // Opsional untuk styling tambahan
              },
              toast: true, // Mode Toast (seperti notifikasi HP)
            }).then((result) => {
              if (result.isConfirmed) {
                // 4. Aksi jika tombol "Lihat Lokasi" diklik
                // Ganti path ini sesuai routing detail laporan Anda
                navigate(`/laporan/${latestReport.id}`); 
              }
            });

            // Opsional: Mainkan Audio
            // const audio = new Audio('/assets/sounds/notification.mp3');
            // audio.play().catch(e => console.log("Audio play blocked", e));
          }
        }
      } catch (error) {
        console.error("Gagal polling laporan:", error);
      }
    };

    // Jalankan pengecekan pertama kali
    checkNewReports();

    // Set Interval: Cek setiap 5 detik (5000ms)
    const intervalId = setInterval(checkNewReports, 5000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  // === LOGIC DRAWER BAWAAN ===
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <>
      <Stack direction="row" minHeight="100vh" bgcolor="background.default">
        <Topbar handleDrawerToggle={handleDrawerToggle} />
        <Box
          component="nav"
          sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', lg: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                border: 0,
                backgroundColor: 'background.default',
              },
            }}
          >
            <Sidebar />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', lg: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                border: 0,
                backgroundColor: 'background.default',
              },
            }}
            open
          >
            <Sidebar />
          </Drawer>
        </Box>
        <Toolbar
          sx={{
            pt: 12,
            width: 1,
            pb: 0,
          }}
        >
          {children}
        </Toolbar>
      </Stack>
      <Footer />
    </>
  );
};

export default MainLayout;