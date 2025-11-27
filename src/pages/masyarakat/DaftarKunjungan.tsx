import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import axios from 'axios';
import NotificationPopup from '../../components/NotificationPopup';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';

// --- 1. HELPER FUNCTIONS (AGAR TANGGAL KONSISTEN) ---

// Format date object ke string 'YYYY-MM-DD'
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Normalisasi string dari database (menangani format ISO dan Timezone)
const normalizeDateString = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null;
  
  // Jika format sudah YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Jika format ISO (ada 'T'), ambil bagian depannya saja
  if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
  }

  // Fallback parsing manual
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return formatDateToString(date);
  } catch {
    return null;
  }
};

// Format tanggal untuk tampilan UI (Bahasa Indonesia)
const formatDateToIndonesian = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  };
  return new Intl.DateTimeFormat('id-ID', options).format(date);
};

// Interface Data dari Database
interface Jadwal {
  id: number;
  nama_sekolah: string;
  tanggal_kunjungan: string;
  jumlah_siswa: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface FormDataState {
  namaSekolah: string;
  jumlahSiswa: string;
  tanggal: string;
  pjSekolah: string;
  kontakPj: string;
}

interface MediaPreviewProps {
  file: File;
  onRemove: () => void;
}

type NotificationStatus = 'success' | 'error' | 'pending' | null;

const MediaPreview: React.FC<MediaPreviewProps> = ({ file, onRemove }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#f8fafc',
      padding: '6px 12px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      fontSize: '0.875rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflow: 'hidden',
        flex: 1
      }}>
        <FileText size={16} color="#4b5563" />
        <span style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '200px'
        }}>
          {file.name}
        </span>
      </div>
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          borderRadius: '4px',
          color: '#ef4444',
          ':hover': {
            backgroundColor: '#fee2e2'
          }
        }}
        aria-label="Hapus file"
        type="button"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const DaftarKunjungan: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // State menyimpan seluruh data jadwal
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  
  const [formData, setFormData] = useState<FormDataState>({
    namaSekolah: '',
    jumlahSiswa: '',
    tanggal: '',
    pjSekolah: '',
    kontakPj: ''
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    status: NotificationStatus;
    message: string;
  }>({ status: null, message: '' });

  // --- 2. FETCH DATA DARI DATABASE ---
  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const token = localStorage.getItem('token');
        // Jika tidak ada token, jangan fetch (nanti dihandle saat submit)
        if (!token) return;

        console.log('Fetching kunjungan data...');
        
        // Request dengan Authorization Header
        const response = await axios.get('http://localhost:5000/api/kunjungan', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        let data = [];
        if (response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            data = response.data.data;
          } else if (Array.isArray(response.data)) {
            data = response.data;
          }
        }
        
        console.log('Data Kunjungan Berhasil Dimuat:', data);
        setJadwalList(data);
      } catch (err: any) {
        console.error('Error fetching jadwal:', err);
        // Jika 403, berarti backend masih memblokir akses (Langkah 1 belum dilakukan)
        if (err.response && err.response.status === 403) {
            console.warn("PERINGATAN: Backend menolak akses (403). Pastikan middleware 'adminOnly' dihapus dari route GET /kunjungan");
        }
      }
    };

    fetchJadwal();
  }, []);

  // --- 3. LOGIKA KALENDER ---

  // Filter jadwal untuk tanggal tertentu (Hanya Approved)
  const getJadwalForDate = (date: Date): Jadwal[] => {
    const dateStr = formatDateToString(date);
    return jadwalList.filter((jadwal) => {
      if (jadwal.status !== 'approved') return false;
      const jadwalDate = normalizeDateString(jadwal.tanggal_kunjungan);
      return jadwalDate === dateStr;
    });
  };

  // Navigasi Kalender
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // --- 4. INTERAKSI FORM ---
  const handleDateSelect = (date: Date) => {
    const schedules = getJadwalForDate(date);
    // Jika ada jadwal approved, blokir klik
    if (schedules.length > 0) return;

    setFormData(prev => ({
      ...prev,
      tanggal: formatDateToString(date)
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setMediaFiles(prev => [...prev, ...newFiles]);
    }
    if (e.target) e.target.value = '';
  };

  const openFilePicker = (options: { accept: string }) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = options.accept;
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        setNotification({
            status: 'error',
            message: 'Anda belum login. Silakan login terlebih dahulu.',
        });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (!formData.namaSekolah || !formData.jumlahSiswa || !formData.tanggal || !formData.pjSekolah || !formData.kontakPj) {
        throw new Error('Harap lengkapi semua data yang diperlukan');
      }

      // Validasi: Cek lagi apakah tanggal sudah penuh (client-side check)
      const schedules = getJadwalForDate(new Date(formData.tanggal));
      if (schedules.length > 0) {
         throw new Error('Maaf, tanggal yang dipilih sudah penuh. Silakan pilih tanggal lain.');
      }

      if (mediaFiles.length === 0) {
        throw new Error('Wajib mengupload Surat Permohonan (PDF/Word)!');
      }
      
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.kontakPj)) {
        throw new Error('Format nomor telepon tidak valid. Gunakan 10-15 digit angka.');
      }

      const dataToSend = new FormData();
      dataToSend.append('namaSekolah', formData.namaSekolah);
      dataToSend.append('jumlahSiswa', formData.jumlahSiswa);
      dataToSend.append('tanggal', formData.tanggal);
      dataToSend.append('pjSekolah', formData.pjSekolah);
      dataToSend.append('kontakPj', formData.kontakPj);

      mediaFiles.forEach((file) => {
        dataToSend.append('suratFiles', file); 
      });

      const response = await axios.post('http://localhost:5000/api/kunjungan', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setNotification({
        status: 'success',
        message: response.data.msg || 'Pendaftaran kunjungan berhasil diajukan!'
      });

      setFormData({
        namaSekolah: '',
        jumlahSiswa: '',
        tanggal: '',
        pjSekolah: '',
        kontakPj: ''
      });
      setMediaFiles([]);
      
    } catch (error: any) {
      console.error('Gagal mengajukan pendaftaran:', error);
      let errorMessage = 'Terjadi kesalahan saat mengajukan pendaftaran';
      
      if (error.response && error.response.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
          setTimeout(() => navigate('/login'), 2000);
      } else if (error.response && error.response.data && error.response.data.msg) {
        errorMessage = error.response.data.msg;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setNotification({
        status: 'error',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ status: null, message: '' });
  };

  return (
    <main className="laporan-form-container">
      {notification.status && (
        <NotificationPopup
          status={notification.status}
          message={notification.message}
          onClose={handleCloseNotification}
        />
      )}

      <div className="title-bar">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button" 
          disabled={isSubmitting}
          type="button"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="page-title">Daftar Kunjungan</h2>
      </div>

      <div style={{
        display: 'flex',
        gap: '24px',
        marginTop: '16px',
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}>
        {/* --- KALENDER --- */}
        <div className="calendar-section" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '350px',
          height: 'fit-content',
          position: 'sticky',
          top: '20px'
        }}>
        <h3 style={{
          margin: '0 0 12px 0',
          color: '#ef4444',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <CalendarIcon size={18} />
          Jadwal Ketersediaan
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button 
            type="button"
            onClick={prevMonth}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4b5563'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#111827',
            textTransform: 'capitalize'
          }}>
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </div>
          
          <button 
            type="button"
            onClick={nextMonth}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4b5563'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          textAlign: 'center',
          marginBottom: '8px',
          fontWeight: '500',
          color: '#6b7280',
          fontSize: '0.75rem'
        }}>
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => (
            <div key={i} style={{ padding: '8px 0' }}>{day}</div>
          ))}
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px'
        }}>
          {daysInMonth.map((day, i) => {
            // LOGIKA: Ambil jadwal approved
            const daySchedules = getJadwalForDate(day);
            const isFull = daySchedules.length > 0;
            
            const isSelected = formData.tanggal && isSameDay(day, new Date(formData.tanggal));
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const dayNumber = format(day, 'd');
            
            // Logic Style
            let bgColor = 'transparent';
            let textColor = '#374151';
            let cursor = 'pointer';
            let border = '1px solid transparent';

            if (!isCurrentMonth) {
               textColor = '#d1d5db';
               cursor = 'default';
            } else if (isFull) {
               // --- APPROVED: Warna Hijau ---
               bgColor = '#ffededff'; 
               textColor = '#ef4444'; 
               cursor = 'not-allowed';
               border = '1px solid #f8c6c6ff';
            } else if (isSelected) {
               bgColor = '#fcd3b2ff';
               textColor = 'white';
            } else if (isToday(day)) {
               bgColor = '#eff6ff';
               textColor = '#1d4ed8';
               border = '1px solid #bfdbfe';
            }

            return (
              <button
                type="button"
                key={i}
                onClick={() => {
                  if (isCurrentMonth && !isFull) {
                    handleDateSelect(day);
                  }
                }}
                disabled={!isCurrentMonth || isFull}
                style={{
                  minHeight: '48px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: '4px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  border: border,
                  backgroundColor: bgColor,
                  color: textColor,
                  cursor: cursor,
                  position: 'relative',
                  fontWeight: isSelected || isToday(day) ? '600' : 'normal',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
                title={isFull ? `Terjadwal: ${daySchedules[0].nama_sekolah}` : 'Tersedia'}
              >
                <span style={{ marginBottom: isFull ? '2px' : '0' }}>{dayNumber}</span>

                {/* --- CHIP NAMA SEKOLAH --- */}
                {isCurrentMonth && isFull && daySchedules.map((jadwal, idx) => (
                    <div 
                        key={idx} 
                        style={{
                            backgroundColor: '#ef4444', // Warna hijau success
                            color: 'white',
                            fontSize: '0.55rem',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            width: '100%',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '2px',
                            fontWeight: '500',
                            textAlign: 'center',
                            lineHeight: '1.2'
                        }}
                    >
                        {jadwal.nama_sekolah}
                    </div>
                ))}
              </button>
            );
          })}
        </div>
        
        {/* Legend */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: '#ffededff',
              border: '1px solid #f8c6c6ff',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <div style={{width:'80%', height:'40%', backgroundColor:'#ef4444', borderRadius:'2px'}}></div>
            </div>
            <span style={{ color: '#4b5563' }}>Jadwal Terisi (Sekolah Lain)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: '#fcd3b2ff',
            }} />
            <span style={{ color: '#4b5563' }}>Tanggal Pilihan Anda</span>
          </div>
        </div>
        </div>

        {/* --- FORM SECTION --- */}
        <form onSubmit={handleSubmit} style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minWidth: '300px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
          }}>
            <div className="form-column">
              <input
                type="text"
                name="namaSekolah"
                placeholder="Nama Sekolah"
                value={formData.namaSekolah}
                onChange={handleInputChange}
                className="form-input"
                disabled={isSubmitting}
                required
              />

              <input
                type="number"
                name="jumlahSiswa"
                placeholder="Jumlah Siswa"
                value={formData.jumlahSiswa}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                disabled={isSubmitting}
                required
              />

              <div className="date-input-container" style={{ position: 'relative' }}>
                <div className="date-input-wrapper" style={{ cursor: 'pointer' }}>
                  <input
                    type="text"
                    name="tanggal"
                    value={formData.tanggal ? formatDateToIndonesian(formData.tanggal) : ''}
                    readOnly
                    className="form-input date-input"
                    placeholder="Pilih tanggal di kalender"
                    disabled={isSubmitting}
                    required
                    style={{
                      cursor: 'pointer',
                      backgroundColor: formData.tanggal ? '#f0f9ff' : 'white',
                      borderColor: formData.tanggal ? '#ef4444' : '#e5e7eb',
                      color: formData.tanggal ? '#ef4444' : '#6b7280',
                    }}
                    onClick={() => {
                      document.querySelector('.calendar-section')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }}
                  />
                  <CalendarIcon 
                    className="calendar-icon" 
                    size={20}
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: formData.tanggal ? '#ef4444' : '#9ca3af' 
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="form-column">
              <input
                type="text"
                name="pjSekolah"
                placeholder="Nama Penanggung Jawab Sekolah"
                value={formData.pjSekolah}
                onChange={handleInputChange}
                className="form-input"
                disabled={isSubmitting}
                required
              />

              <input
                type="tel"
                name="kontakPj"
                placeholder="Nomor HP Penanggung Jawab"
                value={formData.kontakPj}
                onChange={handleInputChange}
                className="form-input"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div 
            className="file-upload-card" 
            onClick={() => openFilePicker({ accept: '.pdf,.doc,.docx' })}
            style={{
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              marginTop: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <Upload size={32} color="#6b7280" />
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              color: '#111827',
              fontSize: '1rem',
              fontWeight: '600'
            }}>Upload Surat Permohonan</h3>
            <p style={{
              margin: '0 0 16px 0',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              Klik di sini untuk mengunggah file (PDF, DOC, DOCX)
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openFilePicker({ accept: '.pdf,.doc,.docx' });
              }}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Pilih File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx"
              multiple
            />
          </div>

          {mediaFiles.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                maxHeight: '200px',
                overflowY: 'auto',
                padding: '4px 2px',
                marginRight: '-4px'
              }}>
                {mediaFiles.map((file, index) => (
                  <MediaPreview
                    key={index}
                    file={file}
                    onRemove={() => handleRemoveMedia(index)}
                  />
                ))}
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#9ca3af' : '#ef4444',
              color: 'white',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              marginTop: '16px',
              width: '100%',
              maxWidth: '300px',
              alignSelf: 'center',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }}
          >
            {isSubmitting ? 'Mengirim...' : 'Ajukan Kunjungan'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default DaftarKunjungan;