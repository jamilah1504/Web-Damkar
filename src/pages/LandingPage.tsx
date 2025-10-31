import MasyarakatLayout from 'layouts/masyarakat-layout';
import React, { useState, useEffect, useRef } from 'react';

// Komponen utama untuk halaman Firewatch
const FirewatchPage: React.FC = () => {
  // State untuk mengontrol visibilitas menu mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refs untuk elemen DOM yang akan dimanipulasi
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  const statsSectionRef = useRef<HTMLElement>(null);
  
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


    // Intersection Observer untuk animasi counter pada statistik
    const animateCounter = (element: HTMLElement, target: number, format?: string, suffix?: string) => {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = format || `${target}${suffix || ''}`;
                clearInterval(timer);
            } else {
                element.textContent = `${Math.floor(current)}${suffix || ''}`;
            }
        }, 20);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll<HTMLElement>('.stat-item h3');
                
                animateCounter(statNumbers[0], 3, '< 3 Menit');
                animateCounter(statNumbers[1], 10000, undefined, '+');
                animateCounter(statNumbers[2], 50, undefined, '+');
                
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    if (statsSectionRef.current) {
        statsObserver.observe(statsSectionRef.current);
    }

    // Cleanup function untuk menghapus event listeners saat komponen unmount
    return () => {
      anchors.forEach(anchor => anchor.removeEventListener('click', handleAnchorClick));
      buttons.forEach(btn => btn.removeEventListener('mouseenter', handleBtnMouseEnter as EventListener));
      observer.disconnect();
      statsObserver.disconnect();
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

        /* Topbar */
        .topbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: rgba(10, 10, 10, 0.8);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            z-index: 1000;
            animation: slideDown 0.5s ease;
        }

        @keyframes slideDown {
            from {
                transform: translateY(-100%);
            }
            to {
                transform: translateY(0);
            }
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.5rem;
            font-weight: 800;
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }

        .nav-menu {
            display: flex;
            gap: 2rem;
            list-style: none;
        }

        .nav-menu a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: all 0.3s;
            position: relative;
        }

        .nav-menu a:hover {
            color: var(--primary-orange);
        }

        .nav-menu a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--gradient);
            transition: width 0.3s;
        }

        .nav-menu a:hover::after {
            width: 100%;
        }

        .menu-toggle {
            display: none;
            background: none;
            border: none;
            color: var(--text-primary);
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 1100;
        }
        
        /* Nav Menu Mobile Style */
        .nav-menu-mobile {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            list-style: none;
            position: absolute;
            top: 64px;
            right: 2rem;
            background: var(--dark-card);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1050;
        }

        /* Hero Section */
        .hero {
            min-height: 100vh;
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

        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            animation: fadeInUp 1s ease 0.4s both;
        }

        .btn {
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            position: relative;
            overflow: hidden;
        }

        .btn-primary {
            background: var(--gradient);
            color: white;
            border: none;
            box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 40px rgba(239, 68, 68, 0.4);
        }

        .btn-secondary {
            background: transparent;
            color: var(--text-primary);
            border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--primary-orange);
        }

        /* Features Section */
        .features {
            padding: 5rem 2rem;
            background: linear-gradient(180deg, transparent, rgba(239, 68, 68, 0.05), transparent);
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

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .feature-card {
            background: var(--dark-card);
            padding: 2rem;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(239, 68, 68, 0.1), transparent 70%);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .feature-card:hover::before {
            opacity: 1;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary-orange);
            box-shadow: 0 20px 40px rgba(239, 68, 68, 0.2);
        }

        .feature-icon {
            width: 60px;
            height: 60px;
            background: var(--gradient);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1rem;
            animation: float 3s infinite ease-in-out;
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        .feature-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .feature-card p {
            color: var(--text-secondary);
            line-height: 1.6;
        }

        /* Stats Section */
        .stats {
            padding: 5rem 2rem;
            background: var(--dark-card);
            position: relative;
            overflow: hidden;
        }

        .stats::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: var(--gradient);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 3rem;
            text-align: center;
        }

        .stat-item h3 {
            font-size: 3rem;
            font-weight: 900;
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }

        .stat-item p {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }

        /* How It Works */
        .how-it-works {
            padding: 5rem 2rem;
        }

        .steps {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .step {
            text-align: center;
            position: relative;
        }

        .step-number {
            width: 50px;
            height: 50px;
            background: var(--gradient);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: bold;
            margin: 0 auto 1rem;
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        .step h3 {
            margin-bottom: 0.5rem;
            font-size: 1.3rem;
        }

        .step p {
            color: var(--text-secondary);
        }

        /* CTA Section */
        .cta-section {
            padding: 5rem 2rem;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(251, 146, 60, 0.1));
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .cta-section::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(239, 68, 68, 0.2), transparent 60%);
            animation: rotate 20s infinite linear;
        }

        @keyframes rotate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        .cta-content {
            position: relative;
            z-index: 1;
        }

        .cta-section h2 {
            font-size: clamp(2rem, 5vw, 3rem);
            margin-bottom: 1rem;
        }

        /* Footer */
        .footer {
            padding: 3rem 2rem 2rem;
            background: var(--dark-card);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }

        .footer-section h4 {
            margin-bottom: 1rem;
            color: var(--primary-orange);
        }

        .footer-section ul {
            list-style: none;
        }

        .footer-section ul li {
            margin-bottom: 0.5rem;
        }

        .footer-section a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 0.3s;
        }

        .footer-section a:hover {
            color: var(--primary-orange);
        }

        .footer-bottom {
            text-align: center;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--text-secondary);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .nav-menu {
                display: none;
            }

            .menu-toggle {
                display: block;
            }

            .hero h1 {
                font-size: 2.5rem;
            }

            .cta-buttons {
                flex-direction: column;
                align-items: center;
            }

            .btn {
                width: 100%;
                max-width: 300px;
                justify-content: center;
            }

            .features-grid,
            .stats-grid,
            .steps {
                grid-template-columns: 1fr;
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
      <section className="hero" id="home">
        <div className="hero-content">
          <h1>Sistem Pelaporan Kebakaran Real-Time</h1>
          <p>Respons cepat, penanganan tepat. Lindungi komunitas Anda dengan teknologi pelaporan kebakaran terdepan.</p>
          <div className="cta-buttons">
            <a href="#" className="btn btn-primary">
              🚨 Laporkan Sekarang
            </a>
            <a href="#" className="btn btn-secondary">
              📱 Download Aplikasi
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-title">
            <h2>Fitur Unggulan</h2>
            <p>Teknologi canggih untuk keselamatan maksimal</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Respons Kilat</h3>
              <p>Notifikasi langsung ke unit pemadam terdekat dalam hitungan detik setelah laporan diterima.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Lokasi Akurat</h3>
              <p>Teknologi GPS presisi tinggi memastikan tim penyelamat sampai ke lokasi yang tepat.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3>Laporan Visual</h3>
              <p>Kirim foto dan video untuk membantu petugas mempersiapkan peralatan yang sesuai.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Notifikasi Area</h3>
              <p>Peringatan otomatis ke warga sekitar untuk evakuasi dan kewaspadaan.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Dashboard Analitik</h3>
              <p>Pantau statistik kebakaran dan tingkat respons untuk peningkatan layanan.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Verifikasi Cerdas</h3>
              <p>AI untuk memverifikasi laporan dan mencegah alarm palsu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats" ref={statsSectionRef}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>&lt; 3 Menit</h3>
              <p>Waktu Respons Rata-rata</p>
            </div>
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Kejadian Ditangani</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Kota Terlayani</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Monitoring Aktif</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-title">
            <h2>Cara Kerja</h2>
            <p>Proses pelaporan yang sederhana dan efektif</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Deteksi Kebakaran</h3>
              <p>Temukan kebakaran atau asap mencurigakan di sekitar Anda</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Laporkan</h3>
              <p>Gunakan aplikasi atau website untuk membuat laporan dengan foto</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Verifikasi</h3>
              <p>Sistem AI memverifikasi laporan dalam hitungan detik</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Dispatch</h3>
              <p>Unit terdekat langsung dikirim ke lokasi kejadian</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Siap Melindungi Komunitas Anda?</h2>
          <p>Bergabunglah dengan ribuan pengguna yang telah membantu menyelamatkan nyawa</p>
          <div className="cta-buttons">
            <a href="#" className="btn btn-primary">
              Mulai Sekarang
            </a>
          </div>
        </div>
      </section>
    </MasyarakatLayout>
  );
};

export default FirewatchPage;