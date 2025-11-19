import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- SETUP ICON DEFAULT (Agar tidak pecah di React Leaflet) ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Set icon default secara global untuk semua marker
L.Marker.prototype.options.icon = DefaultIcon;

// --- INTERFACE ---
export interface IMapMarker {
  id: number | string;
  latitude: number;
  longitude: number;
  namaLokasi: string;
  description?: string;
  image?: string;
}

interface InteractiveMapProps {
  markers: IMapMarker[];
  onMarkerClick?: (marker: IMapMarker) => void;
  center?: [number, number];
  zoom?: number;
  activeMarkerId?: string | number | null;
}

// ============================================================
// [PENTING] KOMPONEN PENGENDALI GERAKAN PETA
// ============================================================
const MapController = ({ center, zoom }: { center?: [number, number]; zoom?: number }) => {
  const map = useMap(); // Hook untuk mengakses instance Leaflet Map

  useEffect(() => {
    if (center) {
      // Fungsi flyTo membuat animasi "terbang" yang halus ke lokasi tujuan
      map.flyTo(center, zoom || 16, {
        animate: true,
        duration: 1.5, // Durasi animasi (detik)
      });
    }
  }, [center, zoom, map]); // Jalankan efek setiap kali 'center' berubah

  return null; 
};

// --- MAIN COMPONENT ---
const InteractiveMap = ({ markers, onMarkerClick, center, zoom, activeMarkerId }: InteractiveMapProps) => {
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});

  // Auto open popup saat activeMarkerId berubah (diklik dari list)
  useEffect(() => {
    if (activeMarkerId && markerRefs.current[activeMarkerId]) {
      const marker = markerRefs.current[activeMarkerId];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [activeMarkerId]);

  return (
    <MapContainer
      center={center || [-6.565493, 107.827441]} 
      zoom={zoom || 13}
      scrollWheelZoom={true}
      zoomControl={false} // Matikan zoom kiri atas
      style={{ height: '100%', width: '100%', borderRadius: '12px', zIndex: 0 }}
    >
      {/* [PENTING] Pasang MapController di sini */}
      <MapController center={center} zoom={zoom} />

      {/* Zoom Control di Kanan Bawah */}
      <ZoomControl position="bottomright" />

      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {markers.map((marker) => {
        const isSelected = String(marker.id) === String(activeMarkerId);
        
        return (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            // Hapus properti icon={} agar menggunakan DefaultIcon yang sudah diset global
            zIndexOffset={isSelected ? 1000 : 0} // Marker aktif selalu di paling atas
            opacity={isSelected ? 1 : 0.8}       // Marker tidak aktif sedikit transparan (opsional)
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(marker),
            }}
            ref={(element) => {
              if (element) markerRefs.current[marker.id] = element;
            }}
          >
            <Popup className="custom-popup" minWidth={220} maxWidth={260}>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Gambar */}
                <div style={{ 
                    width: 'calc(100% + 42px)', margin: '-14px -21px 10px -21px', 
                    height: '130px', backgroundColor: '#eee', position: 'relative' 
                }}>
                  <img 
                    src={marker.image || 'https://via.placeholder.com/220x130?text=No+Image'} 
                    alt={marker.namaLokasi} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/220x130?text=Error'; }}
                  />
                </div>
                {/* Teks */}
                <div style={{ padding: '0 5px' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', fontWeight: '700', color: '#333' }}>{marker.namaLokasi}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.4', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {marker.description || 'Tidak ada deskripsi tersedia.'}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default InteractiveMap;