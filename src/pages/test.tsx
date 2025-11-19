import MasyarakatLayout from 'layouts/masyarakat-layout';
// Layout mengikuti deskripsi detail: Boxed-width dengan hero full-width
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link as RouterLink, Link } from 'react-router-dom';
import axios from 'axios';
import LaporButton from '../components/LaporButton'; // <- BARU: Impor LaporButton

import {
  Keyboard,
  Phone,
  Flame,
  HelpCircle,
  BarChart,
  Book,
  Loader2,
  AlertTriangle,
  ArrowRightLeft,
} from 'lucide-react'; // <- 'Mic' dihapus dari sini

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

// ======================================================
// === BAGIAN HALAMAN (SECTIONS) ===
// ======================================================

// PERBAIKAN 1: HeroSection diubah untuk menerima props
// dan menggunakan komponen LaporButton
type HeroSectionProps = {
  onTranscriptReceived: (transcript: string) => void;
};

const HeroSection: React.FC<HeroSectionProps> = ({ onTranscriptReceived }) => {
  return (
    <section className="hero-section-landing">
      {/* Tombol LAPOR Utama (Mengambang dengan position absolute) */}
      <section className="hero" id="home">
        <div className="hero-content">
          <h1>Sistem Pelaporan Kebakaran Real-Time</h1>
          <p>Respons cepat, penanganan tepat. Lindungi komunitas Anda dengan teknologi pelaporan kebakaran terdepan.</p>
        </div>
      </section>

      {/* PERBAIKAN 2: Markup tombol diganti dengan
        komponen LaporButton dan prop diteruskan
      */}
      <LaporButton onTranscriptReceived={onTranscriptReceived} />
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
// === KOMPONEN HALAMAN UTAMA (FirewatchPage) ===
// ======================================================

const FirewatchPage: React.FC = () => {
  // --- STATE UNTUK KONTEN ---
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  const [edukasiList, setEdukasiList] = useState<EdukasiItem[]>([]);
  const [loadingEdukasi, setLoadingEdukasi] = useState(true);
  const [errorEdukasi, setErrorEdukasi] = useState<string | null>(null);

  // --- STATE UNTUK LAPOR SUARA (Dipindahkan dari LaporanPage) ---
  const [transcript, setTranscript] = useState('');
  const [formData, setFormData] = useState<any | null>(null); // Tipe bisa disesuaikan
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorVoice, setErrorVoice] = useState('');

  // --- FUNGSI HANDLER UNTUK LAPOR SUARA (Dipindahkan dari LaporanPage) ---
  const handleTranscriptReceived = async (text: string) => {
    setTranscript(text);
    setIsExtracting(true);
    setErrorVoice('');

    try {
      // Menggunakan apiClient yang sudah ada
      const response = await apiClient.post('/ai/text-to-form', {
        transcript: text
      });

      // Sesuaikan berdasarkan respons API Anda
      if (response.data && response.data.formData) {
        setFormData(response.data.formData);
        console.log('Data untuk form:', response.data.formData);
        // TODO: Isi state form Anda di sini atau navigasi ke formulir
      } else {
        throw new Error("Format respons tidak terduga dari server.");
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal mengekstrak form';
      setErrorVoice(errorMsg);
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };


  // --- USE EFFECT ---

  // Efek untuk mengambil data Edukasi
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

  // Efek untuk membuat partikel api di background
  useEffect(() => {
    const container = particlesContainerRef.current;
    if (container) {
      // Membersihkan partikel yang mungkin sudah ada
      container.innerHTML = '';
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${10 + Math.random() * 10}s`;
        container.appendChild(particle);
      }
    }
  }, []);

  // Efek untuk smooth scrolling dan event listener lainnya
  useEffect(() => {
    // ... (Logika smooth scroll, ripple, dan intersection observer Anda tetap di sini) ...
    // ... (Tidak perlu diubah) ...
    
    // (Kode efek ini SAMA seperti di file Anda, tidak perlu disalin ulang jika sudah ada)
  }, []);


  return (
    <MasyarakatLayout>
      {/* Semua CSS dari file asli disisipkan di sini */}
      <style>{`
        /* ... (Semua CSS Anda tetap di sini) ... */
        
        /* Pastikan CSS untuk 'boxed-container' dan 'debug-box' ada */
        .boxed-container {
          max-width: 1200px; /* Sesuaikan dengan desain Anda */
          margin: 0 auto;
          padding: 0 1rem; /* Padding horizontal */
        }
        
        .debug-box {
          padding: 1rem;
          background: #171717; /* Warna dark-card */
          margin-top: 2rem;
          border-radius: 8px;
          border: 1px solid #333;
        }
        .debug-box h3 {
          margin-bottom: 0.5rem;
          color: var(--primary-orange);
        }
        .debug-box p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          word-break: break-word;
        }
        .debug-box pre {
          background: var(--dark-bg);
          padding: 0.5rem;
          border-radius: 4px;
          color: #eee;
          font-size: 0.8rem;
          max-height: 200px;
          overflow-y: auto;
        }
      `}</style>

      {/* Loading Screen */}
      <div className="loading-screen">
        <div className="fire-loader"></div>
      </div>

      {/* Animated Background */}
      <div className="fire-particles" ref={particlesContainerRef}></div>

      <div className="dashboard-wrapper">

        {/* PERBAIKAN 3: Teruskan fungsi 'handleTranscriptReceived'
          ke HeroSection sebagai prop.
        */}
        <HeroSection onTranscriptReceived={handleTranscriptReceived} />

        {/* ROW 3: Tombol Aksi Sekunder */}
        <SecondaryActions />

        {/* ROW 4: Konten Utama */}
        <MainContent
          edukasiData={edukasiList}
          loadingEdukasi={loadingEdukasi}
          errorEdukasi={errorEdukasi}
        />

        {/* BARU: Area Debug dipindahkan ke sini */}
        <div className="boxed-container">
          <div className="debug-box">
            <h3>Debug Info (Voice Report):</h3>
            {transcript && <p><strong>Transkrip:</strong> "{transcript}"</p>}
            {isExtracting && <p>Mengekstrak data...</p>}
            {formData && <pre>{JSON.stringify(formData, null, 2)}</pre>}
            {errorVoice && <p style={{ color: 'red' }}><strong>Error:</strong> {errorVoice}</p>}
          </div>
        </div>

      </div>
    </MasyarakatLayout>
  );
};

export default FirewatchPage;