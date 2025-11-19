import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Video,
  MapPin,
  X,
} from 'lucide-react';

// (BARU) Impor ReactDOMServer untuk mengubah React ke HTML
import ReactDOMServer from 'react-dom/server';

// 1. Impor React Leaflet dan CSS-nya
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api';
import NotificationPopup from '../../components/NotificationPopup';

// --- Perbaikan Ikon Leaflet ---
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});
// --- Akhir Perbaikan Ikon ---

interface LaporanData {
  namaPelapor: string;
  jenisKejadian: string;
  detailKejadian: string;
  alamatKejadian: string;
  latitude: number | null;
  longitude: number | null;
  dokumen: File[];
}

interface FormDataState {
  namaPelapor: string;
  jenisKejadian: string;
  detailKejadian: string;
  alamatKejadian: string;
}
interface LocationState {
  lat: number | null;
  long: number | null;
}
interface MediaPreviewProps {
  file: File;
  onRemove: () => void;
}
type NotificationStatus = 'success' | 'error' | 'pending' | null;

export const submitLaporan = async (data: LaporanData) => {
  // Validasi sederhana di sisi klien
  if (!data.latitude || !data.longitude) {
    throw new Error('Lokasi (Latitude/Longitude) wajib diisi.');
  }
  if (!data.namaPelapor || !data.jenisKejadian || !data.alamatKejadian) {
    throw new Error('Nama, Jenis Kejadian, dan Alamat wajib diisi.');
  }

  const formData = new FormData();
  formData.append('namaPelapor', data.namaPelapor);
  formData.append('jenisKejadian', data.jenisKejadian);
  formData.append('detailKejadian', data.detailKejadian);
  formData.append('alamatKejadian', data.alamatKejadian);
  formData.append('latitude', String(data.latitude));
  formData.append('longitude', String(data.longitude));

  if (data.dokumen && data.dokumen.length > 0) {
    data.dokumen.forEach((file) => {
      formData.append('dokumen', file);
    });
  }

  // Kirim data
  return await api.post('/reports', formData);
};


const MediaPreview: React.FC<MediaPreviewProps> = ({ file, onRemove }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);
  if (!previewUrl) return null;
  return (
    <div className="media-preview">
      {file.type.startsWith('image/') ? (
        <img src={previewUrl} alt={file.name} />
      ) : (
        <video src={previewUrl} controls />
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

function MapController({ location }: { location: LocationState }) {
  const map = useMap();
  useEffect(() => {
    if (location.lat && location.long) {
      map.flyTo([location.lat, location.long], 16);
    }
  }, [location, map]);
  return null;
}

// --- (DIUBAH) Komponen DraggableMarker ---
function DraggableMarker({
  location,
  setLocation,
  setMapAddress,
}: {
  location: LocationState;
  setLocation: React.Dispatch<React.SetStateAction<LocationState>>;
  setMapAddress: React.Dispatch<React.SetStateAction<string>>;
}) {
  const markerRef = useRef<L.Marker>(null);

  // (BARU) Buat ikon kustom dari Lucide
  const lucideIcon = L.divIcon({
    html: ReactDOMServer.renderToString(
      // Render komponen MapPin dari Lucide ke string HTML
      // Kita tambahkan kelas CSS agar bisa di-style (opsional)
      // Anda juga bisa memberi warna: color="#c0392b"
      <MapPin size={36} className="map-pin-icon" />
    ),
    className: 'leaflet-lucide-icon', // Kelas wrapper untuk L.DivIcon
    iconSize: [36, 36], // Sesuaikan ukuran
    iconAnchor: [18, 36], // Titik ujung pin (tengah-bawah)
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setLocation({ lat: newPos.lat, long: newPos.lng });
          setMapAddress(`Lokasi Diatur: ${newPos.lat.toFixed(4)}, ${newPos.lng.toFixed(4)}`);
        }
      },
    }),
    [setLocation, setMapAddress]
  );

  if (!location.lat || !location.long) return null;

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[location.lat, location.long]}
      ref={markerRef}
      icon={lucideIcon} // <-- (DIUBAH) Gunakan ikon kustom Lucide
    />
  );
}

