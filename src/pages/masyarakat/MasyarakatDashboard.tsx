// Layout mengikuti deskripsi detail: Boxed-width dengan hero full-width
import React, { SyntheticEvent, useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, Link } from 'react-router-dom';
import axios from 'axios';

import {
  Mic,
  Keyboard,
  Phone,
  Flame,
  HelpCircle,
  BarChart,
  Book,
  Loader2,
  AlertTriangle,
  ArrowRightLeft,
} from 'lucide-react';
import LaporButton from 'components/LaporButton';
import MapCard from 'components/sections/dashboard/Home/Sales/MapCard/MapCard';
import { Grid } from '@mui/material';


// ======================================================
// === DEFINISI TIPE DAN API CLIENT ===
// ======================================================

interface EdukasiItem {
  id: number;
  judul: string;
  isiKonten: string;
  kategori: string;
  fileUrl: string | null;
  timestampDibuat: string;
}

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

const isImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300.png?text=Edukasi+Damkar';

type HeroSectionProps = {
  onTranscriptReceived: (transcript: string) => void;
};
const HeroSection: React.FC<HeroSectionProps> = ({ onTranscriptReceived }) => {
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/1920x400?text=Hero+Banner+Damkar';
  };
  
  return (
    <section className="hero-section">
      {/* Lapisan Latar Belakang */}
      <div className="hero-background">
        <img
          src="/image.png"
          alt="Hero Banner Damkar"
          className="hero-bg-image"
          onError={handleImageError}
        />
      </div>
      <div className='lapor-floating-wrapper'>
        <LaporButton onTranscriptReceived={onTranscriptReceived} />
      </div>

    </section>
  );
};



// ======================================================
// === ROW 3: TOMBOL AKSI SEKUNDER ===
// ======================================================

const SecondaryActions: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="secondary-actions">
      <div className="boxed-container">
        <div className="actions-flex">
          {/* Tombol Kiri */}
          <button 
            className="action-btn action-btn-teks"
            onClick={() => navigate('/formulir-laporan')}
          >
            <Keyboard size={20} />
            <span>Lapor Via Teks</span>
          </button>
          
          {/* Tombol Kanan */}
          <button className="action-btn action-btn-telepon">
            <Phone size={20} />
            <span>Telepon</span>
          </button>
        </div>
      </div>
    </section>
  );
};

// ======================================================
// === ROW 4: KONTEN UTAMA (LAYANAN & EDUKASI) ===
// ======================================================

// Komponen Service Button untuk Grid 2x2
interface ServiceButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const ServiceButton: React.FC<ServiceButtonProps> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="service-btn">
    <div className="service-icon-wrapper">{icon}</div>
    <span className="service-text">{label}</span>
  </button>
);

// 4a. Kolom Kiri: Section Layanan
const LayananSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="layanan-column">
      <h2 className="section-heading">Layanan</h2>
      
      {/* Grid 2x2 untuk 4 tombol pertama */}
      <div className="layanan-grid-2x2">
        <ServiceButton 
          onClick={() => navigate('/formulir-laporan')}
          icon={<Flame size={36} />} 
          label="Lapor Kebakaran" 
        />
        <ServiceButton
          onClick={() => navigate('/formulir-laporan')}
          icon={<HelpCircle size={36} />}
          label="Lapor Non Kebakaran"
        />
        <ServiceButton
          icon={<BarChart size={36} />}
          label="Grafik Kejadian"
        />
        <ServiceButton 
          onClick={() => navigate('/daftar-kunjungan')}
          icon={<Book size={36} />} 
          label="Daftar Kunjungan" 
        />
      </div>
    </div>
  );
};

