import React, { useState, useRef, useEffect, SyntheticEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import LaporButton from '../components/LaporButton';
import MasyarakatLayout from 'layouts/masyarakat-layout';

// Import Footer dari file yang baru dipisah
import Footer from 'layouts/masyarakat-layout/footer';

import {
  Flame,
  Phone,
  Keyboard,
  HelpCircle,
  BarChart,
  Book,
  ShieldCheck,
  Clock,
  MapPin,
  PhoneCall,
  ArrowRightLeft,
  Loader2,
} from 'lucide-react';

// =========================================================
// CONFIG & TYPES
// =========================================================
const apiClient = axios.create({ baseURL: 'http://localhost:5000/api' });

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/800x500.png?text=Tidak+Ada+Gambar';
// Gunakan gambar background yang sama
const HERO_BG_IMAGE = '/bg.jpg';

interface EdukasiItem {
  id: number;
  judul: string;
  isiKonten: string;
  kategori: string;
  fileUrl: string | null;
  timestampDibuat: string;
}

const FirewatchPage: React.FC = () => {
  const navigate = useNavigate();
  const particlesRef = useRef<HTMLDivElement>(null);

  // State Management
  const [edukasiList, setEdukasiList] = useState<EdukasiItem[]>([]);
  const [loadingEdu, setLoadingEdu] = useState<boolean>(true);
  const [activeEdu, setActiveEdu] = useState<number>(0);

  // Handle Error Gambar Background
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src =
      'https://images.unsplash.com/photo-1599933591460-264bcad66e89?auto=format&fit=crop&w=1920&q=80';
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingEdu(true);
        const res = await apiClient.get('/edukasi', { params: { limit: 5 } });
        const data = res.data?.data || [];
        setEdukasiList(data);
        if (data.length > 0) setActiveEdu(0);
      } catch (err) {
        console.error('Gagal mengambil edukasi:', err);
        setEdukasiList([]);
      } finally {
        setLoadingEdu(false);
      }
    };
    fetchData();
  }, []);

  // Particles
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

  const handleVoiceReport = (transcript: string) => {
    console.log('Laporan suara:', transcript);
  };

  return (
    <MasyarakatLayout>
      <style jsx>{`
        /* ==== ROOT VARIABLES ==== */
        :root {
          --red: #d32f2f;
          --red-soft: #fee2e2;
          --orange: #f57c00;
          --orange-soft: #ffedd5;
          --blue: #2563eb;
          --blue-soft: #dbeafe;
          --green: #16a34a;
          --green-soft: #dcfce7;
          --gray: #555;
          --text-dark: #1f2937;
        }

        /* RESET & DEFAULTS */
        *,
        *::before,
        *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html,
        body,
        #root,
        [data-testid='layout'],
        main,
        .main-content,
        [class*='container'] > div:first-child {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        body {
          background: #fff;
          font-family: system-ui, -apple-system, sans-serif;
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

        /* =========================================
           HERO SECTION (UPDATED WITH BG)
           ========================================= */
        .hero {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 6rem 1rem 4rem;
          overflow: hidden;
        }

        /* BG Container */
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
        /* Overlay agar teks terbaca */
        .hero-overlay-white {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.9); /* Putih transparan 90% */
          backdrop-filter: blur(2px);
        }
        .hero-overlay-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(211, 47, 47, 0.08), transparent 70%);
        }

        /* Hero Content */
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

        /* INFO SECTION */
        .info-section {
          padding: 6rem 1rem;
          background: #fff;
          border-top: 1px solid #eee;
        }
        .info-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 2.5rem;
        }
        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.5rem;
          background: #ffffff;
          border: 1px solid #f0f0f0;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transition: transform 0.3s ease;
        }
        .stat:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
        }
        .icon-bg {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(211, 47, 47, 0.08);
          color: var(--red);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .stat strong {
          display: block;
          font-size: 1.1rem;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }
        .stat span {
          font-size: 0.9rem;
          color: #888;
        }

        /* LAYANAN SECTION */
        .layanan {
          padding: 5rem 1rem;
          background-color: #f8fafc;
        }
        .layanan .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .layanan-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .svc-btn {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.8rem;
          border: 1px solid rgba(0, 0, 0, 0.05);
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          width: 100%;
        }
        .svc-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border-color: rgba(0, 0, 0, 0.08);
        }
        .svc-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .svc-btn:hover .svc-icon {
          transform: scale(1.1) rotate(5deg);
        }
        .svc-btn.red .svc-icon {
          background: var(--red-soft);
          color: var(--red);
        }
        .svc-btn.orange .svc-icon {
          background: var(--orange-soft);
          color: var(--orange);
        }
        .svc-btn.blue .svc-icon {
          background: var(--blue-soft);
          color: var(--blue);
        }
        .svc-btn.green .svc-icon {
          background: var(--green-soft);
          color: var(--green);
        }
        .svc-text {
          flex: 1;
        }
        .svc-text strong {
          display: block;
          font-size: 1.15rem;
          margin-bottom: 0.35rem;
          color: var(--text-dark);
          font-weight: 700;
        }
        .svc-text span {
          display: block;
          font-size: 0.92rem;
          color: #64748b;
          line-height: 1.4;
        }

        /* EDUKASI SECTION */
        .edukasi {
          padding: 5rem 1rem;
          background: #fff;
        }
        .edukasi .container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .edu-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2.5rem;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 1.5rem;
        }
        .edu-card {
          background: #fff;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .edu-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(211, 47, 47, 0.15);
          border-color: rgba(211, 47, 47, 0.2);
        }
        .edu-img-wrapper {
          position: relative;
          width: 100%;
          height: 320px;
          overflow: hidden;
        }
        .edu-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .edu-card:hover .edu-img {
          transform: scale(1.05);
        }
        .edu-tag {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          color: var(--red);
          padding: 0.5rem 1.2rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .edu-body {
          padding: 2rem;
          position: relative;
          z-index: 2;
          background: #fff;
        }
        .edu-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        .edu-footer {
          margin-top: 1rem;
          color: var(--red);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          transition: gap 0.3s ease;
        }
        .edu-card:hover .edu-footer {
          gap: 0.8rem;
        }
        .edu-dots {
          display: flex;
          justify-content: center;
          gap: 0.6rem;
          margin-top: 2.5rem;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 20px;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }
        .dot.active {
          background: var(--red);
          width: 32px;
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .edu-img-wrapper {
            height: 250px;
          }
          .edu-title {
            font-size: 1.35rem;
          }
        }
        @media (max-width: 640px) {
          .secondary-buttons {
            flex-direction: column;
            align-items: center;
          }
          .btn-secondary {
            width: 100%;
            max-width: 300px;
          }
          .layanan-grid {
            grid-template-columns: 1fr;
          }
          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="particles" ref={particlesRef} />

      {/* HERO SECTION (DENGAN BACKGROUND) */}
      <section className="hero">
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
            <LaporButton onTranscriptReceived={handleVoiceReport} size="large" />
            <div className="secondary-buttons">
              <button className="btn-secondary" onClick={() => navigate('/formulir-laporan')}>
                <Keyboard size={22} /> Lapor Via Teks
              </button>
              <button className="btn-secondary">
                <Phone size={22} /> Panggilan Darurat 113
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INFO INSTANSI */}
      <section className="info-section">
        <div className="info-grid">
          <div>
            <span
              style={{
                color: 'var(--red)',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '1px',
              }}
            >
              TENTANG KAMI
            </span>
            <h2 style={{ fontSize: '2.6rem', margin: '1rem 0', fontWeight: 900 }}>
              Damkar Kabupaten Subang
            </h2>
            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: '1.7',
                color: '#555',
                marginBottom: '2rem',
              }}
            >
              Berdedikasi melindungi nyawa, harta benda, dan lingkungan warga Kabupaten Subang. Siap
              siaga 24 jam untuk segala kedaruratan kebakaran dan penyelamatan.
            </p>
            <div className="stats">
              <div className="stat">
                <div className="icon-bg">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <strong>Profesional</strong>
                  <span>Tim Terlatih</span>
                </div>
              </div>
              <div className="stat">
                <div className="icon-bg">
                  <Clock size={28} />
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Siaga Penuh</span>
                </div>
              </div>
              <div className="stat">
                <div className="icon-bg">
                  <MapPin size={28} />
                </div>
                <div>
                  <strong>Cepat</strong>
                  <span>Respon Lokasi</span>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            }}
          >
            <img
              src="https://wallpaperaccess.com/full/15739317.jpg"
              alt="Tim Damkar Subang"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* LAYANAN PUBLIK */}
      <section className="layanan">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '2.4rem',
                fontWeight: 900,
                marginBottom: '.5rem',
                color: '#1e293b',
              }}
            >
              Layanan Publik
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
              Akses cepat ke layanan utama Damkar Kabupaten Subang
            </p>
          </div>

          <div className="layanan-grid">
            <button
              className="svc-btn red"
              onClick={() =>
                navigate('/formulir-laporan', {
                  state: { formData: { jenisKejadian: 'Kebakaran' } },
                })
              }
            >
              <div className="svc-icon">
                <Flame size={32} strokeWidth={2.5} />
              </div>
              <div className="svc-text">
                <strong>Lapor Kebakaran</strong>
                <span>Insiden api & kebakaran</span>
              </div>
            </button>

            <button
              className="svc-btn orange"
              onClick={() =>
                navigate('/formulir-laporan', {
                  state: { formData: { jenisKejadian: 'Non Kebakaran' } },
                })
              }
            >
              <div className="svc-icon">
                <HelpCircle size={32} strokeWidth={2.5} />
              </div>
              <div className="svc-text">
                <strong>Penyelamatan</strong>
                <span>Hewan liar, evakuasi, dll</span>
              </div>
            </button>

            <button className="svc-btn blue" onClick={() => navigate('/grafik')}>
              <div className="svc-icon">
                <BarChart size={32} strokeWidth={2.5} />
              </div>
              <div className="svc-text">
                <strong>Data Statistik</strong>
                <span>Grafik kejadian bulanan</span>
              </div>
            </button>

            <button className="svc-btn green" onClick={() => navigate('/daftar-kunjungan')}>
              <div className="svc-icon">
                <Book size={32} strokeWidth={2.5} />
              </div>
              <div className="svc-text">
                <strong>Edukasi & Kunjungan</strong>
                <span>Sosialisasi dan pendaftaran</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* EDUKASI */}
      <section className="edukasi">
        <div className="container">
          <div className="edu-header">
            <div>
              <h2
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  marginBottom: '.5rem',
                  color: '#1e293b',
                }}
              >
                Pusat Edukasi
              </h2>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                Artikel & Tips Keselamatan Kebakaran
              </p>
            </div>
            <Link
              to="/edukasi/list"
              style={{
                color: 'var(--red)',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
                background: 'var(--red-soft)',
                padding: '0.6rem 1.2rem',
                borderRadius: '50px',
              }}
            >
              Lihat Semua <ArrowRightLeft size={18} />
            </Link>
          </div>

          {loadingEdu ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <Loader2
                size={48}
                style={{ color: 'var(--red)', animation: 'spin 1s linear infinite' }}
              />
            </div>
          ) : edukasiList.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', fontSize: '1.1rem' }}>
              Belum ada konten edukasi.
            </p>
          ) : (
            <div>
              <Link to={`/edukasi/detail/${edukasiList[activeEdu].id}`} className="edu-card">
                <div className="edu-img-wrapper">
                  <img
                    src={edukasiList[activeEdu].fileUrl || PLACEHOLDER_IMAGE}
                    alt={edukasiList[activeEdu].judul}
                    className="edu-img"
                  />
                  <span className="edu-tag">{edukasiList[activeEdu].kategori}</span>
                </div>
                <div className="edu-body">
                  <h3 className="edu-title">{edukasiList[activeEdu].judul}</h3>
                  <div className="edu-footer">
                    Baca Selengkapnya <ArrowRightLeft size={18} />
                  </div>
                </div>
              </Link>

              <div className="edu-dots">
                {edukasiList.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    className={`dot ${i === activeEdu ? 'active' : ''}`}
                    onClick={() => setActiveEdu(i)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER (DIPANGGIL DARI IMPORT) */}
      <Footer />
    </MasyarakatLayout>
  );
};

export default FirewatchPage;
