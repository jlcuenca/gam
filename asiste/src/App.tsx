import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Users,
  QrCode,
  Camera,
  MapPin,
  Bluetooth,
  CheckCircle,
  AlertTriangle,
  Clock,
  LogOut,
  Menu,
  ChevronRight,
  Smartphone,
  BarChart3,
  Activity,
  AlertCircle,
  X,
  Bell,
  BellRing,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

import { authService } from './lib/authService';

// Types
type Role = 'worker' | 'supervisor' | 'admin';

interface Worker {
  id: string;
  name: string;
  curp: string;
  status: 'Presente' | 'Falta' | 'Pendiente';
  lastCheck?: string;
}

const MOCK_WORKERS: Worker[] = [
  { id: '1', name: 'Juan Pérez García', curp: 'PEGJ850101HDFRRR01', status: 'Pendiente' },
  { id: '2', name: 'María López Sánchez', curp: 'LOSM900202MDFRRR02', status: 'Presente', lastCheck: '08:15 AM' },
  { id: '3', name: 'Carlos Rodríguez', curp: 'ROCC880303HDFRRR03', status: 'Falta' },
  { id: '4', name: 'Ana Martínez', curp: 'MAAA920404MDFRRR04', status: 'Pendiente' },
  { id: '5', name: 'Roberto Gómez', curp: 'GOMR850505HDFRRR05', status: 'Presente', lastCheck: '08:20 AM' },
];

