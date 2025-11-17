// src/pages/admin/laporan/LaporanMasuk.tsx (Lengkap: Hapus, Detail, Tambah Laporan Lengkap)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Collapse,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Modal,
  Fade,
  Backdrop,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  UploadFile as UploadFileIcon, // <-- Pastikan ini diimpor
} from '@mui/icons-material';

// --- (1) TIPE DATA (SUDAH DIPERBAIKI) ---
interface IUserSimple {
  id: number;
  name: string;
  email?: string;
  pangkat?: string;
  nomorInduk?: string;
}

interface IDokumentasi {
  id: number;
  fileUrl: string;
  tipeFile: 'Gambar' | 'Video';
}
interface ILaporan {
  id: number;
  deskripsi: string;
  namaPelapor: string; // <-- Tambahkan ini
  alamatKejadian: string; // <-- Tambahkan ini
  Pelapor: IUserSimple | null; // User yang login (bisa null)
  Dokumentasis?: IDokumentasi[];
}
interface ITugas {
  id: number;
  PetugasDitugaskan: IUserSimple[];
}
interface IInsidenData {
  id: number;
  judulInsiden: string;
  lokasi: string;
  jenisKejadian: string;
  skalaInsiden: string;
  statusInsiden: string;
  Laporans: ILaporan[]; 
  Tugas?: ITugas; 
  latitude: number; 
  longitude: number;
}

// --- Style untuk Modal ---
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

// --- Props untuk Row ---
interface RowProps {
  row: IInsidenData;
  index: number;
  onEditStatusClick: (insiden: IInsidenData) => void;
  fetchData: () => void;
  onLihatDetailClick: (laporan: ILaporan) => void;
  onTambahLaporanClick: (insidenId: number) => void;
}