// 4b. Kolom Kanan: Section Materi Edukasi
const EdukasiCard: React.FC<{ item: EdukasiItem; isActive?: boolean }> = ({ item, isActive }) => {
  return (
    <RouterLink 
      to={`/masyarakat/edukasi/detail/${item.id}`} 
      className={`edukasi-card ${isActive ? 'active' : ''}`}
    > 
      <h3 className="card-title">{item.judul}</h3>
      
      <div className="card-image-wrapper">
        <img
          src={isImageUrl(item.fileUrl) ? item.fileUrl! : PLACEHOLDER_IMAGE}
          alt={item.judul}
          className="card-image"
        />
      </div>
    </RouterLink>
  );
};

interface EdukasiSectionProps {
  data: EdukasiItem[];
  loading: boolean;
  error: string | null;
}

const EdukasiSection: React.FC<EdukasiSectionProps> = ({ data, loading, error }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="status-display">
          <Loader2 className="icon-spin" size={40} />
          <p>Memuat konten edukasi...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="status-display status-error">
          <AlertTriangle size={40} />
          <p>{error}</p>
        </div>
      );
    }
    
    if (data.length === 0) {
      return (
        <div className="status-display">
          <p>Belum ada konten edukasi.</p>
        </div>
      );
    }

    return (
      <>
        <EdukasiCard item={data[activeIndex]} isActive />
        
        {/* Indikator Slider (3 titik) */}
        <div className="carousel-indicators">
          {data.slice(0, 3).map((_, index) => (
            <button
              key={index}
              className={`indicator-dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="edukasi-column">
      <div className="section-header-wrapper">
        <h2 className="section-heading">Materi Edukasi</h2>
        
        {/* BARU: Link "Lihat Semua" dengan panah */}
        <Link to="/masyarakat/edukasi/list" className="see-all-link">
          <span>Lihat Semua</span>
          <ArrowRightLeft size={18} />
        </Link>
      </div>
      {renderContent()}
    </div>
  );
};

// Container untuk Row 4 (Grid Asimetris)
const MainContent: React.FC<{
  edukasiData: EdukasiItem[];
  loadingEdukasi: boolean;
  errorEdukasi: string | null;
}> = ({ edukasiData, loadingEdukasi, errorEdukasi }) => {
  return (
    <section className="main-content">
      <div className="boxed-container">
        <div className="content-grid-asymmetric">
          {/* Kolom Kiri (60-70%) */}
          <LayananSection />
          
          {/* Kolom Kanan (30-40%) */}
          <EdukasiSection 
            data={edukasiData}
            loading={loadingEdukasi}
            error={errorEdukasi}
          />
        </div>
      </div>
    </section>
  );
};

// ======================================================
// === KOMPONEN UTAMA: MASYARAKAT DASHBOARD ===
// ======================================================

const MasyarakatDashboard: React.FC = () => {
  const [edukasiList, setEdukasiList] = useState<EdukasiItem[]>([]);
  const [loadingEdukasi, setLoadingEdukasi] = useState(true);
  const [errorEdukasi, setErrorEdukasi] = useState<string | null>(null);

  useEffect(() => {
    const fetchEdukasi = async () => {
      try {
        setLoadingEdukasi(true);
        const response = await apiClient.get('/edukasi', {
          params: { limit: 5 }
        });
        
        if (response.data && response.data.data) {
          setEdukasiList(response.data.data);
        } else {
          setEdukasiList([]);
        }
        setErrorEdukasi(null);
      } catch (err) {
        setErrorEdukasi('Gagal mengambil data edukasi.');
        console.error(err);
      } finally {
        setLoadingEdukasi(false);
      }
    };

    fetchEdukasi();
  }, []);

  return (
    <div className="dashboard-wrapper">
      
      {/* ROW 2: Hero Section */}
      <HeroSection />
      
      {/* ROW 3: Tombol Aksi Sekunder */}
      <SecondaryActions />
      
      {/* ROW 4: Konten Utama */}
      <MainContent 
        edukasiData={edukasiList}
        loadingEdukasi={loadingEdukasi}
        errorEdukasi={errorEdukasi}
      />
      <MapCard/>
    </div>
  );
};

export default MasyarakatDashboard;
