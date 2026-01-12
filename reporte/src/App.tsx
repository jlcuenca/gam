import React, { useState, useEffect } from 'react';
import {
  Car,
  Trash2,
  MapPin,
  Camera,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  X,
  Search,
  Footprints
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';

// Types
interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface Report {
  id: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  photos: string[];
  status: 'pendiente' | 'asignado' | 'atendido' | 'cerrado';
  priority: 'baja' | 'media' | 'alta';
  created_at: string;
}

const CATEGORIES: Category[] = [
  { id: 'vehiculo', name: 'Vehículo Abandonado', icon: <Car size={24} /> },
  { id: 'bache', name: 'Bache / Socavón', icon: <AlertTriangle size={24} /> },
  { id: 'basura', name: 'Acumulación de Basura', icon: <Trash2 size={24} /> },
  { id: 'banqueta', name: 'Banqueta en Mal Estado', icon: <Footprints size={24} /> },
];

const App: React.FC = () => {
  const [view, setView] = useState<'category' | 'form' | 'success'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('Obteniendo ubicación...');
  const [timestamp] = useState(new Date().toLocaleString());
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [trackingFolio, setTrackingFolio] = useState('');
  const [trackedReport, setTrackedReport] = useState<Report | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Simple Geolocation capture
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          fetchAddress(latitude, longitude);
        },
        (error) => {
          console.error("Error capturing location:", error);
          setAddress("Ubicación no disponible");
        }
      );
    }
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const { data, error } = await supabase
        .from('ciudadano_reportes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentReports(data || []);
    } catch (error) {
      console.error("Error fetching recent reports:", error);
    }
  };

  const handleFolioSearch = async () => {
    if (!trackingFolio) return;
    setIsTracking(true);
    setTrackedReport(null);
    try {
      // Extract UUID from GAM-XXXX format or use as is
      const cleanId = trackingFolio.replace('GAM-', '').trim();

      const { data, error } = await supabase
        .from('ciudadano_reportes')
        .select('*')
        .or(`id.eq.${cleanId},id.ilike.%${cleanId}%`)
        .limit(1)
        .single();

      if (error) throw error;
      setTrackedReport(data);
    } catch (error) {
      console.error("Error tracking report:", error);
      alert("No se encontró ningún reporte con ese folio.");
    } finally {
      setIsTracking(false);
    }
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      setAddress(data.display_name || "Dirección no encontrada");
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Error al recuperar dirección");
    }
  };

  const handleAddressSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Gustavo A. Madero, CDMX")}&limit=1`);
      const data = await response.json();
      if (data && data[0]) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLon = parseFloat(lon);
        setLocation({ lat: newLat, lng: newLon });
        setAddress(display_name);
      }
    } catch (error) {
      console.error("Error searching address:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const watermarkImage = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageUrl);

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Add watermark background
        const padding = 20;
        const fontSize = Math.max(12, Math.floor(canvas.width / 40));
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;

        const textLines = [
          `COORD: ${location?.lat.toFixed(6)}, ${location?.lng.toFixed(6)}`,
          `FECHA: ${timestamp}`,
          `ALCALDÍA GUSTAVO A. MADERO`
        ];

        const rectHeight = (textLines.length * fontSize * 1.5) + (padding * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, canvas.height - rectHeight, canvas.width, rectHeight);

        // Draw text
        ctx.fillStyle = 'white';
        textLines.forEach((line, i) => {
          ctx.fillText(line, padding, canvas.height - rectHeight + padding + (i + 1) * fontSize * 1.2);
        });

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(imageUrl);
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setView('form');
  };

  const handlePhotoAdd = async () => {
    // Mock photo adding
    const mockPhotos = [
      'https://images.unsplash.com/photo-1595231712325-9fecd0091482?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1621431671804-ea460f1b525d?auto=format&fit=crop&q=80&w=800'
    ];
    if (photos.length < 3) {
      const originalUrl = mockPhotos[photos.length % 2];
      const watermarkedUrl = await watermarkImage(originalUrl);
      setPhotos([...photos, watermarkedUrl]);
    }
  };

  const uploadPhotos = async (photosBase64: string[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const [index, base64] of photosBase64.entries()) {
      try {
        // Convert base64 to blob
        const response = await fetch(base64);
        const blob = await response.blob();
        const fileName = `${Date.now()}-${index}.jpg`;
        const filePath = `reports/${fileName}`;

        const { error } = await supabase.storage
          .from('citizen-evidence')
          .upload(filePath, blob);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('citizen-evidence')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error("Error uploading photo:", error);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !description || !location) return;

    setIsSubmitting(true);
    try {
      // 1. Upload photos to Supabase Storage
      const imageUrls = await uploadPhotos(photos);

      // 2. Insert report data into Supabase table
      const { error } = await supabase
        .from('ciudadano_reportes')
        .insert([{
          category: selectedCategory,
          description: description,
          latitude: location.lat,
          longitude: location.lng,
          address: address,
          photos: imageUrls,
          status: 'pendiente'
        }]);

      if (error) throw error;

      setRecentReports(prev => [
        {
          id: Math.random().toString(36).substr(2, 9), // Temporary ID for immediate UI update until real refresh
          category: selectedCategory,
          description,
          latitude: location.lat,
          longitude: location.lng,
          address,
          photos: imageUrls,
          status: 'pendiente',
          priority: 'media',
          created_at: new Date().toISOString()
        } as Report,
        ...prev
      ].slice(0, 5));
      setView('success');
      fetchRecentReports(); // Actual refresh from server
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error al enviar el reporte. Por favor intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = (title: string, showBack = false) => (
    <header className="header">
      <div className="logo-container" style={{ justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showBack ? (
            <button onClick={() => setView('category')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <ArrowLeft size={20} color="var(--primary)" />
            </button>
          ) : (
            <img src="/logo_gam-DMJH8_Dm.webp" alt="GAM" className="logo-img" />
          )}
          <div className="title-group">
            <h1>{title}</h1>
            <p>Alcaldía GAM</p>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {view === 'category' && (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {renderHeader("Reporte Ciudadano")}
            <div className="report-form">
              <section className="report-section">
                <h3>¿Qué deseas reportar?</h3>
                <div className="category-grid">
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      className="category-item"
                      onClick={() => handleCategorySelect(cat.name)}
                    >
                      <div style={{ color: 'var(--primary)', marginBottom: '4px' }}>{cat.icon}</div>
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="report-section" style={{ marginTop: '20px' }}>
                <h3>Rastrear mi Reporte</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, padding: '10px 14px' }}
                    placeholder="Ej. GAM-XXXX"
                    value={trackingFolio}
                    onChange={(e) => setTrackingFolio(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleFolioSearch()}
                  />
                  <button
                    onClick={handleFolioSearch}
                    disabled={isTracking}
                    className="btn-submit"
                    style={{ width: 'auto', padding: '0 16px', borderRadius: '12px', marginTop: 0 }}
                  >
                    <Search size={18} />
                  </button>
                </div>

                {trackedReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="location-card"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--primary)', marginBottom: '16px' }}
                  >
                    <CheckCircle size={24} color="var(--primary)" />
                    <div className="location-info">
                      <div className="address" style={{ fontWeight: '800' }}>Folio: GAM-{trackedReport.id.slice(0, 4).toUpperCase()}</div>
                      <div className="coords">Estatus: <span style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'capitalize' }}>{trackedReport.status}</span></div>
                    </div>
                  </motion.div>
                )}

                <h3>Reportes Recientes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentReports.length > 0 ? (
                    recentReports.map(report => (
                      <div key={report.id} className="location-card">
                        <Clock size={20} color="var(--accent)" />
                        <div className="location-info">
                          <div className="address" style={{ fontSize: '0.85rem' }}>{report.category}</div>
                          <div className="coords">{report.address.split(',')[0]} • {new Date(report.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className={`status-badge status-${report.status}`}>
                          {report.status}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>No hay reportes recientes.</p>
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {view === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderHeader("Nuevo Reporte", true)}
            <div className="report-form">
              <section className="report-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle size={18} color="var(--safe)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>
                    {selectedCategory}
                  </span>
                </div>

                <div className="form-field">
                  <label>Ubicación del Reporte</label>
                  <div className="location-card">
                    <MapPin size={24} color="var(--primary)" />
                    <div className="location-info">
                      <div className="address">{address}</div>
                      <div className="coords">
                        {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Buscando GPS...'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem' }}
                      placeholder="Buscar dirección manual..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                    />
                    <button
                      onClick={handleAddressSearch}
                      disabled={isSearching}
                      style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isSearching ? 0.6 : 1
                      }}
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label>Fecha y Hora</label>
                  <div className="location-card" style={{ padding: '12px 16px' }}>
                    <Clock size={20} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{timestamp}</span>
                  </div>
                </div>

                <div className="form-field">
                  <label>Descripción del Problema</label>
                  <textarea
                    className="form-input"
                    placeholder="Describe brevemente la situación..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-field">
                  <label>Evidencia Fotográfica ({photos.length}/3)</label>
                  <div className="photo-grid">
                    {photos.map((photo, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img src={photo} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: '16px', objectFit: 'cover' }} />
                        <button
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                          style={{ position: 'absolute', top: -5, right: -5, background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {photos.length < 3 && (
                      <div className="photo-placeholder" onClick={handlePhotoAdd}>
                        <Camera size={24} />
                        <span>Añadir Foto</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="btn-submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !description || photos.length === 0}
                  style={{ opacity: (isSubmitting || !description || photos.length === 0) ? 0.6 : 1 }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </section>
            </div>
          </motion.div>
        )}

        {view === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="success-overlay"
          >
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: 'var(--primary)' }}>
              ¡Reporte Recibido!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.5' }}>
              Tu reporte ha sido registrado con éxito. El folio de seguimiento es <strong style={{ color: 'var(--primary)' }}>GAM-{Math.floor(Math.random() * 10000)}</strong>.
            </p>
            <button
              className="btn-submit"
              style={{ width: '200px' }}
              onClick={() => {
                setView('category');
                setSelectedCategory(null);
                setDescription('');
                setPhotos([]);
              }}
            >
              Volver al Inicio
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default App;
