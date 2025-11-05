// src/components/NotificationPopup.tsx
import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface NotificationPopupProps {
  // Tentukan status untuk mengubah ikon dan warna
  status: 'success' | 'error' | 'pending';
  message: string;
  // Fungsi untuk menutup popup
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  status,
  message,
  onClose,
}) => {
  let IconComponent;
  let title: string;
  let themeClass: string;

  switch (status) {
    case 'success':
      IconComponent = <CheckCircle size={48} />;
      title = 'Laporan Berhasil';
      themeClass = 'popup-success';
      break;
    case 'error':
      // Tema merah untuk 'gagal' seperti yang diminta
      IconComponent = <XCircle size={48} />;
      title = 'Laporan Gagal';
      themeClass = 'popup-error';
      break;
    case 'pending':
      IconComponent = <Loader2 size={48} className="popup-loader" />;
      title = 'Sedang Memproses';
      themeClass = 'popup-pending';
      break;
  }

  return (
    // 1. Overlay (latar belakang gelap)
    <div className="popup-overlay">
      {/* 2. Konten Popup */}
      <div className={`popup-content ${themeClass}`}>
        <div className="popup-icon">{IconComponent}</div>
        <h3 className="popup-title">{title}</h3>
        <p className="popup-message">{message}</p>

        {/* Jangan tampilkan tombol tutup untuk status 'pending' */}
        {status !== 'pending' && (
          <button onClick={onClose} className="popup-button">
            Tutup
          </button>
        )}
      </div>
    </div>
  );
};



export default NotificationPopup;