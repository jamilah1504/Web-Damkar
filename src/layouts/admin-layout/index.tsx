import { PropsWithChildren, ReactElement, useState, useEffect, useRef } from 'react';
import { Box, Drawer, Stack, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import Swal from 'sweetalert2'; 
import api from '../../api'; 

import Sidebar from 'layouts/main-layout/Sidebar/Sidebar';
import Topbar from 'layouts/main-layout/Topbar/Topbar';

export const drawerWidth = 278;

// 1. PERBAIKAN: Sesuaikan Interface dengan JSON Data
interface Report {
  id: number;
  deskripsi: string;      // Sesuai JSON
  jenisKejadian: string;  // Sesuai JSON
  latitude: number;
  longitude: number;
  status: string;
}

const MainLayout = ({ children }: PropsWithChildren): ReactElement => {
  const navigate = useNavigate(); 
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Ref untuk menyimpan ID laporan terakhir
  const lastKnownReportId = useRef<number | null>(null);

  // === LOGIC POLLING LAPORAN BARU (SWAL) ===
  useEffect(() => {
    const checkNewReports = async () => {
      // Cegah polling jika Popup sedang terbuka agar tidak tumpuk
      if (Swal.isVisible()) return;

      try {
        const response = await api.get('/reports'); 
        let reports: Report[] = response.data;

        if (Array.isArray(reports) && reports.length > 0) {
          // Sorting Descending (Terbesar ke Terkecil) agar index 0 selalu yang terbaru
          reports = reports.sort((a, b) => b.id - a.id);
          
          const latestReport = reports[0]; 

          // Logika Pengecekan ID
          if (lastKnownReportId.current === null) {
            lastKnownReportId.current = latestReport.id;
          } else if (latestReport.id > lastKnownReportId.current) {
            
            // Update ID terakhir
            lastKnownReportId.current = latestReport.id;

            // 2. PERBAIKAN: Konfigurasi Popup Tengah & Persisten
            Swal.fire({
              position: 'center',       // POSISI TENGAH
              icon: 'error',            // Icon Error/Warning merah besar
              title: 'LAPORAN DARURAT!',
              html: `
                <div style="text-align: left; font-size: 1rem;">
                  <p><strong>Jenis:</strong> ${latestReport.jenisKejadian}</p>
                  <p><strong>Deskripsi:</strong> ${latestReport.deskripsi}</p>
                  <p><strong>Status:</strong> ${latestReport.status}</p>
                </div>
              `,
              showConfirmButton: true,
              confirmButtonText: 'LIHAT LAPORAN',
              showCancelButton: true,
              cancelButtonText: 'TUTUP',
              
              // KONFIGURASI AGAR TIDAK HILANG OTOMATIS
              timer: undefined,         // Hapus timer
              backdrop: `
                rgba(0,0,123,0.4)
                left top
                no-repeat
              `,
              allowOutsideClick: false, // Tidak bisa tutup klik luar
              allowEscapeKey: false,    // Tidak bisa tutup pakai ESC
              
              background: '#fff',
              iconColor: '#d32f2f', 
              confirmButtonColor: '#d32f2f',
              cancelButtonColor: '#757575',
              customClass: {
                container: 'highest-z-index', 
                popup: 'swal-wide-popup' // Opsional: buat class css jika ingin lebih lebar
              },
              toast: false, // MATIKAN MODE TOAST AGAR JADI MODAL TENGAH
            }).then((result) => {
              
              // === 3. PERBAIKAN: Logic Navigasi & Refresh ===
              if (result.isConfirmed) {
                // Aksi Tombol LIHAT -> Pindah Halaman
                navigate(`/admin/laporan/masuk`); 
              } else {
                // Aksi Tombol TUTUP -> REFRESH HALAMAN
                window.location.reload();
              }
            });
          }
        }
      } catch (error) {
        console.error("Gagal polling laporan:", error);
      }
    };

    // Jalankan pengecekan pertama kali
    checkNewReports();

    // Set Interval: Cek setiap 3 detik (agar lebih responsif)
    const intervalId = setInterval(checkNewReports, 3000);

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
    </>
  );
};

export default MainLayout;