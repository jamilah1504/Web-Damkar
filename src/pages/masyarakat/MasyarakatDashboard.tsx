import React, { SyntheticEvent, useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink, Link } from 'react-router-dom';
import axios from 'axios';

import {
  Flame,
  Phone,
  Keyboard,
  HelpCircle,
  BarChart,
  Book,
  Loader2,
  AlertTriangle,
  ArrowRightLeft,
  MapPin,
  // Icon sosmed dihapus dari sini karena sudah ada di dalam file Footer
} from 'lucide-react';

import LaporButton from 'components/LaporButton';
import MapCard from 'components/sections/dashboard/Home/Sales/MapCard/MapCard';

// IMPORT FOOTER DARI LAYOUT
import Footer from 'layouts/masyarakat-layout/footer';

// ======================================================
// === CONFIG & TYPES ===
// ======================================================

const apiClient = axios.create({ baseURL: 'http://localhost:5000/api' });
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300.png?text=Edukasi+Damkar';
const HERO_BG_IMAGE = '/bg.jpg';

interface EdukasiItem {
  id: number;
  judul: string;
  isiKonten: string;
  kategori: string;
  fileUrl: string | null;
  timestampDibuat: string;
}

const isImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

// ======================================================
// === 1. HERO SECTION ===
// ======================================================
type HeroSectionProps = {
  onTranscriptReceived: (transcript: string) => void;
};

const HeroSection: React.FC<HeroSectionProps> = ({ onTranscriptReceived }) => {
  const navigate = useNavigate();

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src =
      'https://images.unsplash.com/photo-1599933591460-264bcad66e89?auto=format&fit=crop&w=1920&q=80';
  };

  return (
    <section className="hero">
      {/* Background Layers */}
      <div className="hero-bg-container">
        <img
          src={HERO_BG_IMAGE}
          alt="Background Damkar"
          className="hero-bg-img"
          onError={handleImageError}
        />
        <div className="hero-overlay-white"></div>
        <div className="hero-overlay-gradient"></div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="badge">
          <span className="badge-dot" />
          Sistem Pelaporan Terintegrasi
        </div>

        <h1>
          Sistem Pelaporan Kebakaran
          <br />
          <span className="gradient">Real-Time</span>
        </h1>

        <p>
          Respons cepat, penanganan tepat. Lindungi komunitas Anda dengan teknologi pelaporan
          kebakaran dan penyelamatan terdepan.
        </p>

        <div className="cta-group">
          <LaporButton onTranscriptReceived={onTranscriptReceived} size="large" />

          <div className="secondary-buttons">
            <button className="btn-secondary" onClick={() => navigate('/formulir-laporan')}>
              <Keyboard size={22} />
              Lapor Via Teks
            </button>
            <button className="btn-secondary">
              <Phone size={22} />
              Panggilan Darurat 113
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ======================================================
// === 2. LAYANAN SECTION ===
// ======================================================
interface ServiceButtonProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick?: () => void;
  colorClass: string;
}

const ServiceButton: React.FC<ServiceButtonProps> = ({
  icon,
  label,
  desc,
  onClick,
  colorClass,
}) => (
  <button onClick={onClick} className={`service-btn ${colorClass}`}>
    <div className="service-icon-wrapper">{icon}</div>
    <div className="service-content">
      <span className="service-label">{label}</span>
      <span className="service-desc">{desc}</span>
    </div>
  </button>
);

const LayananSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="layanan-column">
      <div className="section-header">
        <h2 className="section-heading">Layanan Utama</h2>
        <p className="section-sub">Akses cepat layanan darurat & informasi</p>
      </div>
      <div className="layanan-grid-2x2">
        <ServiceButton
          onClick={() => navigate('/formulir-laporan')}
          icon={<Flame size={32} />}
          label="Lapor Kebakaran"
          desc="Penanganan segera insiden api"
          colorClass="btn-red"
        />
        <ServiceButton
          onClick={() => navigate('/formulir-laporan')}
          icon={<HelpCircle size={32} />}
          label="Penyelamatan"
          desc="Evakuasi & Hewan Liar"
          colorClass="btn-orange"
        />
        <ServiceButton
          icon={<BarChart size={32} />}
          label="Data Statistik"
          desc="Pantau grafik kejadian"
          colorClass="btn-blue"
        />
        <ServiceButton
          onClick={() => navigate('/daftar-kunjungan')}
          icon={<Book size={32} />}
          label="Edukasi"
          desc="Daftar kunjungan sosialisasi"
          colorClass="btn-green"
        />
      </div>
    </div>
  );
};

