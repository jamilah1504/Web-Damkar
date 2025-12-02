import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Tooltip,
  Grid,
  Chip,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';
import PhoneIcon from '@mui/icons-material/Phone';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import api from '../../api';

interface Jadwal {
  id: number;
  nama_sekolah: string;
  tanggal_kunjungan: string;
  jumlah_siswa: number;
  status: 'pending' | 'approved' | 'rejected';
  pj_sekolah?: string;
  kontak_pj?: string;
  surat_permohonan?: string;
}

const AdminJadwal: React.FC = () => {
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching kunjungan data from /api/kunjungan...');
      const response = await api.get('/kunjungan');
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      // Handle different response formats
      let data = [];
      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        }
      }
      
      console.log('Processed data:', data);
      setJadwalList(data);
    } catch (err: any) {
      console.error('Error fetching jadwal:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Gagal mengambil data jadwal.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Sesi Anda berakhir. Silakan login kembali.';
        } else if (err.response.status === 403) {
          errorMessage = 'Akses ditolak. Hanya untuk Admin.';
        } else if (err.response.status === 404) {
          errorMessage = 'Endpoint tidak ditemukan.';
        } else {
          errorMessage = err.response?.data?.message 
            || err.response?.data?.msg 
            || `Error ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setJadwalList([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      setError(null);
      await api.put(`/kunjungan/${id}/status`, { status: newStatus });
      // Refresh data setelah update
      fetchJadwal();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.msg || 'Gagal memperbarui status.');
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Pending',
      approved: 'Disetujui',
      rejected: 'Ditolak',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: '#ff9800',
      approved: '#4caf50',
      rejected: '#f44336',
    };
    return colorMap[status] || '#757575';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFileUrl = (fileName: string | null | undefined) => {
    if (!fileName) return null;
    // File disimpan di public/uploads/surat dan bisa diakses via /public/uploads/surat/
    return `http://localhost:5000/public/uploads/surat/${fileName}`;
  };

  const getFileExtension = (fileName: string) => {
    if (!fileName) return '';
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const isPdfFile = (fileName: string | null | undefined) => {
    if (!fileName) return false;
    return getFileExtension(fileName) === 'pdf';
  };

  // Helper function to format date to YYYY-MM-DD consistently
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to normalize date string (handle various formats)
  const normalizeDateString = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;
    // If date string is already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    // Try to parse and format
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return formatDateToString(date);
    } catch {
      return null;
    }
  };

  // Get approved jadwal dates (normalized)
  const getApprovedDates = (): string[] => {
    return jadwalList
      .filter((jadwal) => jadwal.status === 'approved')
      .map((jadwal) => normalizeDateString(jadwal.tanggal_kunjungan))
      .filter((date): date is string => date !== null);
  };

  // Check if date has approved jadwal
  const hasApprovedJadwal = (date: Date): boolean => {
    const dateStr = formatDateToString(date);
    const approvedDates = getApprovedDates();
    return approvedDates.includes(dateStr);
  };

  // Get jadwal info for a specific date
  const getJadwalForDate = (date: Date): Jadwal[] => {
    const dateStr = formatDateToString(date);
    return jadwalList.filter((jadwal) => {
      if (jadwal.status !== 'approved') return false;
      const jadwalDate = normalizeDateString(jadwal.tanggal_kunjungan);
      return jadwalDate === dateStr;
    });
  };

  // Calendar functions
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const formatDayName = (dayIndex: number): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex];
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Get upcoming approved jadwal (sorted by date, nearest first)
  const getUpcomingJadwal = (): Jadwal[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return jadwalList
      .filter((jadwal) => {
        if (jadwal.status !== 'approved') return false;
        const jadwalDate = new Date(jadwal.tanggal_kunjungan);
        jadwalDate.setHours(0, 0, 0, 0);
        return jadwalDate >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(a.tanggal_kunjungan).getTime();
        const dateB = new Date(b.tanggal_kunjungan).getTime();
        return dateA - dateB;
      })
      .slice(0, 5); // Limit to 5 nearest
  };

  // Format date with day name
  const formatDateWithDay = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[date.getDay()];
    const formattedDate = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `${dayName}, ${formattedDate}`;
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: '#fff4ea',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Jadwal Edukasi
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manajemen jadwal untuk kegiatan edukasi kepada publik.
      </Typography>

      {/* Calendar and Upcoming Visits Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Calendar Section */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#fff',
              borderRadius: 2,
              boxShadow: 'none',
            }}
          >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon color="primary" />
            Kalender Jadwal Edukasi
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigateMonth('prev')} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
              {formatMonthYear(currentDate)}
            </Typography>
            <IconButton onClick={() => navigateMonth('next')} size="small">
              <ChevronRightIcon />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCurrentDate(new Date())}
            >
              Hari Ini
            </Button>
          </Box>
        </Box>

        {/* Calendar Grid */}
        <Grid container spacing={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
          {/* Day Headers */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
            <Grid
              item
              xs={12 / 7}
              key={dayIndex}
              sx={{
                p: 1,
                textAlign: 'center',
                bgcolor: '#f5f5f5',
                borderRight: dayIndex < 6 ? '1px solid #e0e0e0' : 'none',
                fontWeight: 'bold',
                fontSize: '0.875rem',
              }}
            >
              {formatDayName(dayIndex).substring(0, 3)}
            </Grid>
          ))}

          {/* Calendar Days */}
          {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
            <Grid
              item
              xs={12 / 7}
              key={`empty-${index}`}
              sx={{
                minHeight: 80,
                borderRight: index < 6 ? '1px solid #e0e0e0' : 'none',
                borderBottom: '1px solid #e0e0e0',
              }}
            />
          ))}

          {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
            const day = index + 1;
            // Create date in local timezone (no time component)
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            // Set time to noon to avoid timezone issues
            date.setHours(12, 0, 0, 0);
            const hasJadwal = hasApprovedJadwal(date);
            const jadwalInfo = getJadwalForDate(date);
            const isCurrentDay = isToday(date);

            return (
              <Grid
                item
                xs={12 / 7}
                key={day}
                sx={{
                  minHeight: 80,
                  p: 0.5,
                  borderRight: (index + getFirstDayOfMonth(currentDate)) % 7 < 6 ? '1px solid #e0e0e0' : 'none',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: hasJadwal ? '#e8f5e9' : 'transparent',
                  position: 'relative',
                  '&:hover': {
                    bgcolor: hasJadwal ? '#c8e6c9' : '#f5f5f5',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isCurrentDay ? 'bold' : 'normal',
                      color: isCurrentDay ? 'primary.main' : 'text.primary',
                      mb: 0.5,
                    }}
                  >
                    {day}
                  </Typography>
                  {hasJadwal && (
                    <Box sx={{ width: '100%' }}>
                      {jadwalInfo.map((jadwal, idx) => (
                        <Chip
                          key={idx}
                          label={jadwal.nama_sekolah.length > 15 ? `${jadwal.nama_sekolah.substring(0, 15)}...` : jadwal.nama_sekolah}
                          size="small"
                          color="success"
                          sx={{
                            fontSize: '0.65rem',
                            height: 20,
                            mb: 0.5,
                            width: '100%',
                            '& .MuiChip-label': {
                              px: 0.5,
                            },
                          }}
                          title={jadwal.nama_sekolah}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: '#e8f5e9',
                border: '1px solid #c8e6c9',
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption">Tanggal dengan jadwal edukasi</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: 'primary.main',
                borderRadius: '50%',
              }}
            />
            <Typography variant="caption">Hari ini</Typography>
          </Box>
        </Box>
      </Paper>
        </Grid>

        {/* Upcoming Visits Section */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#fff',
              borderRadius: 2,
              boxShadow: 'none',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Kunjungan Terdekat
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {getUpcomingJadwal().length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Tidak ada kunjungan terdekat
                </Typography>
              ) : (
                getUpcomingJadwal().map((jadwal) => (
                  <Paper
                    key={jadwal.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: '#f9f9f9',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {jadwal.nama_sekolah}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {jadwal.pj_sekolah || '-'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {jadwal.kontak_pj || '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {jadwal.jumlah_siswa} peserta
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        pt: 1.5,
                        borderTop: '1px solid #e0e0e0',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {formatDateWithDay(jadwal.tanggal_kunjungan)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          13:00 - 16:00
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={() => setError(null)}
          action={
            <Button 
              size="small" 
              onClick={() => {
                console.log('Retrying fetch...');
                fetchJadwal();
              }}
            >
              Coba Lagi
            </Button>
          }
        >
          <Typography variant="body2" component="div">
            <strong>Error:</strong> {error}
          </Typography>
          <Typography variant="caption" component="div" sx={{ mt: 1, opacity: 0.8 }}>
            Periksa console browser untuk detail lebih lanjut.
          </Typography>
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            boxShadow: 'none',
            width: '100%',
          }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="tabel jadwal edukasi">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: '#fff' } }}>
                <TableCell>Nama Sekolah/Instansi</TableCell>
                <TableCell align="center">Tanggal Kunjungan</TableCell>
                <TableCell align="center">Jumlah Peserta</TableCell>
                <TableCell align="center">Penanggung Jawab</TableCell>
                <TableCell align="center">Surat Permohonan</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jadwalList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tidak ada data kunjungan edukasi
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                jadwalList.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: '#fff4ea' },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {row.nama_sekolah}
                    </TableCell>
                    <TableCell align="center">{formatDate(row.tanggal_kunjungan)}</TableCell>
                    <TableCell align="center">{row.jumlah_siswa}</TableCell>
                    <TableCell align="center">
                      {row.pj_sekolah || '-'}
                      {row.kontak_pj && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {row.kontak_pj}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {row.surat_permohonan ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                          <Tooltip title="Lihat Surat">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                const fileUrl = getFileUrl(row.surat_permohonan);
                                if (fileUrl) {
                                  if (isPdfFile(row.surat_permohonan)) {
                                    // Buka PDF di tab baru
                                    window.open(fileUrl, '_blank');
                                  } else {
                                    // Untuk file non-PDF, unduh langsung
                                    window.open(fileUrl, '_blank');
                                  }
                                }
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Unduh Surat">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                const fileUrl = getFileUrl(row.surat_permohonan);
                                if (fileUrl) {
                                  const link = document.createElement('a');
                                  link.href = fileUrl;
                                  link.download = row.surat_permohonan || 'surat_permohonan';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={row.surat_permohonan}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, maxWidth: 150 }}>
                              <DescriptionIcon fontSize="small" color="action" />
                              <Typography
                                variant="caption"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {row.surat_permohonan.length > 20
                                  ? `${row.surat_permohonan.substring(0, 20)}...`
                                  : row.surat_permohonan}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Tidak ada file
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          color: getStatusColor(row.status),
                          fontWeight: 'bold',
                        }}
                      >
                        {getStatusLabel(row.status)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Ubah Status</InputLabel>
                        <Select
                          value={row.status}
                          label="Ubah Status"
                          onChange={(e) => updateStatus(row.id, e.target.value as 'pending' | 'approved' | 'rejected')}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Disetujui</MenuItem>
                          <MenuItem value="rejected">Ditolak</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminJadwal;
