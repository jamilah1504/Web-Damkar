// PERBAIKAN 3: Impor 'SyntheticEvent'
import React, { SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Impor ikon dari Lucide React
import {
  Shield,
  Mic,
  Keyboard,
  Phone,
  Flame,
  HelpCircle,
  BarChart,
  Book,
  School,
  Contact, // PERBAIKAN 4: Menggunakan 'Contacts' (jamak)
} from 'lucide-react';


// PERBAIKAN 2: Hapus impor gambar dari 'public' (sudah benar)

// --- Komponen Pengganti _buildServiceButton ---
interface ServiceButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const ServiceButton: React.FC<ServiceButtonProps> = ({
  icon,
  label,
  onClick,
}) => (
  <button onClick={onClick} className="service-button">
    {icon}
    <span className="service-button-label">{label}</span>
  </button>
);

// --- Komponen Pengganti _buildLaporSection ---
const LaporSection: React.FC = () => (
  <section className="lapor-section">
    <button className="lapor-button-main">
      <div className="lapor-button-inner">
        <Mic size={40} />
        <span className="lapor-button-text">LAPOR</span>
      </div>
    </button>

    <div className="lapor-options-container">
      <button className="lapor-option-button"
        onClick={() => { window.location.href = '/masyarakat/formulir-laporan'; }}
      >
        <Keyboard size={20} />
        <span>Lapor Via Teks</span>
      </button>
      <button className="lapor-option-button">
        <Phone size={20} />
        <span>Telepon</span>
      </button>
    </div>
  </section>
);

// --- Komponen Pengganti _buildLayananSection ---
const LayananSection: React.FC = () => (
  <section className="layanan-section">
    <h2 className="layanan-title">Layanan</h2>
    <div className="layanan-grid">
      <ServiceButton icon={<Flame size={30} />} label={'Lapor\nKebakaran'} />
      <ServiceButton
        icon={<HelpCircle size={30} />}
        label={'Lapor Non\nKebakaran'}
      />
      <ServiceButton
        icon={<BarChart size={30} />}
        label={'Grafik\nKejadian'}
      />
      <ServiceButton icon={<Book size={30} />} label={'Daftar\nKunjungan'} />
      <ServiceButton icon={<School size={30} />} label={'Edukasi\nPublik'} />
      <ServiceButton
        icon={<Contact size={30} />} // PERBAIKAN 4 (penggunaan)
        label={'Kontak\nPetugas'}
      />
    </div>
  </section>
);

// --- Komponen Utama (Ganti nama menjadi MasyarakatDashboard) ---
const MasyarakatDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  // PERBAIKAN 3: Perbaiki tipe 'e'
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src =
      'https://via.placeholder.com/300x150?text=Gagal+Memuat';
  };

  // PERBAIKAN 3: Perbaiki tipe 'e'
  const handleLogoError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
    const fallbackIcon = e.currentTarget.nextSibling as HTMLElement;
    if (fallbackIcon) {
      fallbackIcon.style.display = 'block';
    }
  };

  return (
      <main className="main-content">
        <div className="main-wrapper">
          <div className="banner-container">
            {/* PERBAIKAN 2: Gunakan path root ( / ) */}
            <img
              src="/image.png"
              alt="Banner Damkar"
              className="banner-img"
              onError={handleImageError}
            />
          </div>
          <LaporSection />
          <LayananSection />
        </div>
      </main>
  );
};

export default MasyarakatDashboard; // Ganti nama export