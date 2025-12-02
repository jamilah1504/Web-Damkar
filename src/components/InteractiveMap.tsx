// src/components/InteractiveMap.tsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- DEFINISI TIPE MARKER (UNION TYPE) ---

// Tipe 1: Lokasi Rawan
export interface IMarkerRawan {
  type: 'rawan';
  id: number;
  namaLokasi: string;
  deskripsi: string;
  latitude: number | string; // Handle string dari API
  longitude: number | string;
  images: string[];
}

// Tipe 2: Laporan
export interface IMarkerLaporan {
  type: 'laporan';
  id: number;
  judul_laporan: string;
  deskripsi_laporan: string;
  latitude: number | string;
  longitude: number | string;
  status: string;
  foto_bukti?: string;
  nama_pelapor?: string;
  created_at?: string;
}

// Gabungan (Export ini agar bisa dipakai di Peta.tsx)
export type IMapMarker = IMarkerRawan | IMarkerLaporan;

interface InteractiveMapProps {
  markers: IMapMarker[];
  centerCoordinates?: [number, number];
  onMarkerClick: (marker: IMapMarker) => void;
  onMapClick?: (latlng: L.LatLng) => void;
}

// --- DEFINISI ICON ---
// Hapus shadowUrl agar tidak error 404 default leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icon Merah (Untuk Rawan)
const iconRawan = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icon Biru/Kuning (Untuk Laporan)
const iconLaporan = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// --- KOMPONEN HELPER UNTUK KLIK MAP ---
const MapEvents: React.FC<{ onMapClick?: (latlng: L.LatLng) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng);
    },
  });
  return null;
};

// --- KOMPONEN UTAMA ---
const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  markers, 
  centerCoordinates, 
  onMarkerClick, 
  onMapClick 
}) => {
  
  // Helper untuk mendapatkan Judul Popup
  const getTitle = (marker: IMapMarker) => {
    return marker.type === 'rawan' ? marker.namaLokasi : marker.judul_laporan;
  };

  return (
    <MapContainer
      center={centerCoordinates || [-6.5, 107.5]} // Default coords (Subang/Jabar area)
      zoom={10}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      <MapEvents onMapClick={onMapClick} />

      {markers.map((marker) => {
        // Pastikan koordinat valid number
        const lat = typeof marker.latitude === 'string' ? parseFloat(marker.latitude) : marker.latitude;
        const lng = typeof marker.longitude === 'string' ? parseFloat(marker.longitude) : marker.longitude;

        return (
          <Marker
            key={`${marker.type}-${marker.id}`}
            position={[lat, lng]}
            icon={marker.type === 'rawan' ? iconRawan : iconLaporan}
            eventHandlers={{
              click: () => onMarkerClick(marker),
            }}
          >
            <Popup>
              <strong>{getTitle(marker)}</strong><br />
              {marker.type === 'rawan' ? 'Area Rawan' : `Laporan: ${marker.status}`}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default InteractiveMap;