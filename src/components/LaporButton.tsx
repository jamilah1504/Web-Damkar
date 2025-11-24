import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Video, Loader2, Camera, Image as ImageIcon, X, Send, AlertTriangle } from 'lucide-react';
// Import komponen notifikasi yang sudah dipisah
import NotificationPopup from './NotificationPopup';

// ==========================================
// 1. SERVICES & TYPES
// ==========================================
export interface LaporData {
  namaPelapor: string | null;
  jenisKejadian: string | null;
  detailKejadian: string | null;
  alamatKejadian: string | null;
  latitude: number | null;
  longitude: number | null;
  dokumen?: File[];
}

// Simulasi fungsi submit
const submitLaporan = async (data: LaporData) => {
  if (!data.latitude || !data.longitude) throw new Error('Lokasi wajib diisi.');
  
  const formData = new FormData();
  formData.append('namaPelapor', data.namaPelapor || 'Anonim');
  formData.append('jenisKejadian', data.jenisKejadian || 'Lainnya');
  formData.append('detailKejadian', data.detailKejadian || '-');
  formData.append('alamatKejadian', data.alamatKejadian || '-');
  formData.append('latitude', String(data.latitude));
  formData.append('longitude', String(data.longitude));

  if (data.dokumen && data.dokumen.length > 0) {
    data.dokumen.forEach((file) => formData.append('dokumen', file));
  }

  // Ganti URL dengan endpoint backend Anda
  const response = await fetch('http://localhost:5000/api/reports', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Gagal mengirim laporan ke server.');
  return await response.json();
};

// ==========================================
// 2. HELPER COMPONENTS (PORTALS INTERNAL)
// ==========================================

// --- Source Menu (Tetap di sini sebagai internal helper) ---
const SourceMenuPortal = ({ onClose, onSelect }: { onClose: () => void; onSelect: (source: 'camera' | 'gallery') => void; }) => {
  const rootElement = document.getElementById('popup-root');
  if (!rootElement) return null;

  return ReactDOM.createPortal(
    <div className="popup-overlay source-menu">
      <div className="popup-container">
        <button className="btn-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        {/* Gunakan class 'menu-body' sebagai wrapper konten */}
        <div className="menu-body">
          <h3 className="menu-title">Pilih Sumber Video</h3>
          
          <div className="source-btn camera" onClick={() => onSelect('camera')}>
            <div className="icon-wrapper">
              <Camera size={24} />
            </div>
            <div className="source-text">
              <h4>Ambil Video Langsung</h4>
              <p>Rekam kejadian secara real-time</p>
            </div>
          </div>

          <div className="source-btn gallery" onClick={() => onSelect('gallery')}>
            <div className="icon-wrapper">
              <ImageIcon size={24} />
            </div>
            <div className="source-text">
              <h4>Pilih dari Galeri</h4>
              <p>Upload video yang tersimpan</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    rootElement
  );
};

// --- Manual Form (Tetap di sini sebagai internal helper) ---
interface FormDataState {
  namaPelapor: string;
  jenisKejadian: string;
  detailKejadian: string;
  alamatKejadian: string;
}

const ManualFormPortal = ({ data, setData, onSubmit, onClose }: { data: FormDataState; setData: (d: FormDataState) => void; onSubmit: (e: React.FormEvent) => void; onClose: () => void; }) => {
  const rootElement = document.getElementById('popup-root');
  if (!rootElement) return null;

  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="manual-header">
          <AlertTriangle className="text-yellow-600" size={24} />
          <div>
            <h3>Data Belum Lengkap</h3>
            <p>AI membutuhkan bantuan Anda untuk melengkapi data.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="manual-body">
          <div className="form-group">
            <label className="form-label">Nama Pelapor *</label>
            <input type="text" className="form-input" value={data.namaPelapor} onChange={(e) => setData({...data, namaPelapor: e.target.value})} placeholder="Nama Anda" required />
          </div>
          <div className="form-group">
            <label className="form-label">Jenis Kejadian *</label>
            <select className="form-input bg-white" value={data.jenisKejadian} onChange={(e) => setData({...data, jenisKejadian: e.target.value})} required>
              <option value="">-- Pilih Jenis --</option>
              <option value="Kebakaran">Kebakaran</option>
              <option value="Non Kebakaran">Non Kebakaran</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Alamat Kejadian *</label>
            <textarea className="form-input" rows={2} value={data.alamatKejadian} onChange={(e) => setData({...data, alamatKejadian: e.target.value})} placeholder="Lokasi lengkap..." required />
          </div>
          <div className="form-group">
            <label className="form-label">Detail Tambahan</label>
            <textarea className="form-input" rows={2} value={data.detailKejadian} onChange={(e) => setData({...data, detailKejadian: e.target.value})} placeholder="Keterangan opsional..." />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-cancel">Batal</button>
            <button type="submit" className="btn btn-submit"><Send size={16} /> Kirim</button>
          </div>
        </form>
      </div>
    </div>,
    rootElement
  );
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
const LaporButton = () => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('MEMPROSES...');
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [tempLocation, setTempLocation] = useState<{lat: number, lng: number} | null>(null);
  const [manualData, setManualData] = useState<FormDataState>({
    namaPelapor: '', jenisKejadian: '', detailKejadian: '', alamatKejadian: ''
  });
  const [notification, setNotification] = useState<{ status: 'success' | 'error' | 'pending' | 'info' | null; message: string; }>({ status: null, message: '' });

  // Refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Effect: Pastikan popup-root ada di DOM
  useEffect(() => {
    if (!document.getElementById('popup-root')) {
      const div = document.createElement('div');
      div.id = 'popup-root';
      document.body.appendChild(div);
    }
  }, []);

  // Helper: Geolocation
  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation tidak didukung browser ini.'));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => reject(new Error('Gagal mengambil lokasi. Pastikan GPS aktif.'))
      );
    });
  };

  // Handlers
  const handleMainButtonClick = () => { if (!isLoading) setShowSourceMenu(true); };
  
  const selectSource = (source: 'camera' | 'gallery') => {
    setShowSourceMenu(false);
    source === 'camera' ? cameraInputRef.current?.click() : galleryInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setTempFile(file);
    setIsLoading(true);
    setNotification({ status: null, message: '' });

    try {
      setLoadingText('MENCARI LOKASI...');
      const location = await getCurrentLocation();
      setTempLocation(location);

      setLoadingText('ANALISA AI...');
      const formDataAI = new FormData();
      formDataAI.append('file', file);

      // Gunakan Endpoint Terkonsolidasi (1 Call)
      const resAI = await fetch('http://localhost:5000/api/ai/analyze-report', {
        method: 'POST',
        body: formDataAI,
      });

      if (!resAI.ok) {
         const errData = await resAI.json().catch(() => ({}));
         throw new Error(errData.message || 'Gagal menganalisa video.');
      }
      
      const dataAI = await resAI.json();
      const extracted = dataAI.formData;

      const isDataComplete = extracted.namaPelapor && extracted.jenisKejadian && extracted.detailKejadian && extracted.alamatKejadian;

      if (isDataComplete) {
        setLoadingText('MENGIRIM...');
        await executeSubmit({
          namaPelapor: extracted.namaPelapor,
          jenisKejadian: extracted.jenisKejadian,
          detailKejadian: extracted.detailKejadian,
          alamatKejadian: extracted.alamatKejadian,
        }, location, file);
      } else {
        setIsLoading(false);
        setManualData({
          namaPelapor: extracted.namaPelapor || '',
          jenisKejadian: extracted.jenisKejadian || '',
          detailKejadian: extracted.detailKejadian || '',
          alamatKejadian: extracted.alamatKejadian || '',
        });
        setShowManualForm(true);
        setNotification({ status: 'info', message: 'Data belum lengkap. Mohon lengkapi informasi yang kurang.' });
      }
    } catch (err: any) {
      console.error('Lapor Error:', err);
      setIsLoading(false);
      setNotification({ status: 'error', message: err.message || 'Terjadi kesalahan sistem.' });
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const executeSubmit = async (data: FormDataState, loc: {lat: number, lng: number}, fileDocs: File) => {
    try {
      const finalPayload: LaporData = { ...data, latitude: loc.lat, longitude: loc.lng, dokumen: [fileDocs] };
      await submitLaporan(finalPayload);
      setNotification({ status: 'success', message: 'Laporan Berhasil Terkirim!' });
      setShowManualForm(false);
      setTempFile(null);
      setTempLocation(null);
    } catch (error: any) {
      setNotification({ status: 'error', message: error.message || 'Gagal mengirim ke database.' });
    } finally {
      setIsLoading(false);
      setLoadingText('MEMPROSES...');
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempLocation || !tempFile) {
      setNotification({ status: 'error', message: 'Data hilang. Ulangi proses.' }); return;
    }
    setShowManualForm(false);
    setIsLoading(true);
    setLoadingText('MENGIRIM MANUAL...');
    await executeSubmit(manualData, tempLocation, tempFile);
  };

  const getButtonContent = () => {
    if (isLoading) return { icon: <Loader2 size={40} strokeWidth={2.5} className="animate-spin" />, label: loadingText };
    return { icon: <Video size={40} strokeWidth={2.5} />, label: 'LAPOR VIDEO' };
  };
  const { icon, label } = getButtonContent();

  return (
    <>
     <style>{`
      /* --- Overlay & Container Dasar --- */
      .popup-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.65); /* Sedikit lebih gelap agar fokus */
        display: flex;
        justify-content: center;
        align-items: flex-end; /* Default mobile: bottom sheet */
        z-index: 9999 !important;
        backdrop-filter: blur(4px); /* Efek blur lebih kuat */
        animation: fadeIn 0.25s ease-out;
        padding: 16px; /* Jarak aman dari tepi layar */
      }

      .popup-container {
        background-color: white;
        width: 100%;
        max-width: 420px;
        border-radius: 20px; /* Radius lebih modern */
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        max-height: 85vh; /* Mencegah popup terlalu panjang di layar kecil */
        animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* --- Desktop/Tablet View --- */
      @media (min-width: 640px) {
        .popup-overlay {
          align-items: center; /* Tengah layar untuk tablet/desktop */
        }
        .popup-container {
          margin-bottom: auto;
          max-height: 90vh;
        }
      }

      /* --- Header (Manual Form) --- */
      .manual-header {
        background-color: #fffbeb;
        padding: 20px;
        border-bottom: 1px solid #fcd34d;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        flex-shrink: 0; /* Header tidak boleh mengecil */
      }
      
      .manual-header h3 {
        margin: 0;
        font-weight: 700;
        color: #92400e; /* Warna teks yang kontras dengan background kuning */
        font-size: 18px;
        line-height: 1.2;
      }
      
      .manual-header p {
        margin: 4px 0 0 0;
        font-size: 13px;
        color: #b45309;
        line-height: 1.4;
      }

      /* --- Tombol Close (X) --- */
      .btn-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(255, 255, 255, 0.5);
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        transition: all 0.2s;
        z-index: 10;
      }
      .btn-close:hover {
        background-color: #fee2e2;
        color: #ef4444;
        transform: rotate(90deg);
      }

      /* --- Body & Form --- */
      .manual-body {
        padding: 24px;
        overflow-y: auto; /* Scrollable jika konten panjang */
        overscroll-behavior: contain;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
      }

      .form-input {
        width: 100%;
        padding: 12px 14px; /* Area ketuk lebih nyaman */
        border: 1.5px solid #e5e7eb;
        border-radius: 10px;
        font-size: 14px;
        outline: none;
        color: #1f2937;
        background-color: #f9fafb;
        transition: all 0.2s;
        box-sizing: border-box;
      }

      .form-input::placeholder {
        color: #9ca3af;
      }

      .form-input:hover {
        border-color: #d1d5db;
        background-color: white;
      }

      .form-input:focus {
        border-color: #ef4444;
        background-color: white;
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); /* Ring fokus merah lembut */
      }

      /* --- Tombol Aksi (Footer) --- */
      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 10px;
        padding-top: 20px;
        border-top: 1px solid #f3f4f6;
      }

      .btn {
        flex: 1;
        padding: 12px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        border: none;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
        position: relative;
        overflow: hidden;
      }

      .btn:active {
        transform: scale(0.98); /* Efek tekan */
      }

      .btn-cancel {
        background-color: white;
        border: 1px solid #d1d5db;
        color: #4b5563;
      }
      .btn-cancel:hover {
        background-color: #f3f4f6;
        border-color: #9ca3af;
        color: #1f2937;
      }

      .btn-submit {
        background-color: #dc2626;
        color: white;
        box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.3);
      }
      .btn-submit:hover {
        background-color: #b91c1c;
        box-shadow: 0 6px 8px -1px rgba(220, 38, 38, 0.4);
      }

      /* --- Source Menu (Pilihan Kamera/Galeri) --- */
      .source-btn {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 14px;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background-color: white;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid #e5e7eb;
      }

      .source-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      /* Varian Kamera */
      .source-btn.camera:hover {
        border-color: #fee2e2;
        background-color: #fef2f2;
      }
      .source-btn.camera .icon-wrapper {
        background-color: #fee2e2;
        color: #ef4444;
      }

      /* Varian Galeri */
      .source-btn.gallery:hover {
        border-color: #dbeafe;
        background-color: #eff6ff;
      }
      .source-btn.gallery .icon-wrapper {
        background-color: #dbeafe;
        color: #3b82f6;
      }

      .icon-wrapper {
        padding: 12px;
        border-radius: 12px;
        margin-right: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: colors 0.2s;
      }

      .source-text h4 {
        margin: 0;
        font-weight: 700;
        color: #111827;
        font-size: 16px;
      }
      .source-text p {
        margin: 2px 0 0 0;
        color: #6b7280;
        font-size: 13px;
      }

      /* --- Animasi --- */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
        .menu-body {
          padding: 32px 24px 24px 24px; /* Top padding lebih besar agar tidak nabrak tombol close */
          display: flex;
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
        }

        /* Menggantikan text-center font-bold mb-5 text-gray-800 */
        .menu-title {
          text-align: center;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 24px 0; /* Jarak ke tombol di bawahnya */
        }

        /* Penyesuaian agar tombol close tidak menutupi konten di layar kecil */
        .popup-overlay.source-menu .btn-close {
          top: 12px;
          right: 12px;
          z-index: 20;
        }
    `}</style>

      {/* Input File Tersembunyi */}
      <input type="file" accept="video/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" style={{display:'none'}} />
      <input type="file" accept="video/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" style={{display:'none'}} />

      {/* 1. NOTIFIKASI */}
      {notification.status && !showManualForm && (
        <NotificationPopup status={notification.status} message={notification.message} onClose={() => setNotification({ status: null, message: '' })} />
      )}

      {/* 2. TOMBOL UTAMA */}
      <button className="lapor-main-button" onClick={handleMainButtonClick} disabled={isLoading}>
        <div className={`lapor-circle ${isLoading ? 'bg-gray-500' : 'bg-red-600'}`}>
          {icon}
        </div>
        <span className="lapor-label">{label}</span>
      </button>

      {/* 3. POPUP MENU (Portal) */}
      {showSourceMenu && <SourceMenuPortal onClose={() => setShowSourceMenu(false)} onSelect={selectSource} />}

      {/* 4. FORM MANUAL (Portal) */}
      {showManualForm && <ManualFormPortal data={manualData} setData={setManualData} onSubmit={handleManualSubmit} onClose={() => setShowManualForm(false)} />}
    </>
  );
};

export default LaporButton;