const App: React.FC = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [bleStatus, setBleStatus] = useState<'searching' | 'connected' | 'idle'>('idle');
  const [showScanner, setShowScanner] = useState(false);
  const [showSelfie, setShowSelfie] = useState(false);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ id: number; title: string; message: string; type: 'info' | 'success' | 'warning' }[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // Offline/Online Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification("Conexión Restaurada", "Sincronizando datos pendientes...", "success");
      syncOfflineData();
    };
    const handleOffline = () => {
      setIsOnline(false);
      addNotification("Modo Offline Activo", "Los registros se guardarán localmente.", "warning");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load queue from localStorage
    const savedQueue = localStorage.getItem('gam_asiste_queue');
    if (savedQueue) setOfflineQueue(JSON.parse(savedQueue));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = async () => {
    const queue = JSON.parse(localStorage.getItem('gam_asiste_queue') || '[]');
    if (queue.length === 0) return;

    // Simulation of syncing
    setTimeout(() => {
      localStorage.removeItem('gam_asiste_queue');
      setOfflineQueue([]);
      addNotification("Sincronización Completa", `${queue.length} registros actualizados en el servidor.`, "success");
    }, 2000);
  };

  // BLE Proximity Simulation
  useEffect(() => {
    if (isLoggedIn && role === 'worker') {
      const timer = setTimeout(() => {
        setBleStatus('connected');
        addNotification(
          "Supervisor en Rango",
          "Tu supervisor (Célula 042) está a menos de 10 metros. Ya puedes registrar tu asistencia.",
          "success"
        );
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, role]);

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif = { id: Date.now(), title, message, type };
    setNotifications(prev => [newNotif, ...prev]);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 6000);
  };

  // Device Binding Simulation
  useEffect(() => {
    let id = localStorage.getItem('gam_device_id');
    if (!id) {
      id = 'DEV-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      localStorage.setItem('gam_device_id', id);
    }
    setDeviceId(id);
  }, []);

  // Scanner Logic
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);

      function onScanSuccess(decodedText: string) {
        scanner.clear();
        setShowScanner(false);
        validateQR(decodedText);
      }

      function onScanFailure(error: any) {
        // console.warn(`Code scan error = ${error}`);
      }

      return () => {
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
      };
    }
  }, [showScanner]);

  const validateQR = (data: string) => {
    const parts = data.split('-');
    if (parts[0] === 'GAM' && parts[1] === 'ASISTE') {
      const timestamp = parseInt(parts[2]);
      const now = Date.now();
      const diff = (now - timestamp) / 1000;

      if (diff < 45) { // 30s + 15s buffer
        if (!isOnline) {
          const pendingRecord = { data, timestamp: now, type: 'QR' };
          const newQueue = [...offlineQueue, pendingRecord];
          setOfflineQueue(newQueue);
          localStorage.setItem('gam_asiste_queue', JSON.stringify(newQueue));
          setScanResult({ success: true, message: "Guardado Localmente (Offline)" });
        } else {
          setScanResult({ success: true, message: "Asistencia Registrada Correctamente" });
        }
      } else {
        setScanResult({ success: false, message: "Código QR Expirado" });
      }
    } else {
      setScanResult({ success: false, message: "Código Inválido / Fraude Detectado" });
    }

    setTimeout(() => setScanResult(null), 3000);
  };

  // QR Rotation Logic
  useEffect(() => {
    if (isLoggedIn && role === 'worker') {
      const generateQR = () => {
        const timestamp = Date.now();
        const randomHash = Math.random().toString(36).substring(7);
        setQrValue(`GAM-ASISTE-${timestamp}-${randomHash}`);
        setTimeLeft(30);
      };

      generateQR();
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            generateQR();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, role]);

  // Geofencing Simulation
  useEffect(() => {
    if (isLoggedIn) {
      setTimeout(() => setLocationStatus('ok'), 1500);
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulación de Device Binding
    const registeredDevice = localStorage.getItem(`device_for_${email}`);
    if (registeredDevice && registeredDevice !== deviceId) {
      setScanResult({ success: false, message: "Error: Este usuario ya está vinculado a otro dispositivo físico." });
      setLoading(false);
      setTimeout(() => setScanResult(null), 4000);
      return;
    }

    if (!registeredDevice) {
      localStorage.setItem(`device_for_${email}`, deviceId!);
    }

    // Simulación de login con Supabase
    // En producción se usaría: const { data, error } = await authService.signIn(email, password);
    setTimeout(() => {
      if (email.includes('supervisor')) {
        setRole('supervisor');
      } else if (email.includes('admin')) {
        setRole('admin');
      } else {
        setRole('worker');
      }
      setIsLoggedIn(true);
      setLoading(false);
    }, 1000);
  };

  const renderLogin = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="app-container"
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: 80, height: 80, background: 'var(--primary)', borderRadius: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          boxShadow: '0 10px 25px rgba(159, 34, 65, 0.2)'
        }}>
          <Shield size={40} color="white" />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>ASISTE GAM</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Sistema de Asistencia de Alta Seguridad</p>
      </div>

      <div className="card" style={{ margin: 0 }}>
        <form onSubmit={handleLogin}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Iniciar Sesión</h3>
          <div className="input-group">
            <label>Correo Institucional</label>
            <input
              type="email"
              placeholder="usuario@gamadero.cdmx.gob.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Entrar al Sistema'}
          </button>
        </form>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" style={{ margin: 0, fontSize: '0.7rem', padding: '10px' }} onClick={() => { setEmail('admin@gamadero.cdmx.gob.mx'); setPassword('123456'); }}>Demo Admin</button>
          <button className="btn-secondary" style={{ margin: 0, fontSize: '0.7rem', padding: '10px' }} onClick={() => { setEmail('supervisor@gamadero.cdmx.gob.mx'); setPassword('123456'); }}>Demo Supervisor</button>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        v1.0.0 - Alcaldía Gustavo A. Madero
      </p>
    </motion.div>
  );

  const renderWorker = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="app-container">
      <header className="header">
        <div className="logo-container">
          <Shield size={24} color="var(--primary)" />
          <div className="title-group">
            <h1>Mi Asistencia</h1>
            <p>Trabajador: Juan Pérez</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {!isOnline && <WifiOff size={18} color="var(--warning)" />}
          <button onClick={() => setIsLoggedIn(false)} style={{ background: 'none', border: 'none' }}>
            <LogOut size={20} color="var(--text-muted)" />
          </button>
        </div>
      </header>

      {offlineQueue.length > 0 && (
        <div style={{ padding: '10px 20px', background: 'var(--warning)', color: 'white', fontSize: '0.7rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RefreshCw size={12} className="spin" />
          {offlineQueue.length} registros pendientes de sincronización
        </div>
      )}

      <div className="qr-container glass">
        <div style={{ position: 'relative', padding: '20px', background: 'white', borderRadius: '20px' }}>
          <QRCodeSVG value={qrValue} size={200} level="H" />
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            border: '4px solid var(--primary)', borderRadius: '20px', opacity: 0.1
          }} />
        </div>
        <div className="qr-timer">
          <div className="qr-timer-bar" style={{ width: `${(timeLeft / 30) * 100}%` }} />
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
          El código expira en {timeLeft} segundos
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: locationStatus === 'ok' ? '#d1fae5' : '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={20} color={locationStatus === 'ok' ? 'var(--safe)' : 'var(--warning)'} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem' }}>Geolocalización</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {locationStatus === 'ok' ? 'Dentro del perímetro permitido' : 'Verificando ubicación...'}
            </p>
          </div>
          {locationStatus === 'ok' && <CheckCircle size={18} color="var(--safe)" style={{ marginLeft: 'auto' }} />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: bleStatus === 'connected' ? '#e1f5fe' : '#f0f4f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bluetooth size={20} color={bleStatus === 'connected' ? '#03a9f4' : 'var(--text-muted)'} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem' }}>Proximidad Supervisor</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {bleStatus === 'connected' ? 'Supervisor en rango (Célula 042)' : 'Buscando señal de supervisor...'}
            </p>
          </div>
          {bleStatus === 'connected' && <CheckCircle size={18} color="var(--safe)" style={{ marginLeft: 'auto' }} />}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div className="glass" style={{ padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--warning)' }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.9rem' }}>Estatus de Hoy</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pendiente de registro físico</p>
          </div>
          <Clock size={18} color="var(--text-muted)" />
        </div>
      </div>
    </motion.div>
  );

  const renderSupervisor = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="app-container">
      <header className="header">
        <div className="logo-container">
          <Users size={24} color="var(--primary)" />
          <div className="title-group">
            <h1>Panel Supervisor</h1>
            <p>Célula 042 - Deportivo Galeana</p>
          </div>
        </div>
        <button onClick={() => setIsLoggedIn(false)} style={{ background: 'none', border: 'none' }}>
          <LogOut size={20} color="var(--text-muted)" />
        </button>
      </header>

      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button
          className="glass"
          style={{ padding: '20px', borderRadius: '24px', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
          onClick={() => setShowScanner(true)}
        >
          <QrCode size={32} color="var(--primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Escanear QR</span>
        </button>
        <button className="glass" style={{ padding: '20px', borderRadius: '24px', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Camera size={32} color="var(--primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Escanear INE</span>
        </button>
      </div>

      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.9)', zIndex: 4000, padding: '20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <button
              onClick={() => setShowScanner(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'white', border: 'none', borderRadius: '50%', padding: '10px' }}
            >
              <X size={24} />
            </button>
            <div id="reader" style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '20px', overflow: 'hidden' }}></div>
            <p style={{ color: 'white', marginTop: '20px', fontWeight: '600' }}>Escaneando código QR dinámico...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{
              position: 'fixed', bottom: 100, left: 20, right: 20,
              background: scanResult.success ? 'var(--safe)' : 'var(--danger)',
              color: 'white', padding: '20px', borderRadius: '20px', zIndex: 5000,
              display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            {scanResult.success ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <span style={{ fontWeight: '700' }}>{scanResult.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: '0 20px 20px' }}>
        <button
          className="btn-primary"
          style={{ background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
          onClick={() => setShowSelfie(true)}
        >
          <Camera size={20} /> Validación Grupal (Selfie)
        </button>
      </div>

      <AnimatePresence>
        {showSelfie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.95)', zIndex: 4000, padding: '20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '3/4', background: '#333', borderRadius: '24px', overflow: 'hidden', border: '4px solid white' }}>
              {!selfieImage ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '20px' }}>
                  <Camera size={64} opacity={0.5} />
                  <p>Cámara Lista para Validación Grupal</p>
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '12px 30px' }}
                    onClick={() => setSelfieImage('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800')}
                  >
                    Tomar Foto
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative', height: '100%' }}>
                  <img src={selfieImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                  {/* Watermark */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '20px', color: 'white', textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Shield size={14} color="var(--accent)" />
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' }}>ASISTE GAM - VALIDADO</span>
                    </div>
                    <p style={{ fontSize: '0.7rem', fontWeight: '600' }}>📍 Deportivo Hermanos Galeana</p>
                    <p style={{ fontSize: '0.6rem', opacity: 0.8 }}>19.4752° N, 99.0831° W | {new Date().toLocaleString()}</p>
                    <p style={{ fontSize: '0.6rem', opacity: 0.8 }}>Supervisor ID: SUP-042 | Device: {deviceId}</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', width: '100%', maxWidth: '400px' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, color: 'white', borderColor: 'white' }}
                onClick={() => { setShowSelfie(false); setSelfieImage(null); }}
              >
                Cancelar
              </button>
              {selfieImage && (
                <button
                  className="btn-primary"
                  style={{ flex: 1, background: 'var(--safe)' }}
                  onClick={() => {
                    setScanResult({ success: true, message: "Validación Grupal Guardada con Éxito" });
                    setShowSelfie(false);
                    setSelfieImage(null);
                    setTimeout(() => setScanResult(null), 3000);
                  }}
                >
                  Confirmar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem' }}>Mi Célula (20)</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>2/20 Presentes</span>
        </div>

        <div className="cell-list">
          {MOCK_WORKERS.map(worker => (
            <div key={worker.id} className="worker-item glass">
              <div className="worker-info">
                <h4>{worker.name}</h4>
                <p>{worker.curp}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`status-badge ${worker.status === 'Presente' ? 'status-present' : worker.status === 'Falta' ? 'status-absent' : ''}`} style={{ background: worker.status === 'Pendiente' ? '#f3f4f6' : undefined }}>
                  {worker.status}
                </span>
                {worker.lastCheck && <p style={{ fontSize: '0.6rem', marginTop: '4px', color: 'var(--text-muted)' }}>{worker.lastCheck}</p>}
              </div>
            </div>
          ))}
          <button style={{ padding: '12px', border: '2px dashed #ccc', borderRadius: '16px', background: 'none', color: '#999', fontSize: '0.8rem', fontWeight: '600' }}>
            Ver todos los integrantes...
          </button>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 20, left: 20, right: 20 }}>
        <div className="glass" style={{ padding: '16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(35, 91, 78, 0.9)', color: 'white' }}>
          <Smartphone size={20} />
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.8rem' }}>Modo Beacon Activo</h4>
            <p style={{ fontSize: '0.6rem', opacity: 0.8 }}>Transmitiendo señal de proximidad BLE</p>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
        </div>
      </div>
    </motion.div>
  );

  const renderAdmin = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="app-container" style={{ maxWidth: '1000px' }}>
      <header className="header">
        <div className="logo-container">
          <BarChart3 size={24} color="var(--primary)" />
          <div className="title-group">
            <h1>Dashboard Alcaldía</h1>
            <p>Control de Asistencia Masiva</p>
          </div>
        </div>
        <button onClick={() => setIsLoggedIn(false)} style={{ background: 'none', border: 'none' }}>
          <LogOut size={20} color="var(--text-muted)" />
        </button>
      </header>

      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
        <div className="card" style={{ margin: 0, padding: '15px' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL TRABAJADORES</p>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>2,000</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
            <Activity size={12} color="var(--safe)" />
            <span style={{ fontSize: '0.6rem', color: 'var(--safe)', fontWeight: '700' }}>100% Activos</span>
          </div>
        </div>
        <div className="card" style={{ margin: 0, padding: '15px' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>PRESENTES HOY</p>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}>1,842</h2>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>92.1% de asistencia</p>
        </div>
        <div className="card" style={{ margin: 0, padding: '15px' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>CÉLULAS VALIDATIVAS</p>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>100</h2>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>20 personas c/u</p>
        </div>
      </div>

      <div className="card" style={{ margin: '0 20px 20px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>Alertas de Seguridad (Tiempo Real)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#fff5f5', borderRadius: '12px', borderLeft: '4px solid var(--danger)' }}>
            <AlertCircle size={18} color="var(--danger)" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>Detección de Mock Location</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Usuario ID: 842 - Célula 15</p>
            </div>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Hace 2m</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#fff9f0', borderRadius: '12px', borderLeft: '4px solid var(--warning)' }}>
            <Smartphone size={18} color="var(--warning)" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>Intento de Device Sharing</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mismo hardware ID para 2 cuentas</p>
            </div>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Hace 5m</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <AnimatePresence mode="wait">
        {!isLoggedIn ? renderLogin() :
          role === 'admin' ? renderAdmin() :
            role === 'worker' ? renderWorker() :
              renderSupervisor()}
      </AnimatePresence>

      <div style={{ position: 'fixed', bottom: 20, left: 20, right: 20, zIndex: 6000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="glass"
              style={{
                padding: '16px',
                borderRadius: '20px',
                background: notif.type === 'success' ? 'rgba(5, 150, 105, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                color: notif.type === 'success' ? 'white' : 'var(--text)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                borderLeft: `6px solid ${notif.type === 'success' ? '#4ade80' : 'var(--primary)'}`
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <BellRing size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800' }}>{notif.title}</h4>
                <p style={{ fontSize: '0.7rem', opacity: 0.9 }}>{notif.message}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                style={{ background: 'none', border: 'none', color: 'inherit', opacity: 0.5 }}
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
