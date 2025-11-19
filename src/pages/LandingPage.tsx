import MasyarakatLayout from 'layouts/masyarakat-layout';
// Layout mengikuti deskripsi detail: Boxed-width dengan hero full-width
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link as RouterLink, Link } from 'react-router-dom';
import axios from 'axios';
import LaporButton from '../components/LaporButton'; // <- BARU: Impor LaporButton

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

      <div className='lapor-floating-wrapper-landing'>
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

const LayananSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="layanan-column">
      <h2 className="section-heading">Layanan</h2>
      
      {/* Grid 2x2 untuk 4 tombol pertama */}
      <div className="layanan-grid-2x2">
        
        {/* Tombol Lapor Kebakaran */}
        <ServiceButton 
          onClick={() => navigate('/formulir-laporan', { 
            state: { 
              formData: { // Struktur sesuai permintaan
                jenisKejadian: 'Kebakaran' 
              }
            }
          })}
          icon={<Flame size={36} />} 
          label="Lapor Kebakaran" 
        />

        {/* Tombol Lapor Non Kebakaran */}
        <ServiceButton
          onClick={() => navigate('/formulir-laporan', { 
            state: { 
              formData: { // Struktur sesuai permintaan
                jenisKejadian: 'Non Kebakaran' 
              }
            }
          })}
          icon={<HelpCircle size={36} />}
          label="Lapor Non Kebakaran"
        />

        {/* Tombol Lainnya (Tetap sama atau sesuaikan jika perlu) */}
        <ServiceButton
          onClick={() => navigate('/grafik')} // Asumsi ada routenya
          icon={<BarChart size={36} />}
          label="Grafik Kejadian"
        />
        
        <ServiceButton 
          onClick={() => navigate('/daftar-kunjungan')} // Asumsi ada routenya
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
      to={`/edukasi/detail/${item.id}`} 
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
        <Link to="/edukasi/list" className="see-all-link">
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

// Komponen utama untuk halaman Firewatch
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
    // Smooth scrolling untuk link navigasi
    const anchors = document.querySelectorAll('a[href^="#"]');
    const handleAnchorClick = (e: Event) => {
      e.preventDefault();
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
      const target = href ? document.querySelector(href) : null;
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };
    anchors.forEach(anchor => anchor.addEventListener('click', handleAnchorClick));

    // Efek ripple pada tombol
    const buttons = document.querySelectorAll('.btn');
    const handleBtnMouseEnter = (e: MouseEvent) => {
        const btn = e.currentTarget as HTMLElement;
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.width = '100%';
        ripple.style.height = '100%';
        ripple.style.top = '0';
        ripple.style.left = '0';
        ripple.style.background = 'rgba(255,255,255,0.3)';
        ripple.style.borderRadius = '50px';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    };
    buttons.forEach(btn => btn.addEventListener('mouseenter', handleBtnMouseEnter as EventListener));


    // Intersection Observer untuk animasi saat scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animation = 'fadeInUp 0.6s ease forwards';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    document.querySelectorAll('.feature-card, .stat-item, .step').forEach(el => observer.observe(el));

    // Cleanup function untuk menghapus event listeners saat komponen unmount
    return () => {
      anchors.forEach(anchor => anchor.removeEventListener('click', handleAnchorClick));
      buttons.forEach(btn => btn.removeEventListener('mouseenter', handleBtnMouseEnter as EventListener));
      observer.disconnect();
    };
  }, []);


  return (
    <MasyarakatLayout>
      {/* Semua CSS dari file asli disisipkan di sini */}
      <style>{`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-red: #ef4444;
            --primary-orange: #fb923c;
            --dark-bg: #0a0a0a;
            --dark-card: #171717;
            --text-primary: #ffffff;
            --text-secondary: #a3a3a3;
            --drawer-width: 278px;
            --gradient: linear-gradient(135deg, #ef4444, #fb923c);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--dark-bg);
            color: var(--text-primary);
            overflow-x: hidden;
            position: relative;
        }

        /* Animated Background */
        .fire-particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.1;
        }

        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--primary-orange);
            border-radius: 50%;
            animation: float-up 10s infinite linear;
        }

        @keyframes float-up {
            0% {
                transform: translateY(100vh) translateX(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) translateX(100px);
                opacity: 0;
            }
        }

        /* Hero Section */
        .hero {
            min-height: 75vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            position: relative;
            background: radial-gradient(ellipse at top, rgba(239, 68, 68, 0.1), transparent 50%);
        }

        .hero-content {
            max-width: 1200px;
            width: 100%;
            text-align: center;
            animation: fadeInUp 1s ease;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .hero h1 {
            font-size: clamp(2.5rem, 8vw, 5rem);
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, #fff 0%, #ef4444 50%, #fb923c 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 3s infinite linear;
            background-size: 200% auto;
        }

        @keyframes shimmer {
            0% {
                background-position: 0% center;
            }
            100% {
                background-position: 200% center;
            }
        }

        .hero p {
            font-size: 1.25rem;
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto 2rem;
            animation: fadeInUp 1s ease 0.2s both;
        }


        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .section-title {
            text-align: center;
            margin-bottom: 3rem;
        }

        .section-title h2 {
            font-size: clamp(2rem, 5vw, 3rem);
            font-weight: 800;
            margin-bottom: 1rem;
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        @keyframes rotate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        /* Loading Animation */
        .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeOut 0.5s ease 1s forwards;
        }

        @keyframes fadeOut {
            to {
                opacity: 0;
                pointer-events: none;
            }
        }

        .fire-loader {
            width: 80px;
            height: 80px;
            position: relative;
        }

        .fire-loader::before,
        .fire-loader::after {
            content: '🔥';
            position: absolute;
            font-size: 40px;
            animation: fire-dance 0.5s infinite alternate;
        }

        .fire-loader::after {
            left: 30px;
            animation-delay: 0.25s;
        }

        @keyframes fire-dance {
            0% {
                transform: translateY(0) scale(1);
            }
            100% {
                transform: translateY(-10px) scale(1.1);
            }
        }
        
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
      `}</style>
      
      {/* Loading Screen */}
      <div className="loading-screen">
        <div className="fire-loader"></div>
      </div>

      {/* Animated Background */}
      <div className="fire-particles" ref={particlesContainerRef}></div>

      

      {/* Hero Section */}
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