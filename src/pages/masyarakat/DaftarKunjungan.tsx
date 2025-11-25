import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, X } from 'lucide-react';
import axios from 'axios';
import NotificationPopup from '../../components/NotificationPopup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

// Fungsi format tanggal
const formatDateToIndonesian = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  };
  return new Intl.DateTimeFormat('id-ID', options).format(date);
};

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
    <div className="media-preview">
      <div className="file-preview">
        <FileText size={24} />
        <span className="file-name-truncate">{file.name}</span>
      </div>
      <button onClick={onRemove} className="media-remove-button" aria-label="Hapus file">
        <X size={14} />
      </button>
    </div>
  );
};

const DaftarKunjungan: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormDataState>({
    namaSekolah: '',
    jumlahSiswa: '',
    tanggal: '',
    pjSekolah: '',
    kontakPj: '',
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    status: NotificationStatus;
    message: string;
  }>({ status: null, message: '' });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setMediaFiles((prev) => [...prev, ...newFiles]);
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
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // --- [1. AMBIL TOKEN DARI LOCAL STORAGE] ---
      // Pastikan key 'token' sesuai dengan yang Anda simpan saat Login
      const token = localStorage.getItem('token');

      if (!token) {
        setNotification({
          status: 'error',
          message: 'Anda belum login. Silakan login terlebih dahulu.',
        });
        // Redirect ke login jika tidak ada token
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // Validasi Input
      if (
        !formData.namaSekolah ||
        !formData.jumlahSiswa ||
        !formData.tanggal ||
        !formData.pjSekolah ||
        !formData.kontakPj
      ) {
        throw new Error('Harap lengkapi semua data yang diperlukan');
      }

      if (mediaFiles.length === 0) {
        throw new Error('Wajib mengupload Surat Permohonan (PDF/Word)!');
      }

      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.kontakPj)) {
        throw new Error('Format nomor telepon tidak valid. Gunakan 10-15 digit angka.');
      }

      // Buat FormData
      const dataToSend = new FormData();
      dataToSend.append('namaSekolah', formData.namaSekolah);
      dataToSend.append('jumlahSiswa', formData.jumlahSiswa);
      dataToSend.append('tanggal', formData.tanggal);
      dataToSend.append('pjSekolah', formData.pjSekolah);
      dataToSend.append('kontakPj', formData.kontakPj);

      mediaFiles.forEach((file) => {
        dataToSend.append('suratFiles', file);
      });

      // --- [2. KIRIM REQUEST DENGAN HEADER AUTHORIZATION] ---
      const response = await axios.post('http://localhost:5000/api/kunjungan', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // Backend butuh ini untuk tahu siapa req.user
        },
      });

      setNotification({
        status: 'success',
        message: response.data.msg || 'Pendaftaran kunjungan berhasil diajukan!',
      });

      // Reset Form
      setFormData({
        namaSekolah: '',
        jumlahSiswa: '',
        tanggal: '',
        pjSekolah: '',
        kontakPj: '',
      });
      setMediaFiles([]);
    } catch (error: any) {
      console.error('Gagal mengajukan pendaftaran:', error);
      let errorMessage = 'Terjadi kesalahan saat mengajukan pendaftaran';

      // Handle Unauthorized (Token Expired/Invalid)
      if (error.response && error.response.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
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

  const formattedDate = formData.tanggal
    ? formatDateToIndonesian(formData.tanggal)
    : 'Pilih tanggal kunjungan';

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
        <Button
          component={Link}
          to="/masyarakat/dashboard"
          startIcon={<ArrowBackIcon />}
          size="large" // Membuat ukuran tombol lebih besar
          variant="contained" // Membuat tombol memiliki background warna (bukan transparan)
          sx={{
            mb: 2,
            backgroundColor: '#d32f2f', // Warna Merah
            color: '#fff', // Warna Teks Putih
            fontWeight: 'bold',
            padding: '10px 24px', // Menambah ruang di dalam tombol agar terlihat lebih gagah
            '&:hover': {
              backgroundColor: '#b71c1c', // Warna merah lebih gelap saat kursor diarahkan (hover)
            },
          }}
        >
          Kembali ke Home
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
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
            min="1"
            className="form-input"
            disabled={isSubmitting}
            required
          />

          <input
            type="text"
            name="pjSekolah"
            placeholder="Nama PJ Sekolah"
            value={formData.pjSekolah}
            onChange={handleInputChange}
            className="form-input"
            disabled={isSubmitting}
            required
          />

          <input
            type="tel"
            name="kontakPj"
            placeholder="Kontak PJ"
            value={formData.kontakPj}
            onChange={handleInputChange}
            className="form-input"
            disabled={isSubmitting}
            required
          />

          <div className="date-input-container">
            <div className="date-input-wrapper">
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleInputChange}
                className="form-input date-input"
                disabled={isSubmitting}
                required
              />
            </div>
            {formData.tanggal && <div className="date-preview">{formattedDate}</div>}
          </div>

          <button type="submit" className="button-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Mengirim...' : 'Ajukan Pendaftaran'}
          </button>
        </div>

        <div className="form-column">
          <div className="card">
            <h3 className="card-title">
              Upload Surat Permohonan <span style={{ color: 'red' }}>*</span>
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden-file-input"
              multiple
              accept=".pdf,.doc,.docx"
              disabled={isSubmitting}
            />

            <div className="upload-grid">
              <button
                type="button"
                onClick={() =>
                  openFilePicker({
                    accept: '.pdf,.doc,.docx',
                  })
                }
                className="upload-button daftar-kunjungan-upload"
                disabled={isSubmitting}
              >
                <Upload size={32} className="upload-icon" />
                <span className="upload-text">Pilih File Dokumen (PDF/Word)</span>
              </button>
            </div>

            {mediaFiles.length > 0 && (
              <div className="preview-grid">
                {mediaFiles.map((file, index) => (
                  <MediaPreview
                    key={index}
                    file={file}
                    onRemove={() => !isSubmitting && handleRemoveMedia(index)}
                  />
                ))}
              </div>
            )}

            <p
              style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px', textAlign: 'center' }}
            >
              * Wajib upload file .pdf, .doc, atau .docx
            </p>
          </div>
        </div>
      </form>
    </main>
  );
};

export default DaftarKunjungan;