// --- Komponen Baris (Row) ---
function Row(props: RowProps) {
  const { 
    row,
    index, 
    onEditStatusClick, 
    fetchData, 
    onLihatDetailClick, 
    onTambahLaporanClick 
  } = props;
  const [open, setOpen] = useState(false);

  // Fungsi Hapus Laporan
  const handleHapusLaporan = async (laporanId: number) => {
    if (!window.confirm("Anda yakin ingin menghapus laporan ini?")) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/${laporanId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Gagal menghapus laporan');
      }
      alert('Laporan berhasil dihapus');
      fetchData(); 
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  // Fungsi Lihat Detail
  const handleLihatDetail = (laporan: ILaporan) => {
    onLihatDetailClick(laporan); 
  };

  // Fungsi Tambah Petugas (WIP)
  const handleTambahPetugas = () => {
    alert(`(WIP) Buka Modal Tambah Petugas untuk Insiden ID: ${row.id}`);
  };

  return (
    <React.Fragment>
      {/* Baris utama */}
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>{index +1}</TableCell>
        <TableCell component="th" scope="row">{row.judulInsiden}</TableCell>
        
        {/* --- (2) LOKASI (SUDAH DIPERBAIKI) --- */}
        <TableCell>
          {row.latitude && row.longitude 
            ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
            : (row.lokasi || 'Lokasi tidak ada')
          }
        </TableCell>

        <TableCell>{row.jenisKejadian}</TableCell>
        <TableCell>{row.skalaInsiden}</TableCell>
        <TableCell>
          <Chip 
            label={row.statusInsiden} 
            color={row.statusInsiden === 'Penanganan' ? 'warning' : (row.statusInsiden === 'Selesai' ? 'success' : 'default')} 
            size="small" 
          />
        </TableCell>
        <TableCell align="center">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Baris tersembunyi (collapsible content) */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, padding: 2, backgroundColor: '#fafafa', borderRadius: 2 }}>
              
              {/* --- Laporan Terkait --- */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Laporan Terkait</Typography>
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<AddIcon />} 
                  sx={{ textTransform: 'none' }} 
                  onClick={() => onTambahLaporanClick(row.id)}
                >
                  Tambah Laporan Terkait
                </Button>
              </Box>
              <Grid container spacing={2}>
                {row.Laporans?.length > 0 ? (
                  row.Laporans.map((laporan) => (
                    <Grid item xs={12} sm={6} md={4} key={laporan.id}>
                      <Card sx={{ display: 'flex', height: '100%' }}>
                        
                        {/* --- (BARU) LOGIKA UNTUK GAMBAR / VIDEO THUMBNAIL --- */}
                        { (laporan.Dokumentasis && laporan.Dokumentasis.length > 0) ? (
                          // Cek jika file pertama adalah Gambar
                          laporan.Dokumentasis[0].tipeFile === 'Gambar' ? (
                            <CardMedia
                              component="img"
                              sx={{ width: 120, objectFit: 'cover' }}
                              image={`http://localhost:5000${laporan.Dokumentasis[0].fileUrl}`}
                              alt="Foto Insiden"
                            />
                          ) : (
                            // Jika bukan gambar (berarti Video)
                            <CardMedia
                              component="video"
                              sx={{ width: 120, objectFit: 'cover', bgcolor: 'black' }}
                              // Ambil frame dari 0.5 detik pertama sebagai thumbnail
                              src={`http://localhost:5000${laporan.Dokumentasis[0].fileUrl}#t=0.5`}
                              // Minta browser hanya load metadata (info/thumbnail)
                              preload="metadata"
                            />
                          )
                        ) : (
                          // Jika tidak ada dokumentasi sama sekali
                          <CardMedia
                            component="img"
                            sx={{ width: 120, objectFit: 'cover' }}
                            image={"https://via.placeholder.com/150"}
                            alt="Foto Insiden"
                          />
                        )}
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
                          <CardContent sx={{ pb: 1 }}>
                            <Typography component="div" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {laporan.namaPelapor || (laporan.Pelapor?.name || 'Pelapor Anonim')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              {laporan.Pelapor?.email || 'Tidak ada email'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{laporan.deskripsi.substring(0, 50)}...</Typography>
                          </CardContent>
                          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" sx={{ color: 'red' }} onClick={() => handleHapusLaporan(laporan.id)}>
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleLihatDetail(laporan)}>
                              <VisibilityIcon fontSize="inherit" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      Belum ada laporan terkait untuk insiden ini.
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* --- Petugas Terkait --- */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
                <Typography variant="h6">Petugas Terkait</Typography>
                <Button variant="contained" color="error" startIcon={<AddIcon />} sx={{ textTransform: 'none' }} onClick={handleTambahPetugas}>
                  Tambah Petugas
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {row.Tugas?.PetugasDitugaskan?.length > 0 ? (
                  row.Tugas.PetugasDitugaskan.map((petugas) => (
                    <Chip
                      key={petugas.id}
                      label={`${petugas.name} - ${petugas.pangkat || 'Petugas'}`}
                      onDelete={() => { alert(`WIP: Hapus Petugas ID: ${petugas.id}`) }}
                      deleteIcon={<DeleteIcon />}
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Belum ada petugas ditugaskan.
                  </Typography>
                )}
              </Box>

              {/* --- Status Insiden --- */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Status Insiden</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip label={row.statusInsiden} color={row.statusInsiden === 'Penanganan' ? 'warning' : (row.statusInsiden === 'Selesai' ? 'success' : 'default')} />
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />} 
                    sx={{ textTransform: 'none' }}
                    onClick={() => onEditStatusClick(row)}
                  >
                    Edit Status
                  </Button>
                </Box>
              </Box>
              
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// --- Komponen Utama (Page) ---
const AdminLaporanMasuk: React.FC = () => {
  // --- State ---
  const [dataInsiden, setDataInsiden] = useState<IInsidenData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Status
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [currentInsiden, setCurrentInsiden] = useState<IInsidenData | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  // Modal Detail
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<ILaporan | null>(null);

  // --- (2) STATE MODAL TAMBAH LAPORAN DIPERBARUI ---
  const [tambahLaporanModalOpen, setTambahLaporanModalOpen] = useState(false);
  const [selectedInsidenId, setSelectedInsidenId] = useState<number | null>(null);
  // State untuk form
  const [laporanForm, setLaporanForm] = useState({
    namaPelapor: '',
    alamatKejadian: '',
    deskripsi: '',
  });
  // State untuk file
  const [laporanFiles, setLaporanFiles] = useState<File[]>([]);


  // --- Fungsi Fetch Data ---
  const fetchData = async () => {
    try {
      setLoading(true); 
      setError(null);
      const response = await fetch('http://localhost:5000/api/insiden/manajemen-laporan', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: IInsidenData[] = await response.json();
      setDataInsiden(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
  }, []); 

  // --- Handlers Modal Status ---
  const handleOpenStatusModal = (insiden: IInsidenData) => {
    setCurrentInsiden(insiden); 
    setNewStatus(insiden.statusInsiden); 
    setStatusModalOpen(true); 
  };
  const handleCloseStatusModal = () => {
    setStatusModalOpen(false);
    setCurrentInsiden(null);
    setIsSubmitting(false);
  };
  const handleSubmitStatus = async () => {
    if (!currentInsiden || !newStatus) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/insiden/${currentInsiden.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ statusInsiden: newStatus })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal memperbarui status');
      }
      handleCloseStatusModal();
      await fetchData(); 
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message); 
      setIsSubmitting(false);
    }
  };

  // --- Handlers Modal Detail Laporan ---
  const handleOpenDetailModal = (laporan: ILaporan) => {
    setSelectedLaporan(laporan);
    setDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedLaporan(null);
  };

  // --- (3) HANDLER MODAL TAMBAH LAPORAN DIPERBARUI ---
  const handleOpenTambahLaporanModal = (insidenId: number) => {
    setSelectedInsidenId(insidenId);
    // Reset form
    setLaporanForm({ namaPelapor: '', alamatKejadian: '', deskripsi: '' });
    setLaporanFiles([]);
    setTambahLaporanModalOpen(true);
  };
  const handleCloseTambahLaporanModal = () => {
    setTambahLaporanModalOpen(false);
    setSelectedInsidenId(null);
    setIsSubmitting(false);
  };
  
  // Handler untuk perubahan input form
  const handleLaporanFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLaporanForm(prev => ({ ...prev, [name]: value }));
  };
  // Handler untuk perubahan file
  const handleLaporanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setLaporanFiles(Array.from(e.target.files));
    }
  };

  // Handler untuk submit form (POST Laporan Baru)
  const handleSubmitTambahLaporan = async () => {
    if (!selectedInsidenId || !laporanForm.namaPelapor || !laporanForm.alamatKejadian || !laporanForm.deskripsi) {
      alert("Semua field (Nama Pelapor, Alamat, Deskripsi) tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);

    // Kita harus kirim sebagai FormData karena ada file
    const formData = new FormData();
    formData.append('insidenId', String(selectedInsidenId));
    formData.append('namaPelapor', laporanForm.namaPelapor);
    formData.append('alamatKejadian', laporanForm.alamatKejadian);
    formData.append('deskripsi', laporanForm.deskripsi);
    
    // Tambahkan file ke FormData
    if (laporanFiles.length > 0) {
      for (const file of laporanFiles) {
        // 'dokumen' harus cocok dengan backend upload.array('dokumen', 5)
        formData.append('dokumen', file); 
      }
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reports/terkait`, {
        method: 'POST',
        headers: {
          // HAPUS 'Content-Type', FormData akan mengaturnya
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData // Kirim FormData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal menambah laporan');
      }
      
      handleCloseTambahLaporanModal();
      await fetchData(); // Refresh data

    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- Tampilan Loading & Error ---
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Memuat data manajemen laporan...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">Gagal Memuat Data</Typography>
        <Typography color="error.secondary">{error}</Typography>
        <Button variant="contained" onClick={fetchData} sx={{ mt: 2 }}>
          Coba Lagi
        </Button>
      </Box>
    );
  }

  // --- Tampilan Utama ---
  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#f5f5f5' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Manajemen Laporan Masuk
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table aria-label="collapsible table">
          <TableHead sx={{ bgcolor: '#f9f9f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nama Insiden</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Jenis Kejadian</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Skala Insiden</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataInsiden.map((row, index) => (
              <Row 
                key={row.id} 
                row={row}
                index={index} 
                onEditStatusClick={handleOpenStatusModal}
                fetchData={fetchData} 
                onLihatDetailClick={handleOpenDetailModal}
                onTambahLaporanClick={handleOpenTambahLaporanModal} 
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- Modal Edit Status --- */}
      <Modal open={statusModalOpen} onClose={handleCloseStatusModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }} >
        <Fade in={statusModalOpen}>
          <Box sx={modalStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Ubah Status Insiden
              </Typography>
              <IconButton onClick={handleCloseStatusModal}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography variant="body1" gutterBottom>
              Insiden: <span style={{ fontWeight: 'bold' }}>{currentInsiden?.judulInsiden}</span>
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={newStatus}
                label="Status"
                onChange={(e: SelectChangeEvent) => setNewStatus(e.target.value)}
              >
                <MenuItem value="Investigasi">Investigasi</MenuItem>
                <MenuItem value="Penanganan">Penanganan</MenuItem>
                <MenuItem value="Selesai">Selesai</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit" fullWidth variant="contained" color="primary"
              disabled={isSubmitting} sx={{ mt: 3, mb: 2 }}
              onClick={handleSubmitStatus}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Simpan Perubahan'}
            </Button>
          </Box>
        </Fade>
      </Modal>

      {/* --- Modal Detail Laporan (SUDAH DIPERBAIKI) --- */}
      <Modal open={detailModalOpen} onClose={handleCloseDetailModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }} >
        <Fade in={detailModalOpen}>
          <Box sx={modalStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Detail Laporan
              </Typography>
              <IconButton onClick={handleCloseDetailModal}>
                <CloseIcon />
              </IconButton>
            </Stack>
            
            {selectedLaporan && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Pelapor:</strong> {selectedLaporan.namaPelapor || (selectedLaporan.Pelapor?.name || 'Pelapor Anonim')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {selectedLaporan.Pelapor?.email || 'Tidak ada email'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Alamat:</strong> {selectedLaporan.alamatKejadian || 'Tidak ada alamat'}
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                  <strong>Deskripsi:</strong>
                </Typography>
                
                {/* INI TAG YANG SEBELUMNYA RUSAK */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', maxHeight: 200, overflowY: 'auto' }}>
                  {selectedLaporan.deskripsi}
                </Paper> 
                {/* ^^^ Tag penutup /Paper sekarang sudah ada */}

                <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                  <strong>Dokumentasi:</strong>
                </Typography>
                
                {/* KODE INI SUDAH BERSIH DARI KARAKTER '_' */}
                <Box 
                  sx={{ 
                    maxHeight: '30vh',
                    overflowY: 'auto',
                    bgcolor: '#f9f9f9',
                    p: 1, 
                    borderRadius: 1 
                  }}
                >
                  {(selectedLaporan.Dokumentasis && selectedLaporan.Dokumentasis.length > 0) ? (
                    selectedLaporan.Dokumentasis.map((doc) => (
                      <Box key={doc.id} sx={{ mb: 1.5 }}>
                        {doc.tipeFile === 'Gambar' ? (
                          <CardMedia
                            component="img"
                            sx={{ width: '100%', borderRadius: 1 }}
                            image={`http://localhost:5000${doc.fileUrl}`}
                            alt="Dokumentasi Laporan"
                          />
                        ) : (
                          <CardMedia
                            component="video"
                            sx={{ width: '100%', borderRadius: 1 }} // <-- Lebar 100%
                            src={`http://localhost:5000${doc.fileUrl}`} // <-- Ganti ke doc.fileUrl
                            controls // <-- Tambahkan 'controls' agar bisa di-play
                            preload='metadata'
                          />
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      Tidak ada dokumentasi terlampir.
                    </Typography>
                  )}
                </Box>
           </Box>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* --- (7) MODAL TAMBAH LAPORAN (DIPERBARUI TOTAL) --- */}
      <Modal
        open={tambahLaporanModalOpen}
        onClose={handleCloseTambahLaporanModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={tambahLaporanModalOpen}>
          <Box sx={modalStyle} component="form" onSubmit={(e) => {
            e.preventDefault();
            handleSubmitTambahLaporan();
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Tambah Laporan Terkait
              </Typography>
              <IconButton onClick={handleCloseTambahLaporanModal}>
                <CloseIcon />
              </IconButton>
            </Stack>
            
            <TextField
              label="Nama Pelapor"
              name="namaPelapor"
              fullWidth
              required
              autoFocus
              value={laporanForm.namaPelapor}
              onChange={handleLaporanFormChange}
              sx={{ mt: 1 }}
            />

            <TextField
              label="Alamat Kejadian (Detail)"
              name="alamatKejadian"
              multiline
              rows={3}
              fullWidth
              required
              value={laporanForm.alamatKejadian}
              onChange={handleLaporanFormChange}
              sx={{ mt: 2 }}
            />
            
            <TextField
              label="Detail Kejadian / Deskripsi"
              name="deskripsi"
              multiline
              rows={4}
              fullWidth
              required
              value={laporanForm.deskripsi}
              onChange={handleLaporanFormChange}
              sx={{ mt: 2 }}
            />

            <Button
              variant="outlined"
              component="label" 
              fullWidth
              startIcon={<UploadFileIcon />}
              sx={{ mt: 2 }}
            >
              {laporanFiles.length === 0 
                ? 'Upload Dokumen (Maks 5)'
                : `${laporanFiles.length} file dipilih`
              }
              <input
                type="file"
                hidden
                multiple
                accept="image/png, image/jpeg, image/jpg, video/mp4"
                onChange={handleLaporanFileChange}
              />
            </Button>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="error"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Simpan Laporan'}
            </Button>
          </Box>
        </Fade>
      </Modal>

    </Box>
  );
};

export default AdminLaporanMasuk;