import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Stack, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, Chip, Grid, Divider
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignIcon from '@mui/icons-material/Campaign'; 
import SendIcon from '@mui/icons-material/Send';

import api from '../../api'; 
import Swal from 'sweetalert2';
// Ganti import icon lama dengan yang ini
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Panah Bawah
import ExpandLessIcon from '@mui/icons-material/ExpandLess'; // Panah Atas
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';

// === TIPE DATA (Sesuai JSON User & Database) ===

// 1. Tipe untuk Notifikasi Manual (Tabel Bawah)
interface Notifikasi {
    id: number | string;
    judul: string;
    isiPesan: string;
    timestamp?: any;
    updatedAt?: string;
}

// 2. Tipe untuk Insiden (Card Atas)
interface Dokumentasi {
    id: number;
    fileUrl: string;
    tipeFile: string;
}

interface Laporan {
    id: number;
    deskripsi: string;
    Dokumentasis: Dokumentasi[];
}

interface Insiden {
    id: number;
    judulInsiden: string; // Sesuai JSON
    latitude: number;
    longitude: number;
    jenisKejadian: string;
    skalaInsiden: string;
    statusInsiden: string;
    timestampDibuat: string;
    Laporans: Laporan[];
}

const AdminNotifikasi: React.FC = () => {
    // State Data
    const [notifikasiList, setNotifikasiList] = useState<Notifikasi[]>([]);
    const [insidenList, setInsidenList] = useState<Insiden[]>([]); 
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotif, setEditingNotif] = useState<Notifikasi | null>(null);
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

    const [formData, setFormData] = useState({ judul: '', isiPesan: '' });

    // === 1. FETCH DATA ===
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch Notifikasi History
            const resNotif = await api.get('/notifikasi');
            setNotifikasiList(Array.isArray(resNotif.data) ? resNotif.data : []);

            // Fetch Insiden
            try {
                const resInsiden = await api.get('/insiden'); 
                setInsidenList(Array.isArray(resInsiden.data) ? resInsiden.data : []);
            } catch (e) {
                console.log("Gagal load insiden, menggunakan data kosong sementara");
            }

        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError('Gagal memuat data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifikasi = async () => {
        const res = await api.get('/notifikasi');
        setNotifikasiList(res.data);
    }

    // === 2. HANDLERS KHUSUS INSIDEN (PUSH BUTTON) ===
    const handlePushInsiden = async (insiden: Insiden) => {
        Swal.fire({
            title: 'Push Notifikasi Insiden?',
            text: `Akan mengirim notifikasi untuk: "${insiden.judulInsiden}" ke semua user.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1976d2',
            confirmButtonText: 'Ya, Kirim!',
            cancelButtonText: 'Batal',
            customClass: {
                container: 'highest-z-index'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    Swal.fire({ 
                        title: 'Mengirim...', 
                        didOpen: () => Swal.showLoading(),
                        customClass: {
                            container: 'highest-z-index'
                        }
                    });

                    // Mengirim ID Insiden ke API
                    await api.post('/notifikasi/push-insiden', { 
                        id: insiden.id 
                    });

                    Swal.fire({
                        title: 'Terkirim!',
                        text: 'Notifikasi insiden berhasil disebar.',
                        icon: 'success',
                        customClass: {
                            container: 'highest-z-index'
                        }
                    });
                } catch (err: any) {
                    Swal.fire({
                        title: 'Gagal',
                        text: err.response?.data?.message || 'Terjadi kesalahan.',
                        icon: 'error',
                        customClass: {
                            container: 'highest-z-index'
                        }
                    });
                }
            }
        });
    };

    // === 3. HANDLERS FORM STANDARD ===
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = (notif: Notifikasi | null = null) => {
        setEditingNotif(notif);
        setFormData(notif ? { judul: notif.judul, isiPesan: notif.isiPesan } : { judul: '', isiPesan: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsBroadcastModalOpen(false);
        setEditingNotif(null);
    };

    const handleSubmitCrud = async () => {
        if (!formData.judul || !formData.isiPesan) {
            return Swal.fire({
                title: 'Validasi',
                text: 'Isi semua data',
                icon: 'warning',
                customClass: {
                    container: 'highest-z-index'
                }
            });
        }
        try {
            const payload = { judul: formData.judul, isiPesan: formData.isiPesan };
            if (editingNotif) await api.put(`/notifikasi/${editingNotif.id}`, payload);
            else await api.post('/notifikasi', payload);
            
            Swal.fire({
                title: 'Berhasil',
                text: 'Data disimpan',
                icon: 'success',
                customClass: {
                    container: 'highest-z-index'
                }
            });
            handleCloseModal();
            fetchNotifikasi();
        } catch (err: any) {
            Swal.fire({
                title: 'Error',
                text: err.message,
                icon: 'error',
                customClass: {
                    container: 'highest-z-index'
                }
            });
        }
    };

    const handleSendBroadcast = async () => {
        if (!formData.judul || !formData.isiPesan) {
            return Swal.fire({
                title: 'Validasi',
                text: 'Isi semua data',
                icon: 'warning',
                customClass: {
                    container: 'highest-z-index'
                }
            });
        }
        try {
            Swal.fire({ 
                title: 'Mengirim...', 
                didOpen: () => Swal.showLoading(),
                customClass: {
                    container: 'highest-z-index'
                },
            });
            const response = await api.post('/notifikasi/broadcast', { title: formData.judul, body: formData.isiPesan });
            Swal.fire({
                title: 'Terkirim!',
                text: `Sukses: ${response.data.successCount}`,
                icon: 'success',
                customClass: {
                    container: 'highest-z-index'
                }
            });
            handleCloseModal();
        } catch (err: any) {
            Swal.fire({
                title: 'Gagal',
                text: err.message,
                icon: 'error',
                customClass: {
                    container: 'highest-z-index'
                }
            });
        }
    };

    
    // Helper: Format Tanggal (Custom: Jam, Hari Tanggal Bulan Tahun)
    const formatTanggal = (isoString: string) => {
      if (!isoString) return '-';
      const date = new Date(isoString);

      // Array Nama Hari & Bulan (Bahasa Indonesia)
      const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];

      // Ambil komponen waktu
      const dayName = namaHari[date.getDay()];      // Nama Hari (0-6)
      const dayDate = date.getDate();               // Tanggal (1-31)
      const monthName = namaBulan[date.getMonth()]; // Nama Bulan (0-11)
      const year = date.getFullYear();              // Tahun

      // Format jam (HH:mm)
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      // Susun format: "17:00, Sabtu 17 Agustus 2024"
      // Jika Anda ingin huruf kecil semua (sabtu, agustus), ubah menjadi:
      // return `${hours}:${minutes}, ${dayName.toLowerCase()} ${dayDate} ${monthName.toLowerCase()} ${year}`;
      
      return `${hours}:${minutes}, ${dayName} ${dayDate} ${monthName} ${year}`;
    };

    const handleDelete = (id: number | string) => {
        Swal.fire({
            title: 'Hapus?', 
            icon: 'warning', 
            customClass: {
                container: 'highest-z-index'
            },
            showCancelButton: true, 
            confirmButtonText: 'Hapus'
        }).then(async (res) => {
            if (res.isConfirmed) {
                await api.delete(`/notifikasi/${id}`);
                fetchNotifikasi();
                Swal.fire({
                    title: 'Terhapus',
                    text: '',
                    icon: 'success',
                    customClass: {
                        container: 'highest-z-index'
                    }
                });
            }
        })
    };
    // Helper untuk warna status
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Baru': return 'error';
            case 'Investigasi': return 'warning';
            case 'Selesai': return 'success';
            default: return 'default';
        }
    };

    // Komponen Baris Tabel (Accordion)
    const InsidenRow: React.FC<{ insiden: Insiden, index: number, onPush: (insiden: Insiden) => void }> = ({ insiden, index, onPush }) => {
        const [open, setOpen] = React.useState(false);
        // Gunakan string kosong jika env tidak terbaca untuk menghindari error undefined
        const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/uploads';

        return (
            <>
                {/* === BARIS UTAMA (SUMMARY) === */}
                <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: open ? '#f9fafb' : 'inherit' }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        {insiden.judulInsiden}
                    </TableCell>
                    <TableCell>
                        Lat: {insiden.latitude.toFixed(4)}, Long: {insiden.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell>{insiden.jenisKejadian}</TableCell>
                    <TableCell>{insiden.skalaInsiden}</TableCell>
                    <TableCell>
                        <Chip 
                            label={insiden.statusInsiden} 
                            size="small"
                            color={
                                insiden.statusInsiden === 'Baru' ? 'error' : 
                                insiden.statusInsiden === 'Investigasi' ? 'warning' : 'success'
                            }
                            sx={{ fontWeight: 'bold' }}
                        />
                    </TableCell>
                    <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                            {/* Tombol Expand / Collapse (Ganti Icon Disini) */}
                            <IconButton 
                                aria-label="expand row" 
                                size="medium" 
                                onClick={() => setOpen(!open)}
                                color="primary"        
                                sx={{ 
                                    bgcolor: '#fff4ea',
                                    transition: '0.3s'
                                }}
                            >
                                {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Stack>
                    </TableCell>
                </TableRow>

                {/* === BAGIAN DETAIL (EXPANDED) === */}
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 3, border: '1px solid #e5e7eb', borderRadius: 2, p: 3, bgcolor: '#fff' }}>
                                
                                {/* 1. SECTION LAPORAN TERKAIT */}
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" fontWeight="bold">Laporan Terkait</Typography>
                                </Stack>

                                <Grid container spacing={2} mb={4}>
                                    {insiden.Laporans.length > 0 ? insiden.Laporans.map((laporan, idx) => (
                                        <Grid item xs={12} md={6} lg={4} key={laporan.id}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight="bold">Pelapor #{laporan.id}</Typography>
                                                        <Typography variant="caption" color="text.secondary">ID: {laporan.id}</Typography>
                                                    </Box>
                                                </Stack>
                                                
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '60px' }}>
                                                    {laporan.deskripsi}
                                                </Typography>

                                                {/* Thumbnail Gambar Laporan */}
                                                <Stack direction="row" spacing={1}>
                                                    {laporan.Dokumentasis.slice(0, 2).map((dok, i) => (
                                                        <Box 
                                                            key={i}
                                                            component="img"
                                                            src={dok.fileUrl ? `${BASE_API_URL}${dok.fileUrl}` : 'https://via.placeholder.com/60'}
                                                            onError={(e: any) => { e.target.src = 'https://via.placeholder.com/60?text=Error'; }} // Fallback jika gambar error
                                                            sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover', bgcolor: '#f0f0f0' }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                    )) : (
                                        <Grid item xs={12}><Typography color="text.secondary" fontStyle="italic">Belum ada laporan.</Typography></Grid>
                                    )}
                                </Grid>

                                {/* 3. SECTION STATUS INSIDEN & BUTTON PUSH */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        startIcon={<SendIcon />}
                                        onClick={() => onPush(insiden)}
                                        sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 'bold', px: 3 }}
                                    >
                                        Push Notifikasi Insiden
                                    </Button>
                                </Box>

                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </>
        );
    };
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (error) return <Box sx={{ p: 3 }}><Typography color="error">{error}</Typography></Box>;

    return (
        <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea', minHeight: '100vh' }}>


            {/* === BAGIAN 1: TABEL MANAJEMEN NOTIFIKASI MANUAL === */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Riwayat Notifikasi Manual</Typography>
                    <Typography variant="body2" color="text.secondary">Log pengumuman umum (Non-Insiden)</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="warning" startIcon={<CampaignIcon />} onClick={() => handleOpenModal()}>Broadcast Umum</Button>
                </Stack>
            </Stack>

            <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#eee' }}>
                        <TableRow>
                            <TableCell>Judul</TableCell>
                            <TableCell>Isi Pesan</TableCell>
                            <TableCell>Waktu</TableCell>
                            <TableCell align="center">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {notifikasiList.length === 0 ? (
                            <TableRow><TableCell colSpan={4} align="center">Belum ada data.</TableCell></TableRow>
                        ) : (
                            notifikasiList.map((notif) => (
                                <TableRow key={notif.id}>
                                    <TableCell>{notif.judul}</TableCell>
                                    <TableCell>
                                        <Typography 
                                            variant="body2" 
                                            sx={{
                                                display: '-webkit-box',
                                                overflow: 'hidden',
                                                WebkitBoxOrient: 'vertical',
                                                WebkitLineClamp: 2, // Ubah angka ini untuk menentukan jumlah baris yang muncul
                                            }}
                                        >
                                            {notif.isiPesan}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{formatTanggal(notif.timestamp)}</TableCell>
                                    <TableCell align="center">
                                        <Button size="small" onClick={() => handleOpenModal(notif)}><EditIcon /></Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(notif.id)}><DeleteIcon /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Divider sx={{ my: 4, borderBottomWidth: 2 }} />
            {/* === BAGIAN 2: DAFTAR INSIDEN (TABLE ACCORDION) === */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#d32f2f' }}>
                <CampaignIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Insiden Aktif (Dashboard)
            </Typography>

            {insidenList.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f9fa', mb: 6 }}>
                    <Typography color="text.secondary">Tidak ada data insiden aktif saat ini.</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ mb: 6, boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
                    <Table aria-label="collapsible table">
                        <TableHead sx={{ bgcolor: '#fff' }}>
                            <TableRow>
                                <TableCell width="5%" sx={{ fontWeight: 'bold', color: '#374151' }}>No</TableCell>
                                <TableCell width="20%" sx={{ fontWeight: 'bold', color: '#374151' }}>Nama Insiden</TableCell>
                                <TableCell width="20%" sx={{ fontWeight: 'bold', color: '#374151' }}>Lokasi</TableCell>
                                <TableCell width="15%" sx={{ fontWeight: 'bold', color: '#374151' }}>Jenis Kejadian</TableCell>
                                <TableCell width="10%" sx={{ fontWeight: 'bold', color: '#374151' }}>Skala</TableCell>
                                <TableCell width="15%" sx={{ fontWeight: 'bold', color: '#374151' }}>Status</TableCell>
                                <TableCell width="5%" align="center" sx={{ fontWeight: 'bold', color: '#374151' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {insidenList.map((insiden, index) => (
                                <InsidenRow 
                                    key={insiden.id} 
                                    insiden={insiden} 
                                    index={index} 
                                    onPush={handlePushInsiden} 
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Modal CRUD & Broadcast Manual (Kode sama seperti sebelumnya) */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>{editingNotif ? 'Edit' : 'Tambah'} Notifikasi</DialogTitle>
                <DialogContent dividers>
                    <TextField label="Judul" name="judul" fullWidth margin="dense" value={formData.judul} onChange={handleFormChange} />
                    <TextField label="Pesan" name="isiPesan" fullWidth multiline rows={3} margin="dense" value={formData.isiPesan} onChange={handleFormChange} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Batal</Button>
                    <Button variant="contained" color="error" endIcon={<SendIcon />} onClick={handleSubmitCrud}>Kirim</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminNotifikasi;