import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, X } from 'lucide-react';
import axios from 'axios'; // IMPORT AXIOS
import NotificationPopup from '../../components/NotificationPopup';

// Fungsi untuk memformat tanggal ke bahasa Indonesia
const formatDateToIndonesian = (dateString: string) => {
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!previewUrl) return null;

  return (
    <div className="media-preview">
      {file.type.startsWith('image/') ? (
        <img src={previewUrl} alt={file.name} />
      ) : (
        <div className="file-preview">
          <FileText size={24} />
          <span>{file.name}</span>
        </div>
      )}
      <button
        onClick={onRemove}
        className="media-remove-button"
        aria-label="Hapus file"
      >
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
    kontakPj: ''
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    status: NotificationStatus;
    message: string;
  }>({ status: null, message: '' });

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

  const openFilePicker = (options: { accept: string; capture?: 'environment' | false }) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = options.accept;
      if (options.capture) {
        fileInputRef.current.setAttribute('capture', String(options.capture));
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- FUNGSI YANG DIUBAH UNTUK KONEKSI KE DATABASE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Validasi Form
      if (!formData.namaSekolah || !formData.jumlahSiswa || !formData.tanggal || !formData.pjSekolah || !formData.kontakPj) {
        throw new Error('Harap lengkapi semua data yang diperlukan');
      }
      
      // Validasi format telepon
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.kontakPj)) {
        throw new Error('Format nomor telepon tidak valid. Gunakan 10-15 digit angka.');
      }

      // 2. Buat FormData
      const dataToSend = new FormData();
    
      // Append data text
      dataToSend.append('namaSekolah', formData.namaSekolah);
      dataToSend.append('jumlahSiswa', formData.jumlahSiswa);
      dataToSend.append('tanggal', formData.tanggal);
      dataToSend.append('pjSekolah', formData.pjSekolah);
      dataToSend.append('kontakPj', formData.kontakPj);

      // Append file (Looping array mediaFiles)
      // 'suratFiles' harus sama dengan di Backend: upload.array('suratFiles')
      mediaFiles.forEach((file) => {
        dataToSend.append('suratFiles', file); 
      });

      // 3. Kirim ke API (Ganti URL sesuai backend Anda)
      const response = await axios.post('http://localhost:5000/api/kunjungan', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Jika berhasil
      setNotification({
        status: 'success',
        message: response.data.msg || 'Pendaftaran kunjungan berhasil diajukan!'
      });

      // Reset form
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
      
      // Penanganan pesan error yang lebih detail
      let errorMessage = 'Terjadi kesalahan saat mengajukan pendaftaran';
      if (error.response && error.response.data && error.response.data.msg) {
        errorMessage = error.response.data.msg; // Pesan dari Backend
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
        <button 
          onClick={() => navigate(-1)} 
          className="back-button" 
          disabled={isSubmitting}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="page-title">Daftar Kunjungan</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        {/* Left Column - Form Inputs */}
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
            {formData.tanggal && (
              <div className="date-preview">{formattedDate}</div>
            )}
          </div>

          <button
            type="submit"
            className="button-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengirim...' : 'Ajukan Pendaftaran'}
          </button>
        </div>

        {/* Right Column - File Upload */}
        <div className="form-column">
          <div className="card">
            <h3 className="card-title">Upload Surat Permohonan</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden-file-input"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={isSubmitting}
            />
            <div className="upload-grid">
              <button
                type="button"
                onClick={() => openFilePicker({ 
                  accept: 'image/*,.pdf,.doc,.docx',
                  capture: 'environment' 
                })}
                className="upload-button daftar-kunjungan-upload"
                disabled={isSubmitting}
              >
                <Upload size={32} className="upload-icon" />
                <span className="upload-text">Surat Permohonan</span>
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
          </div>
        </div>
      </form>
    </main>
  );
};

export default DaftarKunjungan;