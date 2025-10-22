import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Stack,
  Modal,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Alert,
  Link, // Pastikan Link diimpor dari MUI
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
// import IconifyIcon from 'components/base/IconifyIcon'; // Dihapus/diabaikan karena tidak ada definisi

// Sesuaikan baseURL agar sesuai dengan port backend
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Port 5000
});

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

interface EdukasiItem {
  id: number;
  judul: string;
  isiKonten: string;
  kategori: string;
  fileUrl: string | null;
  timestampDibuat: string;
}

const KATEGORI_OPTIONS = ['Kebakaran', 'Non-Kebakaran', 'Tips Keselamatan Lain'];

const AdminEdukasi: React.FC = () => {
  const [edukasiList, setEdukasiList] = useState<EdukasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<EdukasiItem | null>(null);
  const [formData, setFormData] = useState({ judul: '', isiKonten: '', kategori: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<EdukasiItem | null>(null);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchEdukasi = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/edukasi');
      setEdukasiList(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil data edukasi:', error);
      setError('Gagal mengambil data dari server. Pastikan backend berjalan di port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdukasi();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentItem(null);
    setFormData({ judul: '', isiKonten: '', kategori: '' });
    setSelectedFile(null);
    setError('');
    setOpenModal(true);
  };

  const handleOpenEditModal = (item: EdukasiItem) => {
    setCurrentItem(item);
    setFormData({ judul: item.judul, isiKonten: item.isiKonten, kategori: item.kategori });
    setSelectedFile(null);
    setError('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentItem(null);
    setSelectedFile(null);
    setError('');
    setFormData({ judul: '', isiKonten: '', kategori: '' });
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    const submissionData = new FormData();
    submissionData.append('judul', formData.judul);
    submissionData.append('isiKonten', formData.isiKonten);
    submissionData.append('kategori', formData.kategori);

    if (selectedFile) {
      submissionData.append('file', selectedFile); // Kunci 'file' harus sesuai dengan Multer di backend
    } else if (currentItem && currentItem.fileUrl && !selectedFile) {
      // Jika edit dan tidak ada file baru diupload, kirim fileUrl yang sudah ada (biar backend tahu file tidak dihapus)
      // Atau jika file dihapus (logika lebih kompleks untuk frontend), kita bisa kirim null/string khusus.
      // Untuk saat ini, jika tidak ada file baru, kita tidak kirim 'file' key
      // submissionData.append('fileUrl', currentItem.fileUrl);
    } else if (currentItem && !currentItem.fileUrl && !selectedFile) {
      // Jika sebelumnya tidak ada file dan sekarang juga tidak ada, kirim string kosong
      submissionData.append('fileUrl', '');
    }

    try {
      if (currentItem) {
        await apiClient.put(`/edukasi/${currentItem.id}`, submissionData, {
          // Headers 'Content-Type': 'multipart/form-data' TIDAK perlu disetel manual di Axios
          // saat menggunakan FormData, Axios akan menanganinya dengan benar
        });
      } else {
        await apiClient.post('/edukasi', submissionData, {
          // Sama seperti di atas
        });
      }
      fetchEdukasi();
      handleCloseModal();
    } catch (error: any) {
      console.error('Gagal menyimpan data:', error);
      setError(error.response?.data?.message || 'Gagal menyimpan data ke server.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try {
      await apiClient.delete(`/edukasi/${id}`);
      fetchEdukasi();
      setConfirmDelete(null);
    } catch (error: any) {
      console.error('Gagal menghapus data:', error);
      setError(error.response?.data?.message || 'Gagal menghapus data dari server.');
      setConfirmDelete(null);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#fef4ea', flexGrow: 1, minHeight: '100vh' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Manajemen Konten Edukasi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kelola artikel dan informasi pemadam kebakaran.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
          Buat Konten Baru
        </Button>
      </Stack>

      {/* Tampilkan error global jika ada */}
      {error && !openModal && !confirmDelete && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
              <TableCell>Judul</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Dibuat</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {edukasiList.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{row.judul}</TableCell>
                <TableCell>{row.kategori}</TableCell>
                <TableCell>
                  {row.fileUrl ? (
                    <Link
                      href={row.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: 'none' }}
                    >
                      <Button size="small">Lihat File</Button>
                    </Link>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{formatDate(row.timestampDibuat)}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleOpenEditModal(row)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => setConfirmDelete(row)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {edukasiList.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  Belum ada data edukasi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Add/Edit */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={3}>
            {currentItem ? 'Edit Konten' : 'Buat Konten Baru'}
          </Typography>
          <form onSubmit={handleFormSubmit}>
            <Stack spacing={2}>
              {error && openModal && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Judul"
                name="judul"
                value={formData.judul}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Isi Konten"
                name="isiKonten"
                value={formData.isiKonten}
                onChange={handleFormChange}
                fullWidth
                required
                multiline
                rows={4}
              />
              <FormControl fullWidth required>
                <InputLabel id="kategori-label">Kategori</InputLabel>
                <Select
                  labelId="kategori-label"
                  name="kategori"
                  value={formData.kategori}
                  label="Kategori"
                  onChange={handleFormChange}
                >
                  <MenuItem value="">
                    <em>Pilih Kategori</em>
                  </MenuItem>
                  {KATEGORI_OPTIONS.map((k) => (
                    <MenuItem key={k} value={k}>
                      {k}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* File Upload Section */}
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  fullWidth
                >
                  {selectedFile
                    ? selectedFile.name
                    : currentItem?.fileUrl
                    ? 'Ganti File Lampiran'
                    : 'Unggah File Lampiran'}
                  <input type="file" hidden onChange={handleFileChange} name="file" />
                </Button>

                {currentItem?.fileUrl && !selectedFile && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="caption">
                      File saat ini:{' '}
                      <Link href={currentItem.fileUrl} target="_blank" rel="noopener noreferrer">
                        Lihat
                      </Link>
                    </Typography>
                    {/* Opsional: Tombol hapus file yang sudah ada (untuk edit) */}
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        // Mengatur fileUrl di currentItem menjadi null menandakan penghapusan file lama di backend
                        setCurrentItem({ ...currentItem, fileUrl: null });
                        setSelectedFile(null);
                      }}
                    >
                      Hapus File
                    </Button>
                  </Stack>
                )}

                {!currentItem?.fileUrl && !selectedFile && (
                  <Typography variant="caption" color="text.secondary" mt={1}>
                    File (gambar/PDF) opsional, maks 5MB.
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleCloseModal} disabled={formLoading}>
                  Batal
                </Button>
                <Button type="submit" variant="contained" disabled={formLoading}>
                  {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Simpan'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
        <Box sx={{ ...modalStyle, width: 400 }}>
          <Typography variant="h6" component="h2">
            Konfirmasi Hapus
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Yakin ingin menghapus **"{confirmDelete?.judul}"**?
          </Typography>
          <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => setConfirmDelete(null)}>
              Batal
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDelete(confirmDelete!.id)}
            >
              Ya, Hapus
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminEdukasi;