// ======================================================
// === 3. EDUKASI SECTION ===
// ======================================================
const EdukasiCard: React.FC<{ item: EdukasiItem; isActive?: boolean }> = ({ item, isActive }) => {
  return (
    <RouterLink
      to={`/edukasi/detail/${item.id}`}
      className={`edukasi-card ${isActive ? 'active' : ''}`}
    >
      <div className="card-image-wrapper">
        <img
          src={isImageUrl(item.fileUrl) ? item.fileUrl! : PLACEHOLDER_IMAGE}
          alt={item.judul}
          className="card-image"
        />
        <span className="card-category">{item.kategori}</span>
      </div>
      <div className="card-content">
        <h3 className="card-title">{item.judul}</h3>
        <div className="card-cta">
          Baca <ArrowRightLeft size={14} />
        </div>
      </div>
    </RouterLink>
  );
};

const EdukasiSection: React.FC<{ data: EdukasiItem[]; loading: boolean; error: string | null }> = ({
  data,
  loading,
  error,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderContent = () => {
    if (loading)
      return (
        <div className="status-display">
          <Loader2 className="icon-spin" size={32} />
          <p>Memuat...</p>
        </div>
      );
    if (error)
      return (
        <div className="status-display status-error">
          <AlertTriangle size={32} />
          <p>Gagal memuat</p>
        </div>
      );
    if (data.length === 0)
      return (
        <div className="status-display">
          <p>Tidak ada konten.</p>
        </div>
      );

    return (
      <div className="edukasi-slider-wrapper">
        <EdukasiCard item={data[activeIndex]} isActive />
        <div className="carousel-indicators">
          {data.slice(0, 5).map((_, index) => (
            <button
              key={index}
              className={`indicator-dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="edukasi-column">
      <div className="section-header-wrapper">
        <h2 className="section-heading">Terkini</h2>
        <Link to="/edukasi/list" className="see-all-link">
          Lihat Semua <ArrowRightLeft size={16} />
        </Link>
      </div>
      {renderContent()}
    </div>
  );
};

// ======================================================
// === 4. CONTAINER UTAMA (LAYOUT GRID) ===
// ======================================================
const MainContent: React.FC<{
  edukasiData: EdukasiItem[];
  loadingEdukasi: boolean;
  errorEdukasi: string | null;
}> = ({ edukasiData, loadingEdukasi, errorEdukasi }) => {
  return (
    <section className="main-content-section">
      <div className="boxed-container">
        {/* GRID LAYOUT: LAYANAN & EDUKASI */}
        <div className="content-grid-asymmetric">
          <LayananSection />
          <EdukasiSection data={edukasiData} loading={loadingEdukasi} error={errorEdukasi} />
        </div>

        {/* SECTION MAPS */}
        <div className="map-section-wrapper">
          <div className="section-header">
            <h2
              className="section-heading"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <MapPin size={24} style={{ color: 'var(--red)' }} />
              Peta Sebaran Kejadian
            </h2>
            <p className="section-sub">Pantau lokasi kejadian kebakaran dan penyelamatan terkini</p>
          </div>
          <div className="map-card-container">
            <MapCard />
          </div>
        </div>
      </div>
    </section>
  );
};

// ======================================================
// === 5. MAIN DASHBOARD COMPONENT ===
// ======================================================
const MasyarakatDashboard: React.FC = () => {
  const [edukasiList, setEdukasiList] = useState<EdukasiItem[]>([]);
  const [loadingEdukasi, setLoadingEdukasi] = useState(true);
  const [errorEdukasi, setErrorEdukasi] = useState<string | null>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEdukasi = async () => {
      try {
        setLoadingEdukasi(true);
        const response = await apiClient.get('/edukasi', { params: { limit: 5 } });
        if (response.data?.data) setEdukasiList(response.data.data);
        else setEdukasiList([]);
        setErrorEdukasi(null);
      } catch (err) {
        setErrorEdukasi('Gagal mengambil data.');
        console.error(err);
      } finally {
        setLoadingEdukasi(false);
      }
    };
    fetchEdukasi();
  }, []);

  // Particles Effect
  useEffect(() => {
    const c = particlesRef.current;
    if (!c) return;
    c.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 15}s`;
      p.style.animationDuration = `${12 + Math.random() * 8}s`;
      c.appendChild(p);
    }
  }, []);

  return (
    <div className="dashboard-wrapper">
      <style jsx>{`
        :root {
          --red: #d32f2f;
          --red-soft: #fef2f2;
          --orange: #f97316;
          --orange-soft: #fff7ed;
          --blue: #2563eb;
          --blue-soft: #eff6ff;
          --green: #16a34a;
          --green-soft: #f0fdf4;
          --text-dark: #1e293b;
          --text-gray: #64748b;
          --bg-page: #f8fafc;
          /* Footer BG Variable dihapus karena sudah dihandle di component footer */
        }

        .dashboard-wrapper {
          background-color: var(--bg-page);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: system-ui, sans-serif;
        }
        .boxed-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* PARTICLES */
        .particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.07;
        }
        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: var(--orange);
          border-radius: 50%;
          animation: float 15s infinite linear;
        }
        @keyframes float {
          from {
            transform: translateY(100vh);
            opacity: 0;
          }
          to {
            transform: translateY(-100px) translateX(80px);
            opacity: 1;
          }
        }

        /* HERO SECTION */
        .hero {
          position: relative;
          min-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 6rem 1rem 4rem;
          margin-bottom: 2rem;
          overflow: hidden;
        }
        .hero-bg-container {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hero-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-overlay-white {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(2px);
        }
        .hero-overlay-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(211, 47, 47, 0.08), transparent 70%);
        }
        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 1000px;
          margin: 0 auto;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(211, 47, 47, 0.12);
          color: var(--red);
          padding: 0.5rem 1.2rem;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        .badge-dot {
          width: 8px;
          height: 8px;
          background: var(--red);
          border-radius: 50%;
        }
        h1 {
          font-size: clamp(2.8rem, 7vw, 4.8rem);
          font-weight: 900;
          line-height: 1.1;
          margin: 1rem 0 1.5rem;
          color: #1a1a1a;
        }
        .gradient {
          background: linear-gradient(135deg, var(--red), var(--orange));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero p {
          font-size: 1.2rem;
          color: var(--gray);
          max-width: 700px;
          margin: 0 auto 3rem;
          line-height: 1.7;
        }

        .cta-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.8rem;
        }
        .secondary-buttons {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem 2.2rem;
          background: #fff;
          border: 2px solid var(--red);
          color: var(--red);
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s;
          min-width: 230px;
          justify-content: center;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: var(--red);
          color: #fff;
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(211, 47, 47, 0.15);
        }

        /* MAIN CONTENT */
        .main-content-section {
          margin-top: 1rem;
          flex: 1;
          position: relative;
          z-index: 2;
        }
        .content-grid-asymmetric {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .section-header {
          margin-bottom: 1.5rem;
        }
        .section-heading {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 0.2rem;
        }
        .section-sub {
          font-size: 0.95rem;
          color: var(--text-gray);
        }

        /* Layanan */
        .layanan-grid-2x2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
        }
        .service-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 1.5rem;
          background: white;
          border-radius: 20px;
          border: 1px solid transparent;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }
        .service-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
        }
        .service-icon-wrapper {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .service-label {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 0.2rem;
        }
        .service-desc {
          display: block;
          font-size: 0.85rem;
          color: var(--text-gray);
        }

        .btn-red .service-icon-wrapper {
          background: var(--red-soft);
          color: var(--red);
        }
        .btn-red:hover {
          border-color: var(--red-soft);
        }
        .btn-orange .service-icon-wrapper {
          background: var(--orange-soft);
          color: var(--orange);
        }
        .btn-orange:hover {
          border-color: var(--orange-soft);
        }
        .btn-blue .service-icon-wrapper {
          background: var(--blue-soft);
          color: var(--blue);
        }
        .btn-blue:hover {
          border-color: var(--blue-soft);
        }
        .btn-green .service-icon-wrapper {
          background: var(--green-soft);
          color: var(--green);
        }
        .btn-green:hover {
          border-color: var(--green-soft);
        }

        /* Edukasi */
        .edukasi-column {
          background: white;
          padding: 1.5rem;
          border-radius: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .section-header-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .section-header-wrapper .section-heading {
          margin: 0;
          font-size: 1.3rem;
        }
        .see-all-link {
          font-size: 0.85rem;
          color: var(--red);
          font-weight: 600;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .edukasi-slider-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .edukasi-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }
        .card-image-wrapper {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
          border-radius: 16px;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        .edukasi-card:hover .card-image {
          transform: scale(1.05);
        }
        .card-category {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--red);
          text-transform: uppercase;
        }
        .card-content {
          margin-top: 1rem;
        }
        .card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .card-cta {
          font-size: 0.85rem;
          color: var(--text-gray);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .carousel-indicators {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }
        .indicator-dot.active {
          width: 24px;
          border-radius: 10px;
          background: var(--red);
        }
        .status-display {
          text-align: center;
          padding: 2rem;
          color: #94a3b8;
        }
        .icon-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Maps */
        .map-section-wrapper {
          background: white;
          padding: 2rem;
          border-radius: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
          margin-top: 2rem;
        }
        .map-card-container {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #f1f5f9;
          min-height: 450px;
          position: relative;
        }

        @media (max-width: 900px) {
          .content-grid-asymmetric {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .layanan-grid-2x2 {
            grid-template-columns: 1fr;
          }
          .hero p {
            font-size: 1rem;
          }
          .btn-secondary {
            width: 100%;
          }
        }
      `}</style>

      <div className="particles" ref={particlesRef} />

      {/* ROW 1: HERO SECTION */}
      <HeroSection onTranscriptReceived={(val) => console.log(val)} />

      {/* ROW 2: KONTEN UTAMA */}
      <MainContent
        edukasiData={edukasiList}
        loadingEdukasi={loadingEdukasi}
        errorEdukasi={errorEdukasi}
      />

      {/* ROW 3: FOOTER (IMPORT) */}
      <Footer />
    </div>
  );
};

export default MasyarakatDashboard;
