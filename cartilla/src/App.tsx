import React, { useState } from 'react';
import {
  User,
  Phone,
  QrCode,
  CreditCard,
  Bell,
  Settings,
  ChevronRight,
  Heart,
  GraduationCap,
  Utensils,
  Home,
  ShieldCheck,
  LogOut,
  Search,
  PlusCircle,
  Users,
  LayoutGrid,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

// Types
type AuthMethod = 'curp' | 'phone' | 'qr';
type UserRole = 'citizen' | 'admin';

interface Citizen {
  id: string;
  name: string;
  curp: string;
  phone: string;
  electoralSection: string;
  assignedPrograms: string[]; // IDs of programs
  balance: number;
}

interface Program {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'education' | 'food' | 'housing';
  icon: string; // Icon name from lucide
  color: string;
  amount: number;
}

const INITIAL_PROGRAMS: Program[] = [
  {
    id: '1',
    title: 'Me Late el Deporte',
    description: 'Fomento a la cultura física y el deporte en la comunidad.',
    category: 'health',
    icon: 'Heart',
    color: '#9f2241',
    amount: 1500
  },
  {
    id: '2',
    title: 'Con Raíz',
    description: 'Apoyo integral para el empoderamiento de las mujeres en la GAM.',
    category: 'education',
    icon: 'GraduationCap',
    color: '#235b4e',
    amount: 2500
  },
  {
    id: '3',
    title: 'Las Jefas de GAM',
    description: 'Apoyo económico y social para madres jefas de familia.',
    category: 'food',
    icon: 'Utensils',
    color: '#bc955c',
    amount: 3000
  },
  {
    id: '4',
    title: 'Lecherías para el Bienestar',
    description: 'Acceso a leche de calidad a bajo costo para familias vulnerables.',
    category: 'food',
    icon: 'Utensils',
    color: '#9f2241',
    amount: 0
  },
  {
    id: '5',
    title: 'Fuerza GAM en tu Escuela',
    description: 'Mejoramiento de infraestructura y apoyos escolares.',
    category: 'education',
    icon: 'GraduationCap',
    color: '#235b4e',
    amount: 1200
  },
  {
    id: '6',
    title: 'GAM en Movimiento',
    description: 'Apoyo para personas con discapacidad y movilidad reducida.',
    category: 'health',
    icon: 'Home',
    color: '#bc955c',
    amount: 2000
  },
  {
    id: '7',
    title: 'Me Late la Cultura',
    description: 'Talleres, eventos y fomento a las artes en las colonias.',
    category: 'education',
    icon: 'GraduationCap',
    color: '#9f2241',
    amount: 1000
  }
];

const INITIAL_CITIZENS: Citizen[] = [
  {
    id: 'c1',
    name: 'Juan Pérez',
    curp: 'PEJU800101HDFRRN01',
    phone: '5512345678',
    electoralSection: '1234',
    assignedPrograms: ['1', '2', '3'],
    balance: 4850
  }
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('curp');
  const [inputValue, setInputValue] = useState('');
  const [selectedBenefit, setSelectedBenefit] = useState<Program | null>(null);

  // Admin State
  const [citizens, setCitizens] = useState<Citizen[]>(INITIAL_CITIZENS);
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [currentUser, setCurrentUser] = useState<Citizen | null>(null);
  const [adminTab, setAdminTab] = useState<'citizens' | 'programs' | 'assign'>('citizens');

  // New Citizen Form
  const [newCitizen, setNewCitizen] = useState({ name: '', curp: '', phone: '', section: '' });
  const [newProgram, setNewProgram] = useState({ title: '', description: '', category: 'health' as any, amount: 0, color: '#9f2241' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.toUpperCase() === 'ADMIN') {
      setUserRole('admin');
      setIsLoggedIn(true);
      return;
    }

    // INE QR Parsing Logic
    // Format: http://qr.ine.mx/129201263284003141734178/20160205/P/000154
    let searchVal = inputValue.toUpperCase();
    let extractedSection = '';

    if (inputValue.includes('qr.ine.mx/')) {
      const parts = inputValue.split('qr.ine.mx/');
      if (parts.length > 1) {
        extractedSection = parts[1].substring(0, 4);
        // In a real app, we would use the full ID to find the citizen
        // For this demo, we'll try to match by section if CURP/Phone not found
      }
    }

    const citizen = citizens.find(c =>
      c.curp === searchVal ||
      c.phone === inputValue ||
      (extractedSection && c.electoralSection === extractedSection)
    );

    if (citizen) {
      setCurrentUser(citizen);
      setUserRole('citizen');
      setIsLoggedIn(true);
    } else if (authMethod === 'qr' && extractedSection) {
      // Fallback for demo: if QR has a section, use the first citizen with that section
      const fallback = citizens.find(c => c.electoralSection === extractedSection) || citizens[0];
      setCurrentUser(fallback);
      setUserRole('citizen');
      setIsLoggedIn(true);
    }
  };

  const addCitizen = () => {
    if (!newCitizen.name || !newCitizen.curp) return;
    const citizen: Citizen = {
      id: `c${Date.now()}`,
      name: newCitizen.name,
      curp: newCitizen.curp.toUpperCase(),
      phone: newCitizen.phone,
      electoralSection: newCitizen.section,
      assignedPrograms: [],
      balance: 0
    };
    setCitizens([...citizens, citizen]);
    setNewCitizen({ name: '', curp: '', phone: '', section: '' });
  };

  const addProgram = () => {
    if (!newProgram.title) return;
    const program: Program = {
      id: `p${Date.now()}`,
      ...newProgram,
      icon: 'ShieldCheck'
    };
    setPrograms([...programs, program]);
    setNewProgram({ title: '', description: '', category: 'health', amount: 0, color: '#9f2241' });
  };

  const assignProgram = (citizenId: string, programId: string) => {
    setCitizens(citizens.map(c => {
      if (c.id === citizenId && !c.assignedPrograms.includes(programId)) {
        const program = programs.find(p => p.id === programId);
        return {
          ...c,
          assignedPrograms: [...c.assignedPrograms, programId],
          balance: c.balance + (program?.amount || 0)
        };
      }
      return c;
    }));
  };

  const getIcon = (name: string, color: string) => {
    switch (name) {
      case 'Heart': return <Heart size={24} color={color} />;
      case 'GraduationCap': return <GraduationCap size={24} color={color} />;
      case 'Utensils': return <Utensils size={24} color={color} />;
      case 'Home': return <Home size={24} color={color} />;
      default: return <ShieldCheck size={24} color={color} />;
    }
  };

  const renderLogin = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="login-screen"
      style={{ padding: '40px 24px', textAlign: 'center' }}
    >
      <div style={{ marginBottom: '40px' }}>
        <img
          src="http://gamadero.cdmx.gob.mx/assets/img/logo_gam1.webp"
          alt="Alcaldía Gustavo A. Madero"
          style={{ width: '100%', maxWidth: '280px', marginBottom: '20px' }}
        />
        <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '8px', fontWeight: '700' }}>
          Cartilla de Beneficios
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Gustavo A. Madero • Desarrollo Social
        </p>
      </div>

      <div className="glass" style={{ padding: '24px', borderRadius: '24px', textAlign: 'left' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {(['curp', 'phone', 'qr'] as AuthMethod[]).map((method) => (
            <button
              key={method}
              onClick={() => {
                setAuthMethod(method);
                setInputValue('');
              }}
              className={`btn ${authMethod === method ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '10px', fontSize: '0.8rem' }}
            >
              {method === 'curp' && <User size={16} />}
              {method === 'phone' && <Phone size={16} />}
              {method === 'qr' && <QrCode size={16} />}
              {method.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin}>
          {authMethod !== 'qr' ? (
            <div className="input-group">
              <label className="input-label">
                {authMethod === 'curp' ? 'Ingresa tu CURP' : 'Número de Celular'}
              </label>
              <input
                type="text"
                className="input-field"
                placeholder={authMethod === 'curp' ? 'AAAA000000XXXXXX00' : '55 1234 5678'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                * Tip: Usa "ADMIN" para entrar como administrador.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                height: '160px',
                background: '#000',
                borderRadius: '16px',
                marginBottom: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  border: '2px solid var(--accent)',
                  borderRadius: '12px',
                  position: 'relative'
                }}>
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--accent)',
                      boxShadow: '0 0 10px var(--accent)'
                    }}
                  />
                </div>
                <p style={{ marginTop: '12px', fontSize: '0.7rem', opacity: 0.8 }}>Escanea el QR reverso de tu INE</p>
              </div>
              <input
                type="text"
                className="input-field"
                placeholder="Pega el link del QR del INE aquí..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Formato: http://qr.ine.mx/1292... (Sección: 1292)
              </p>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {authMethod === 'qr' ? 'Verificar Identidad' : 'Acceder a mi Cartilla'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '32px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        © 2025 Alcaldía Gustavo A. Madero | Todos los derechos reservados
      </p>
    </motion.div>
  );

  const renderAdminDashboard = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="http://gamadero.cdmx.gob.mx/assets/img/logo_gam1.webp" alt="Logo" style={{ height: '40px' }} />
          <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '12px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Administrador</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Panel de Control</p>
          </div>
        </div>
        <button onClick={() => { setIsLoggedIn(false); setInputValue(''); }} className="glass" style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LogOut size={20} />
        </button>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setAdminTab('citizens')} className={`btn ${adminTab === 'citizens' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, padding: '8px', fontSize: '0.7rem' }}>
          <Users size={16} /> Ciudadanos
        </button>
        <button onClick={() => setAdminTab('programs')} className={`btn ${adminTab === 'programs' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, padding: '8px', fontSize: '0.7rem' }}>
          <LayoutGrid size={16} /> Programas
        </button>
        <button onClick={() => setAdminTab('assign')} className={`btn ${adminTab === 'assign' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, padding: '8px', fontSize: '0.7rem' }}>
          <UserPlus size={16} /> Asignar
        </button>
      </div>

      {adminTab === 'citizens' && (
        <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Alta de Ciudadano</h3>
          <input className="input-field" style={{ marginBottom: '10px' }} placeholder="Nombre Completo" value={newCitizen.name} onChange={e => setNewCitizen({ ...newCitizen, name: e.target.value })} />
          <input className="input-field" style={{ marginBottom: '10px' }} placeholder="CURP" value={newCitizen.curp} onChange={e => setNewCitizen({ ...newCitizen, curp: e.target.value })} />
          <input className="input-field" style={{ marginBottom: '10px' }} placeholder="Teléfono" value={newCitizen.phone} onChange={e => setNewCitizen({ ...newCitizen, phone: e.target.value })} />
          <input className="input-field" style={{ marginBottom: '16px' }} placeholder="Sección Electoral (4 dígitos)" maxLength={4} value={newCitizen.section} onChange={e => setNewCitizen({ ...newCitizen, section: e.target.value })} />
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={addCitizen}>Registrar Ciudadano</button>

          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Ciudadanos Registrados ({citizens.length})</h4>
            {citizens.map(c => (
              <div key={c.id} style={{ padding: '12px', background: '#fff', borderRadius: '12px', marginBottom: '8px', border: '1px solid #eee' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{c.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.curp} | Sec: {c.electoralSection}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'programs' && (
        <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Nuevo Programa Social</h3>
          <input className="input-field" style={{ marginBottom: '10px' }} placeholder="Título del Programa" value={newProgram.title} onChange={e => setNewProgram({ ...newProgram, title: e.target.value })} />
          <textarea className="input-field" style={{ marginBottom: '10px', height: '80px' }} placeholder="Descripción" value={newProgram.description} onChange={e => setNewProgram({ ...newProgram, description: e.target.value })} />
          <input className="input-field" type="number" style={{ marginBottom: '16px' }} placeholder="Monto del Apoyo ($)" value={newProgram.amount} onChange={e => setNewProgram({ ...newProgram, amount: Number(e.target.value) })} />
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={addProgram}>Crear Programa</button>

          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Programas Activos ({programs.length})</h4>
            {programs.map(p => (
              <div key={p.id} style={{ padding: '12px', background: '#fff', borderRadius: '12px', marginBottom: '8px', border: '1px solid #eee' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.title}</div>
                <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.8rem' }}>${p.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'assign' && (
        <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Asignación de Apoyos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {citizens.map(c => (
              <div key={c.id} style={{ padding: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>{c.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {programs.map(p => (
                    <button
                      key={p.id}
                      onClick={() => assignProgram(c.id, p.id)}
                      disabled={c.assignedPrograms.includes(p.id)}
                      style={{
                        fontSize: '0.65rem',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--primary)',
                        background: c.assignedPrograms.includes(p.id) ? 'var(--primary)' : 'transparent',
                        color: c.assignedPrograms.includes(p.id) ? '#fff' : 'var(--primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderDashboard = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard" style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="http://gamadero.cdmx.gob.mx/assets/img/logo_gam1.webp" alt="Logo" style={{ height: '40px' }} />
          <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '12px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{currentUser?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{currentUser?.curp}</p>
            <p style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '700' }}>Sección: {currentUser?.electoralSection}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="glass" style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} />
          </button>
          <button onClick={() => { setIsLoggedIn(false); setInputValue(''); }} className="glass" style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="wallet-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '4px' }}>Saldo Disponible</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>${currentUser?.balance.toLocaleString()}.00</h3>
          </div>
          <CreditCard size={32} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ opacity: 0.8, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Vigencia</p>
            <p style={{ fontWeight: '600' }}>12 / 2026</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ opacity: 0.8, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tipo de Apoyo</p>
            <p style={{ fontWeight: '600' }}>Universal</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Mis Beneficios</h3>
        {programs.filter(p => currentUser?.assignedPrograms.includes(p.id)).map((benefit) => (
          <motion.div key={benefit.id} whileTap={{ scale: 0.98 }} className="benefit-card" onClick={() => setSelectedBenefit(benefit)}>
            <div className="benefit-icon" style={{ backgroundColor: `${benefit.color}15`, color: benefit.color }}>
              {getIcon(benefit.icon, benefit.color)}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>{benefit.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{benefit.description.substring(0, 40)}...</p>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </motion.div>
        ))}
        {currentUser?.assignedPrograms.length === 0 && (
          <div className="glass" style={{ padding: '30px', textAlign: 'center', borderRadius: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No tienes programas asignados aún.</p>
          </div>
        )}
      </div>

      <nav className="glass" style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', height: '64px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--primary)' }}><Home size={24} /></button>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><Search size={24} /></button>
        <button style={{ width: '50px', height: '50px', borderRadius: '25px', background: 'var(--primary)', color: 'white', border: 'none', marginTop: '-30px', boxShadow: '0 5px 15px rgba(159, 34, 65, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <QrCode size={24} />
        </button>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><CreditCard size={24} /></button>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><Settings size={24} /></button>
      </nav>
    </motion.div>
  );

  const renderBenefitDetail = () => (
    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="benefit-detail" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg)', zIndex: 100, padding: '24px' }}>
      <button onClick={() => setSelectedBenefit(null)} style={{ background: 'none', border: 'none', color: 'var(--text)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} />
        <span style={{ fontWeight: '600' }}>Volver</span>
      </button>

      {selectedBenefit && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: `${selectedBenefit.color}15`, color: selectedBenefit.color, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getIcon(selectedBenefit.icon, selectedBenefit.color)}
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{selectedBenefit.title}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{selectedBenefit.description}</p>

          <div className="glass" style={{ padding: '32px', borderRadius: '32px', display: 'inline-block', marginBottom: '32px' }}>
            <QRCodeSVG
              value={`${currentUser?.electoralSection.substring(0, 4)}:BENEFIT:${selectedBenefit.id}:USER:${currentUser?.curp}`}
              size={200}
              fgColor="var(--primary)"
              level="H"
            />
            <p style={{ marginTop: '16px', fontWeight: '600', color: 'var(--primary)' }}>Código de Canje Único</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Sección: {currentUser?.electoralSection}</p>
          </div>

          <div style={{ textAlign: 'left', background: 'var(--card-bg)', padding: '20px', borderRadius: '20px' }}>
            <h4 style={{ marginBottom: '12px' }}>Instrucciones:</h4>
            <ol style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <li>Presenta este código QR en el establecimiento autorizado.</li>
              <li>El código incluye tu sección electoral ({currentUser?.electoralSection.substring(0, 4)}) para validación territorial.</li>
              <li>Asegúrate de llevar una identificación oficial vigente.</li>
            </ol>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="app-container">
      {!isLoggedIn ? renderLogin() : userRole === 'admin' ? renderAdminDashboard() : renderDashboard()}
      <AnimatePresence>
        {selectedBenefit && renderBenefitDetail()}
      </AnimatePresence>
    </div>
  );
};

export default App;
