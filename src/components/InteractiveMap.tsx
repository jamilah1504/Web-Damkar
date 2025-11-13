// src/components/InteractiveMap.tsx (VERSI BARU DENGAN MAP PANNING)
import React, { useEffect } from 'react'; // <-- Tambahkan useEffect
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'; // <-- Tambahkan useMap
import L from 'leaflet';

// ... (Kode ikon Leaflet Anda)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


export interface IMapMarker {
  id: number;
  latitude: number;
  longitude: number;
  namaLokasi: string;
}

interface InteractiveMapProps {
  markers: IMapMarker[];
  onMarkerClick: (marker: IMapMarker) => void;
  onMapClick?: (latlng: L.LatLng) => void; 
  centerCoordinates?: L.LatLngExpression; // <-- (1) TAMBAHKAN PROP BARU INI
}

// ... (Komponen MapClickHandler Anda yang lama)
const MapClickHandler = ({ onClick }: { onClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({ click(e) { onClick(e.latlng); } });
  return null;
};


// --- (2) TAMBAHKAN KOMPONEN HELPER INI ---
// Komponen ini akan "mendengarkan" perubahan prop centerCoordinates
// dan memerintahkan peta untuk pindah.
const MapCenterUpdater: React.FC<{ center: L.LatLngExpression }> = ({ center }) => {
  const map = useMap(); // Dapatkan instansi peta
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15); // Pindahkan peta ke center baru (zoom 15)
    }
  }, [center, map]); // Jalankan efek ini setiap kali 'center' berubah

  return null; // Komponen ini tidak me-render apapun
};


const InteractiveMap: React.FC<InteractiveMapProps> = ({ markers, onMarkerClick, onMapClick, centerCoordinates }) => {
  // Gunakan centerCoordinates sebagai posisi awal jika ada
  const defaultPosition: L.LatLngExpression = centerCoordinates || [-6.4988, 107.6710];

  return (
    <MapContainer 
      center={defaultPosition} 
      zoom={15} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* ... (Kode .map() untuk Marker Anda) ... */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          eventHandlers={{ click: () => { onMarkerClick(marker); } }}
        >
          <Popup>{marker.namaLokasi}</Popup>
        </Marker>
      ))}

      {onMapClick && <MapClickHandler onClick={onMapClick} />}

      {/* --- (3) TAMBAHKAN HELPER-NYA DI SINI --- */}
      {/* Kirim centerCoordinates ke helper */}
      {centerCoordinates && <MapCenterUpdater center={centerCoordinates} />}
    </MapContainer>
  );
};

export default InteractiveMap;