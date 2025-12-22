import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Map as MapIcon,
  BarChart3,
  Users,
  Info,
  ChevronRight,
  Filter,
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  Calendar,
  Layers,
  Download,
  Database,
  PieChart as PieChartIcon,
  ChevronDown,
  ChevronUp,
  Upload,
  FileText,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import Papa from 'papaparse';
import { PARTIES, COALITIONS, MOCK_SECTIONS, MOCK_COLONIAS, ELECTION_METADATA, SectionData, ColoniaData, distributeVotes } from './mockData';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'map' | 'detail' | 'data'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColonia, setSelectedColonia] = useState<ColoniaData | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
  const [activeTab, setActiveTab] = useState<'Alcaldía' | 'Jefatura' | 'Presidencia'>('Alcaldía');
  const [showCoalitionLogic, setShowCoalitionLogic] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);

  const filteredColonias = useMemo(() => {
    return MOCK_COLONIAS.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalStats = useMemo(() => {
    const totalVotes = MOCK_COLONIAS.reduce((acc, c) => acc + c.totalVotes, 0);
    const avgParticipation = MOCK_COLONIAS.reduce((acc, c) => acc + c.participation, 0) / MOCK_COLONIAS.length;

    const partyTotals: Record<string, number> = {};
    MOCK_COLONIAS.forEach(c => {
      c.results.forEach(r => {
        partyTotals[r.partyId] = (partyTotals[r.partyId] || 0) + r.votes;
      });
    });

    const sortedParties = Object.entries(partyTotals)
      .map(([id, votes]) => ({
        id,
        votes,
        percentage: (votes / totalVotes) * 100,
        ...PARTIES.find(p => p.id === id)
      }))
      .sort((a, b) => b.votes - a.votes);

    return {
      totalVotes,
      avgParticipation,
      winner: sortedParties[0],
      results: sortedParties
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('Parsed CSV:', results.data);
        setTimeout(() => {
          setProcessedFiles(prev => [...prev, {
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            status: 'Procesado',
            rows: results.data.length,
            timestamp: new Date().toLocaleTimeString()
          }]);
          setIsParsing(false);
        }, 1500);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsParsing(false);
      }
    });
  };

  const renderDashboard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="animate-fade-in"
    >
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <p className="stat-label">Participación Ciudadana</p>
              <h2 className="stat-value">{totalStats.avgParticipation.toFixed(1)}%</h2>
            </div>
            <Users color="var(--primary)" size={24} />
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${totalStats.avgParticipation}%`, background: 'var(--primary)' }}
            />
          </div>
          <p className="card-subtitle">Basado en Lista Nominal de GAM</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <p className="stat-label">Votos Contabilizados</p>
              <h2 className="stat-value">{totalStats.totalVotes.toLocaleString()}</h2>
            </div>
            <BarChart3 color="var(--secondary)" size={24} />
          </div>
          <div className="party-info" style={{ marginTop: '10px' }}>
            <span className="badge badge-secondary">Cómputos Definitivos</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <p className="stat-label">Tendencia Principal</p>
              <h2 className="stat-value" style={{ color: totalStats.winner.color }}>
                {totalStats.winner.shortName}
              </h2>
            </div>
            <TrendingUp color={totalStats.winner.color} size={24} />
          </div>
          <p className="card-subtitle">Líder en la demarcación</p>
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Resultados por Fuerza Política</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowCoalitionLogic(!showCoalitionLogic)}
                className="glass"
                style={{ padding: '4px 8px', borderRadius: '8px', border: 'none', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {showCoalitionLogic ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Lógica de Coalición
              </button>
              <Download size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            </div>
          </div>

          <AnimatePresence>
            {showCoalitionLogic && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="glass" style={{ padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.8rem', borderLeft: '4px solid var(--accent)' }}>
                  <p><strong>Distribución Proporcional:</strong> Según la normativa del INE, los votos marcados por múltiples emblemas de una coalición se distribuyen equitativamente entre los partidos integrantes para fines estadísticos.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={totalStats.results}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEE" />
                <XAxis dataKey="shortName" axisLine={false} tickLine={false} fontSize={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Porcentaje']}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {totalStats.results.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="party-list">
            {totalStats.results.map(party => (
              <div key={party.id} className="party-item">
                <div className="party-color" style={{ background: party.color }} />
                <div className="party-info">
                  <div className="party-name">{party.name}</div>
                  <div className="party-votes">{Math.round(party.votes).toLocaleString()} votos</div>
                </div>
                <div className="party-percent">{party.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 40px' }}>
        <h3 className="card-title" style={{ marginBottom: '16px', paddingLeft: '4px' }}>Explorar por Colonia</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredColonias.map(colonia => (
            <motion.div
              key={colonia.name}
              whileTap={{ scale: 0.98 }}
              className="card"
              style={{ padding: '16px', cursor: 'pointer' }}
              onClick={() => {
                setSelectedColonia(colonia);
                setView('detail');
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>{colonia.name}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{colonia.sections.length} Secciones Electorales</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>{colonia.participation}%</div>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Participación</p>
                </div>
                <ChevronRight size={20} color="var(--border)" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderDetail = () => {
    const data = selectedColonia || selectedSection;
    if (!data) return null;

    const results = 'results' in data ? data.results : [];
    const sortedResults = [...results].sort((a, b) => b.votes - a.votes);

    return (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="app-container"
        style={{ background: 'white', position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto' }}
      >
        <div className="header">
          <button onClick={() => { setView('dashboard'); setSelectedColonia(null); setSelectedSection(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <div className="title-group" style={{ textAlign: 'center' }}>
            <h1>{selectedColonia ? 'Detalle de Colonia' : 'Detalle de Sección'}</h1>
            <p>{selectedColonia ? selectedColonia.name : `Sección ${selectedSection?.id}`}</p>
          </div>
          <div style={{ width: 24 }}></div>
        </div>

        <div style={{ padding: '24px' }}>
          <div className="dashboard-grid" style={{ padding: 0, marginBottom: '24px' }}>
            <div className="card glass" style={{ background: '#F0F4F8' }}>
              <p className="stat-label">Participación</p>
              <h2 className="stat-value" style={{ fontSize: '1.5rem' }}>{data.participation}%</h2>
            </div>
            <div className="card glass" style={{ background: '#F0F4F8' }}>
              <p className="stat-label">Votos Totales</p>
              <h2 className="stat-value" style={{ fontSize: '1.5rem' }}>{'totalVotes' in data ? data.totalVotes.toLocaleString() : (data as SectionData).nominalList.toLocaleString()}</h2>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Distribución de Votos</h3>
            <div className="party-list">
              {sortedResults.map(r => {
                const party = PARTIES.find(p => p.id === r.partyId);
                return (
                  <div key={r.partyId} className="party-item" style={{ marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span className="party-name">{party?.name}</span>
                        <span className="party-percent">{r.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${r.percentage}%`, background: party?.color }}
                        />
                      </div>
                      <span className="party-votes">{Math.round(r.votes).toLocaleString()} votos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedColonia && (
            <div style={{ marginTop: '24px' }}>
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Secciones en esta Colonia</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedColonia.sections.map(sId => (
                  <div
                    key={sId}
                    className="card"
                    style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => {
                      const section = MOCK_SECTIONS.find(s => s.id === sId);
                      if (section) {
                        setSelectedSection(section);
                        setSelectedColonia(null);
                      }
                    }}
                  >
                    <span style={{ fontWeight: '700' }}>Sección {sId}</span>
                    <ChevronRight size={16} color="var(--border)" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderDataView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="animate-fade-in"
      style={{ padding: '20px' }}
    >
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Gestión de Ingesta de Datos</h3>
          <Database size={24} color="var(--primary)" />
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Carga y procesamiento de archivos CSV de Cómputos Distritales e infraestructura geoespacial.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass" style={{ padding: '40px', borderRadius: '24px', border: '2px dashed var(--border)', position: 'relative' }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            />
            <div style={{ textAlign: 'center' }}>
              {isParsing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Clock size={48} color="var(--primary)" />
                </motion.div>
              ) : (
                <Upload size={48} color="var(--border)" style={{ marginBottom: '12px' }} />
              )}
              <p style={{ fontWeight: '700', fontSize: '1rem', marginTop: '12px' }}>
                {isParsing ? 'Procesando archivo...' : 'Arrastra archivos CSV aquí'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Soporta formatos INE SICEE y Cómputos Distritales
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={14} /> Historial de Cargas
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {processedFiles.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No hay archivos procesados aún.</p>
              )}
              {processedFiles.map((file, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'white', border: '1px solid var(--border)', borderRadius: '16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{file.name}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{file.size} • {file.rows} registros • {file.timestamp}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--safe)', fontWeight: '700', fontSize: '0.8rem' }}>
                    <CheckCircle2 size={16} />
                    {file.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderMap = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="animate-fade-in"
      style={{ height: 'calc(100vh - 180px)', margin: '20px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 8px 25px var(--shadow)' }}
    >
      <MapContainer center={[19.48, -99.11]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Simulated Section Polygons with real Leaflet components */}
        <Polygon
          positions={[
            [19.46, -99.10],
            [19.47, -99.10],
            [19.47, -99.09],
            [19.46, -99.09]
          ]}
          pathOptions={{
            fillColor: 'var(--primary)',
            fillOpacity: 0.4,
            color: 'white',
            weight: 2
          }}
          eventHandlers={{
            click: () => { setSelectedSection(MOCK_SECTIONS[0]); setView('detail'); }
          }}
        >
          <Popup>Sección 1545 - Eduardo Molina I</Popup>
        </Polygon>

        <Polygon
          positions={[
            [19.47, -99.09],
            [19.48, -99.09],
            [19.48, -99.08],
            [19.47, -99.08]
          ]}
          pathOptions={{
            fillColor: 'var(--secondary)',
            fillOpacity: 0.4,
            color: 'white',
            weight: 2
          }}
          eventHandlers={{
            click: () => { setSelectedSection(MOCK_SECTIONS[1]); setView('detail'); }
          }}
        >
          <Popup>Sección 1546 - Eduardo Molina I</Popup>
        </Polygon>

        <Marker position={[19.48, -99.13]}>
          <Popup>Lindavista - Sección 1234</Popup>
        </Marker>
      </MapContainer>

      <div style={{ position: 'absolute', bottom: 40, left: 40, zIndex: 1000 }}>
        <div className="glass" style={{ padding: '12px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '2px', background: 'rgba(159, 34, 65, 0.6)' }} />
              <span style={{ fontSize: '0.7rem' }}>Dominancia Morena</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '2px', background: 'rgba(35, 91, 78, 0.6)' }} />
              <span style={{ fontSize: '0.7rem' }}>Dominancia Oposición</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-container">
          <img src="http://gamadero.cdmx.gob.mx/assets/img/logo_gam1.webp" alt="GAM" className="logo-img" />
          <div className="title-group">
            <h1>GAM Electoral</h1>
            <p>Inteligencia de Datos 2024</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`control-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')} style={{ background: view === 'dashboard' ? 'var(--primary)' : 'white', color: view === 'dashboard' ? 'white' : 'var(--text)' }}>
            <BarChart3 size={20} />
          </button>
          <button className={`control-btn ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')} style={{ background: view === 'map' ? 'var(--primary)' : 'white', color: view === 'map' ? 'white' : 'var(--text)' }}>
            <MapIcon size={20} />
          </button>
          <button className={`control-btn ${view === 'data' ? 'active' : ''}`} onClick={() => setView('data')} style={{ background: view === 'data' ? 'var(--primary)' : 'white', color: view === 'data' ? 'white' : 'var(--text)' }}>
            <Database size={20} />
          </button>
        </div>
      </header>

      {view !== 'data' && (
        <>
          <div className="search-bar">
            <Search size={18} color="#999" />
            <input
              type="text"
              placeholder="Buscar Colonia o Sección (ej. 1545)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Filter size={18} color="#999" />
          </div>

          <div className="category-scroll">
            {['Alcaldía', 'Jefatura', 'Presidencia', 'Senaduría', 'Diputación'].map(tab => (
              <button
                key={tab}
                className={`category-chip ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab as any)}
              >
                {tab}
              </button>
            ))}
          </div>
        </>
      )}

      <main style={{ flex: 1 }}>
        {view === 'dashboard' && renderDashboard()}
        {view === 'map' && renderMap()}
        {view === 'data' && renderDataView()}
      </main>

      <AnimatePresence>
        {(selectedColonia || selectedSection) && renderDetail()}
      </AnimatePresence>

      <footer style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'white' }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Fuente: Cómputos Distritales INE / IECM 2024. <br />
          Última actualización: {ELECTION_METADATA.lastUpdate}
        </p>
      </footer>
    </div>
  );
};

export default App;
