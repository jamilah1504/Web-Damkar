import React, { useState } from 'react';
import { ArrowLeft, Camera, Video, MapPin } from 'lucide-react';
interface FormDataState {
  namaPelapor: string;
  jenisKejadian: string;
  detailKejadian: string;
  alamatKejadian: string;
}

export default function LaporanKejadianForm(): JSX.Element {
  const [formData, setFormData] = useState<FormDataState>({
    namaPelapor: '',
    jenisKejadian: '',
    detailKejadian: '',
    alamatKejadian: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Laporan berhasil diajukan!');
  };

  return (
      <main className="main-content">
        <div className="title-bar">
          <button className="back-button">
            <ArrowLeft size={24} />
          </button>
          <h2 className="page-title">Laporan Kejadian</h2>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="form-grid">
          {/* Left Column - Form */}
          <div className="form-column">
            <input
              type="text"
              name="namaPelapor"
              placeholder="Nama Pelapor"
              value={formData.namaPelapor}
              onChange={handleInputChange}
              className="form-input"
            />
            <select
              name="jenisKejadian"
              value={formData.jenisKejadian}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Jenis Kejadian</option>
              <option value="kebakaran">Kebakaran</option>
              <option value="bencana">Bencana Alam</option>
              <option value="kecelakaan">Kecelakaan</option>
              <option value="lainnya">Lainnya</option>
            </select>
            <textarea
              name="detailKejadian"
              placeholder="Detail Kejadian"
              value={formData.detailKejadian}
              onChange={handleInputChange}
              rows={4}
              className="form-textarea"
            />
            <textarea
              name="alamatKejadian"
              placeholder="Alamat Kejadian"
              value={formData.alamatKejadian}
              onChange={handleInputChange}
              rows={4}
              className="form-textarea"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="button-submit"
            >
              Ajukan Laporan
            </button>
          </div>

          {/* Right Column - Upload & Map */}
          <div className="form-column">
            <div className="card">
              <h3 className="card-title">Upload dokumentasi</h3>
              <div className="upload-grid">
                <button className="upload-button">
                  <Camera size={40} className="upload-icon" />
                  <span className="upload-text">Foto</span>
                </button>
                <button className="upload-button">
                  <Video size={40} className="upload-icon" />
                  <span className="upload-text">Video</span>
                </button>
              </div>
            </div>
            <div className="card">
              <div className="map-header">
                <div>
                  <h3 className="card-title-flex">
                    Pilih Lokasi
                    <MapPin size={16} className="map-pin-icon-small" />
                  </h3>
                  <p className="map-address">Cibogo RT 19, Subang</p>
                </div>
                <button className="button-change-location">
                  Ubah
                </button>
              </div>
              <div className="map-container">
                 {/* ... Konten peta tetap sama ... */}
                 {/* Map Location */}

                <div className="bg-white p-6 rounded-lg shadow-sm">

                <div className="flex items-start justify-between mb-3">

                    <div>

                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">

                        Pilih Lokasi

                        <MapPin size={16} className="text-gray-500" />

                    </h3>

                    <p className="text-sm text-gray-500 mt-1">Cibogo RT 19, Subang</p>

                    </div>

                    <button className="bg-yellow-400 text-gray-800 px-4 py-1 rounded-full text-sm font-semibold hover:bg-yellow-500">

                    Ubah

                    </button>

                </div>

                

                <div className="w-full h-64 bg-green-100 rounded-lg overflow-hidden relative">

                    <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-green-100 to-blue-100">

                    {/* Simulated Map Roads */}

                    <svg className="w-full h-full opacity-30">

                        <line x1="0" y1="100" x2="400" y2="100" stroke="#888" strokeWidth="2"/>

                        <line x1="0" y1="150" x2="400" y2="150" stroke="#888" strokeWidth="2"/>

                        <line x1="150" y1="0" x2="150" y2="300" stroke="#888" strokeWidth="2"/>

                        <line x1="250" y1="0" x2="250" y2="300" stroke="#888" strokeWidth="2"/>

                    </svg>

                    

                    {/* Location Marker */}

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">

                        <MapPin size={36} className="text-red-600 fill-red-600 drop-shadow-lg" />

                    </div>

                    

                    {/* Small markers */}

                    <div className="absolute top-1/4 left-1/4">

                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>

                    </div>

                    <div className="absolute top-3/4 right-1/4">

                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>

                    </div>

                    <div className="absolute top-1/2 right-1/3">

                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>

                    </div>

                    </div>

                </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
  );
}
