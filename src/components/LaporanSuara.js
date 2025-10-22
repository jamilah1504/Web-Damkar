// src/components/LaporanSuara.js
import React, { useState, useRef } from 'react';
import axios from 'axios';
import api from '../api';

function LaporanSuara() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [catatanAI, setCatatanAI] = useState('');
  const [laporan, setLaporan] = useState({
    nama_pelapor: '',
    tanggal_kejadian: new Date().toISOString().slice(0, 10), // Default to today
    kronologi: '',
    jenis_kejadian: '', // 'Kebakaran' atau 'Non Kebakaran'
    alamat: ''
  });
  const [error, setError] = useState('');
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setError('');
      audioChunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = event => {
        audioChunks.current.push(event.data);
      };
      mediaRecorder.current.start();
    } catch (err) {
      setError('Izin mikrofon diperlukan untuk fitur ini.');
      console.error("Error accessing microphone:", err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        sendAudioToServer(audioBlob);
      };
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsLoading(true);
    }
  };

  const sendAudioToServer = (audioBlob) => {
    // 1. Get Geolocation
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // 2. Ambil data pengguna dari local storage
        const userInfoString = localStorage.getItem('user'); // Ganti 'user' jika key-nya berbeda

        if (!userInfoString) {
          setError('Gagal mendapatkan data pengguna. Silakan login kembali.');
          setIsLoading(false);
          return;
        }

        const userInfo = JSON.parse(userInfoString);
        const token = userInfo.token; // Ekstrak token dari objek pengguna

        // 3. Buat FormData
        const formData = new FormData();
        formData.append('audio', audioBlob, 'laporan.webm');
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);

        // 4. Kirim ke backend dengan menyertakan token
        api.post('/auth/laporan-suara', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}` // <- Tambahkan header ini
            },
          })
        .then(response => {
          const { data } = response;
          setLaporan({
            nama_pelapor: data.nama_pelapor || '',
            tanggal_kejadian: data.tanggal_kejadian || new Date().toISOString().slice(0, 10),
            kronologi: data.kronologi || '',
            jenis_kejadian: data.jenis_kejadian || '',
            alamat: data.alamat || 'Alamat tidak terdeteksi',
          });
            if (data.catatan) {
                setCatatanAI(data.catatan);
            } else {
                setCatatanAI(''); // Kosongkan jika tidak ada catatan
            }
          setIsLoading(false);
        })
        .catch(err => {
          setError('Gagal memproses suara. Coba lagi.');
          setIsLoading(false);
          console.error("Error sending audio:", err);
          
        });
      },
      (geoError) => {
        setError('Izin lokasi diperlukan untuk mendapatkan alamat.');
        setIsLoading(false);
        console.error("Error getting geolocation:", geoError);
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLaporan(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="laporan-container">
      <h2>Lapor Darurat via Suara</h2>
      <p>Tekan tombol, ceritakan kejadiannya, dan kami akan mengisi formulir untuk Anda.</p>
      
      <div className="voice-button-container">
        {!isRecording ? (
          <button onClick={handleStartRecording} disabled={isLoading}>
            🎤 Mulai Rekam Laporan
          </button>
        ) : (
          <button onClick={handleStopRecording} className="recording">
            ⏹️ Hentikan Rekaman
          </button>
        )}
      </div>

      {isLoading && <p>🧠 AI sedang merangkum laporan Anda...</p>}
        {error && <p className="error">{error}</p>}

        {/* BARU: Tampilkan pesan/catatan dari AI */}
        {catatanAI && <p className="ai-note">📝 **Catatan dari AI:** {catatanAI}</p>}

      
      <form className="laporan-form">
        <label>Nama Pelapor</label>
        <input type="text" name="nama_pelapor" value={laporan.nama_pelapor} onChange={handleInputChange} />

        <label>Tanggal Kejadian</label>
        <input type="date" name="tanggal_kejadian" value={laporan.tanggal_kejadian} onChange={handleInputChange} />

        <label>Jenis Kejadian</label>
        <select name="jenis_kejadian" value={laporan.jenis_kejadian} onChange={handleInputChange}>
            <option value="">-- Pilih Jenis --</option>
            <option value="Kebakaran">Kebakaran</option>
            <option value="Non Kebakaran">Non Kebakaran</option>
        </select>

        <label>Alamat Kejadian</label>
        <textarea name="alamat" value={laporan.alamat} onChange={handleInputChange} rows="3"></textarea>

        <label>Kronologi</label>
        <textarea name="kronologi" value={laporan.kronologi} onChange={handleInputChange} rows="5"></textarea>

        <button type="submit" className="submit-button">Kirim Laporan</button>
      </form>
    </div>
  );
}

export default LaporanSuara;