// --- Komponen Form Utama ---
export default function LaporanKejadianForm(): JSX.Element {
  const navigate = useNavigate();
  const locationn = useLocation();


  const [formData, setFormData] = useState<FormDataState>({
    namaPelapor: '',
    jenisKejadian: '',
    detailKejadian: '',
    alamatKejadian: '',
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILES = 5;

  const [location, setLocation] = useState<LocationState>({ lat: -6.5522, long: 107.7587 });
  const [mapAddress, setMapAddress] = useState<string>('Mencari lokasi...');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [notification, setNotification] = useState<{
    status: NotificationStatus;
    message: string;
  }>({ status: null, message: '' });
  

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    setMapAddress('Mendapatkan lokasi GPS...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, long: longitude });
          setMapAddress(`Lokasi GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setMapAddress('Gagal mendapatkan lokasi GPS.');
          setIsLocating(false);
          setNotification({
            status: 'error',
            message: 'Gagal mendapatkan lokasi: ' + error.message,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setNotification({
        status: 'error',
        message: 'Geolocation tidak didukung oleh browser ini.',
      });
      setMapAddress('Geolocation tidak didukung.');
      setIsLocating(false);


    }
  };

  useEffect(() => {
    handleGetLocation();
  }, []);

  useEffect(() => {
    // 1. Cek apakah ada state yang dikirim saat navigasi DAN
    //    apakah di dalamnya ada properti 'formData'
    if (locationn.state && locationn.state.formData) {
      const aiData = locationn.state.formData;

      // 2. Perbarui state form dengan data dari AI
      //    Kita gunakan '|| ""' untuk menangani jika ada nilai null (seperti namaPelapor)
      setFormData((prevData) => ({
        ...prevData,
        namaPelapor: aiData.namaPelapor || '',
        jenisKejadian: aiData.jenisKejadian || '',
        detailKejadian: aiData.detailKejadian || '',
        alamatKejadian: aiData.alamatKejadian || '',
      }));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const totalFiles = mediaFiles.length + newFiles.length;
      if (totalFiles > MAX_FILES) {
        setNotification({
          status: 'error',
          message: `Anda hanya dapat mengupload maksimal ${MAX_FILES} file.`,
        });
        const allowedNewFiles = newFiles.slice(0, MAX_FILES - mediaFiles.length);
        setMediaFiles((prev) => [...prev, ...allowedNewFiles]);
      } else {
        setMediaFiles((prev) => [...prev, ...newFiles]);
      }
    }
    if (e.target) e.target.value = '';
  };

  const openFilePicker = (options: {
    accept: string;
    capture?: 'environment' | false;
  }) => {
    if (mediaFiles.length >= MAX_FILES) {
      setNotification({
        status: 'error',
        message: `Anda sudah mencapai batas maksimal ${MAX_FILES} file.`,
      });
      return;
    }
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
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const laporanData: LaporanData = {
      ...formData,
      latitude: location.lat,
      longitude: location.long,
      dokumen: mediaFiles,
    };

    try {
      await submitLaporan(laporanData);
      setNotification({
        status: 'success',
        message: 'Laporan Anda telah berhasil diajukan. Petugas akan segera merespons.',
      });
    } catch (error) {
      console.error('Gagal mengirim laporan:', error);
      let errorMessage = 'Gagal mengirim laporan. Silakan coba lagi.';
      if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;

      } else if (error instanceof Error) {
          // Cadangan jika bukan error Axios
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
    // Jika statusnya sukses, navigasi kembali SETELAH ditutup
    if (notification.status === 'success') {
      navigate(-1);
    }
    // Reset notifikasi
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
      {/* --- Title Bar --- */}
      <div className="title-bar">
        <button onClick={() => navigate(-1)} className="back-button" disabled={isSubmitting}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="page-title">Laporan Kejadian</h2>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="form-grid">
        {/* --- Kolom Kiri - Form Input --- */}
        <div className="form-column">
          <input
            type="text"
            name="namaPelapor"
            placeholder="Nama Pelapor"
            value={formData.namaPelapor}
            onChange={handleInputChange}
            className="form-input"
            disabled={isSubmitting}
          />
          <select
            name="jenisKejadian"
            value={formData.jenisKejadian}
            onChange={handleInputChange}
            className="form-input"
            disabled={isSubmitting}
          >
            <option value="">Jenis Kejadian</option>
            <option value="Kebakaran">Kebakaran</option>
            <option value="Non Kebakaran">Non Kebakaran</option>
          </select>
          <textarea
            name="detailKejadian"
            placeholder="Detail Kejadian"
            value={formData.detailKejadian}
            onChange={handleInputChange}
            rows={4}
            className="form-textarea"
            disabled={isSubmitting}
          />
          <textarea
            name="alamatKejadian"
            placeholder="Alamat Kejadian (Detail)"
            value={formData.alamatKejadian}
            onChange={handleInputChange}
            rows={4}
            className="form-textarea"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="button-submit"
            disabled={isSubmitting || isLocating}
          >
            {isSubmitting ? 'Mengirim Laporan...' : 'Ajukan Laporan'}
          </button>
        </div>

        {/* --- Kolom Kanan - Upload & Map --- */}
        <div className="form-column">
          <div className="card">
            <h3 className="card-title">Upload Dokumentasi (Maks. 5)</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden-file-input"
              multiple
              disabled={isSubmitting}
            />
            <div className="upload-grid">
              <button
                type="button"
                onClick={() => openFilePicker({ accept: 'image/*', capture: 'environment' })}
                className="upload-button"
                disabled={mediaFiles.length >= MAX_FILES || isSubmitting}
              >
                <Camera size={32} className="upload-icon" />
                <span className="upload-text">Foto</span>
              </button>
              <button
                type="button"
                onClick={() => openFilePicker({ accept: 'video/*', capture: 'environment' })}
                className="upload-button"
                disabled={mediaFiles.length >= MAX_FILES || isSubmitting}
              >
                <Video size={32} className="upload-icon" />
                <span className="upload-text">Video</span>
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

          <div className="card">
            <div className="map-header">
              <div>
                <h3 className="card-title-flex">
                  Pilih Lokasi
                  <MapPin size={16} />
                </h3>
                <p className="map-address">{mapAddress}</p>
              </div>
              <button
                onClick={handleGetLocation}
                className="button-change-location"
                disabled={isLocating || isSubmitting}
              >
                {isLocating ? 'Mencari...' : 'Reset GPS'}
              </button>
            </div>

            <div className="map-container">
              {location.lat && location.long ? (
                <MapContainer
                  className="map-leaflet-container"
                  center={[location.lat, location.long]}
                  zoom={16}
                  dragging={!isSubmitting}
                  touchZoom={!isSubmitting}
                  scrollWheelZoom={!isSubmitting}
                  doubleClickZoom={!isSubmitting}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <DraggableMarker
                    location={location}
                    setLocation={setLocation}
                    setMapAddress={setMapAddress}
                  />
                  <MapController location={location} />
                </MapContainer>
              ) : (
                <div className="map-loading">
                  {isLocating ? 'Mencari lokasi...' : mapAddress}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}