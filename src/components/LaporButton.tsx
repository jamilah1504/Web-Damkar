import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
// BARU: Impor useNavigate untuk pindah halaman
import { useNavigate } from 'react-router-dom';
import NotificationPopup from './NotificationPopup';

// FIX 1: Hapus prop 'onTranscriptReceived' karena tidak dipakai lagi
type LaporButtonProps = {
  // Tidak ada props yang diperlukan untuk logika ini
};
type NotificationStatus = 'success' | 'error' | 'pending' | 'info' | null;


/**
 * Komponen ini sekarang menangani alur VTT -> TTF -> Navigasi
 */
const LaporButton = ({}: LaporButtonProps) => { // Hapus prop
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
      status: NotificationStatus;
      message: string;
    }>({ status: null, message: '' });

  // BARU: Inisialisasi hook navigasi
  const navigate = useNavigate();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
    
   

  // Fungsi startRecording tidak berubah
  const startRecording = async () => {
    setError(null);
     setNotification({
            status: 'info',
            message: `Rekaman akan dimulai. Mohon sebutkan dengan jelas: Nama Anda, Kejadian yang terjadi dan Alamat lengkap kejadian`,
          });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsLoading(true); // Loading dimulai...
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'laporan-audio.webm', { type: 'audio/webm' });

        // Kirim ke backend untuk diproses
        await sendAudioAndNavigate(audioFile);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Izin mikrofon ditolak atau tidak ditemukan.");
    }
  };

  // Fungsi stopRecording tidak berubah
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ==========================================================
  // === FUNGSI UTAMA (YANG DIUBAH) ===
  // ==========================================================
  const sendAudioAndNavigate = async (audioFile: File) => {
    const formData = new FormData();
    formData.append('audioFile', audioFile);

    try {
      // --- Langkah 1: Kirim audio ke Voice-to-Text ---
      const responseVTT = await fetch('http://localhost:5000/api/ai/voice-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!responseVTT.ok) {
        const errData = await responseVTT.json();
        throw new Error(errData.message || 'Gagal melakukan transkripsi VTT');
      }

      const dataVTT = await responseVTT.json();
      const transcript = dataVTT.transcript;

      if (!transcript) {
        throw new Error('Transkrip kosong, tidak bisa melanjutkan.');
      }

      // --- Langkah 2: Kirim transkrip ke Text-to-Form ---
      const responseTTF = await fetch('http://localhost:5000/api/ai/text-to-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcript }),
      });

      if (!responseTTF.ok) {
        const errData = await responseTTF.json();
        throw new Error(errData.message || 'Gagal mengekstrak data TTF');
      }

      const dataTTF = await responseTTF.json();
      const formDataFromAI = dataTTF.formData;

      // --- Langkah 3: Navigasi ke Halaman Formulir dengan membawa data ---
      navigate('/formulir-laporan', { state: { formData: formDataFromAI } });

      // Catatan: Loading di-stop di 'finally'

    } catch (err: any) {
      console.error("Error dalam alur laporan suara:", err);
      setError(err.message);
    } finally {
      setIsLoading(false); // Selesai loading, baik sukses maupun gagal
    }
  };

  // Handler utama saat tombol diklik (tidak berubah)
  const handleButtonClick = () => {
    if (isLoading) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

   const handleCloseNotification = () => {
    // Reset notifikasi
    setNotification({ status: null, message: '' });
  };

  // getButtonContent (tidak berubah)
  const getButtonContent = () => {
    if (isLoading) {
      return {
        icon: <Loader2 size={40} strokeWidth={2.5} className="animate-spin" />,
        label: 'MEMPROSES...',
      };
    }
    if (isRecording) {
      return {
        icon: <Square size={40} strokeWidth={2.5} style={{ color: 'red' }} />,
        label: 'MEREKAM...',
      };
    }
    return {
      icon: <Mic size={40} strokeWidth={2.5} />,
      label: 'LAPOR',
    };
  };

  const { icon, label } = getButtonContent();

  return (
    <div className="" >
        {notification.status && (
        <NotificationPopup
          status={notification.status}
          message={notification.message}
          onClose={handleCloseNotification}
        />
      )}
      <button 
        className="lapor-main-button" 
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        <div className="lapor-circle">
          {icon}
        </div>
        <span className="lapor-label">{label}</span>
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default LaporButton;