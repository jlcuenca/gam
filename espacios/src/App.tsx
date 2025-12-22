import React, { useState } from 'react';
import {
    MapPin,
    Search,
    Star,
    TrendingUp,
    Camera,
    LayoutGrid,
    Map as MapIcon,
    Plus,
    Home,
    User,
    Filter,
    ArrowLeft,
    DollarSign,
    MessageSquare,
    AlertTriangle,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Space {
    id: string;
    name: string;
    type: 'Mercado' | 'Deportivo' | 'Cultura' | 'Clínica' | 'Parque' | 'Explanada' | 'Fuente' | 'Paradero' | 'Camellón' | 'Plaza' | 'Sendero Seguro' | 'Bajo Puente' | 'Kiosko';
    colonia: string;
    geoPoint: { lat: number; lng: number };
    conditionRating: number;
    impactRating: number;
    status: 'Crítico' | 'Regular' | 'Óptimo';
    budgetNeeded: number;
    lastVisit: string;
    images: string[];
    description: string;
    responsibleDirector: 'Obras' | 'Servicios Urbanos' | 'Desarrollo Social' | 'Seguridad' | 'Gobierno';
    sensitiveTopics: string[]; // Temas que preocupan a la comunidad
    keyMessages: string[]; // Mensajes que el Alcalde debe dar
    tasksDone: string[]; // Tareas realizadas recientemente
    beforeAfterImages?: { before: string; after: string }[];
    politicalClimate?: string; // Clima político (Participación Ciudadana)
    neighborhoodLeaders?: { name: string; role: string; affinity: 'Aliado' | 'Opositor' | 'Neutral' }[];
}

const MOCK_SPACES: Space[] = [
    {
        id: '1',
        name: 'Mercado Gertrudis Sánchez',
        type: 'Mercado',
        colonia: 'Gertrudis Sánchez 1a Secc.',
        geoPoint: { lat: 19.46, lng: -99.10 },
        conditionRating: 3,
        impactRating: 5,
        status: 'Regular',
        budgetNeeded: 850000,
        lastVisit: '2025-12-15',
        images: ['https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=800'],
        description: 'Mercado emblemático de la zona. Requiere mantenimiento en drenaje y pintura exterior.',
        responsibleDirector: 'Obras',
        sensitiveTopics: ['Seguridad en el estacionamiento', 'Cobro de piso'],
        keyMessages: ['Reforzamiento de vigilancia', 'Programa de bacheo perimetral'],
        tasksDone: ['Limpieza de drenaje', 'Pintura de fachada'],
        politicalClimate: 'Comerciantes organizados, buena relación con la mesa directiva.',
        neighborhoodLeaders: [{ name: 'Sra. Elena Pineda', role: 'Líder de Comerciantes', affinity: 'Aliado' }]
    },
    {
        id: '2',
        name: 'Deportivo Hermanos Galeana',
        type: 'Deportivo',
        colonia: 'San Juan de Aragón 7a Secc.',
        geoPoint: { lat: 19.47, lng: -99.08 },
        conditionRating: 4,
        impactRating: 5,
        status: 'Regular',
        budgetNeeded: 1200000,
        lastVisit: '2025-12-10',
        images: ['https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80&w=800'],
        description: 'Uno de los deportivos más grandes de la CDMX. Albercas y canchas en uso constante.',
        responsibleDirector: 'Servicios Urbanos',
        sensitiveTopics: ['Falta de iluminación en andadores nocturnos'],
        keyMessages: ['Inversión en luminarias LED', 'Nuevas becas deportivas'],
        tasksDone: ['Mantenimiento de alberca olímpica'],
        politicalClimate: 'Alta afluencia de jóvenes, clima de paz social.',
        neighborhoodLeaders: [{ name: 'Prof. Ricardo Sosa', role: 'Coordinador de Ligas', affinity: 'Aliado' }]
    },
    {
        id: '3',
        name: 'Centro de Arte y Cultura Futurama',
        type: 'Cultura',
        colonia: 'Lindavista',
        geoPoint: { lat: 19.48, lng: -99.13 },
        conditionRating: 5,
        impactRating: 4,
        status: 'Óptimo',
        budgetNeeded: 0,
        lastVisit: '2025-12-18',
        images: ['https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=800'],
        description: 'Centro cultural de vanguardia. Cine, exposiciones y talleres activos.',
        responsibleDirector: 'Desarrollo Social',
        sensitiveTopics: ['Ampliación de oferta de talleres'],
        keyMessages: ['Cultura para todos en Lindavista'],
        tasksDone: ['Inauguración de sala digital'],
        politicalClimate: 'Clase media participativa, alta exigencia de calidad.',
        neighborhoodLeaders: [{ name: 'Lic. Claudia Ruiz', role: 'Comité Vecinal Lindavista', affinity: 'Neutral' }]
    },
    {
        id: '4',
        name: 'Fábrica de Artes y Oficios (FARO) Aragón',
        type: 'Cultura',
        colonia: 'San Juan de Aragón 1a Secc.',
        geoPoint: { lat: 19.45, lng: -99.09 },
        conditionRating: 4,
        impactRating: 5,
        status: 'Óptimo',
        budgetNeeded: 50000,
        lastVisit: '2025-12-05',
        images: ['https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800'],
        description: 'Especializado en cine y artes audiovisuales. Gran impacto en jóvenes de la zona oriente.',
        responsibleDirector: 'Desarrollo Social',
        sensitiveTopics: ['Transporte seguro para estudiantes nocturnos'],
        keyMessages: ['Nuevos equipos de edición', 'Festival de cine local'],
        tasksDone: ['Reparación de aire acondicionado'],
        politicalClimate: 'Comunidad artística muy activa y leal al proyecto.',
        neighborhoodLeaders: [{ name: 'Mtro. Sergio Luna', role: 'Director de Colectivo', affinity: 'Aliado' }]
    },
    {
        id: '5',
        name: 'Mercado Vicente Guerrero',
        type: 'Mercado',
        colonia: 'Villa Gustavo A. Madero',
        geoPoint: { lat: 19.485, lng: -99.115 },
        conditionRating: 2,
        impactRating: 4,
        status: 'Crítico',
        budgetNeeded: 2500000,
        lastVisit: '2025-12-19',
        images: ['https://images.unsplash.com/photo-1543083477-4f79cddaf3f2?auto=format&fit=crop&q=80&w=800'],
        description: 'Urgente remodelación de techumbre. Sistema eléctrico obsoleto.',
        responsibleDirector: 'Obras',
        sensitiveTopics: ['Riesgo de incendio por cableado expuesto'],
        keyMessages: ['Remodelación total en Q2 2026', 'Apoyos económicos temporales'],
        tasksDone: ['Revisión de protección civil'],
        politicalClimate: 'Tensión por falta de obras, se requiere presencia constante.',
        neighborhoodLeaders: [{ name: 'Don Pedro Ortiz', role: 'Secretario General', affinity: 'Opositor' }]
    },
    {
        id: '6',
        name: 'Deportivo 18 de Marzo',
        type: 'Deportivo',
        colonia: 'Tepeyac Insurgentes',
        geoPoint: { lat: 19.48, lng: -99.12 },
        conditionRating: 3,
        impactRating: 4,
        status: 'Regular',
        budgetNeeded: 600000,
        lastVisit: '2025-12-12',
        images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'],
        description: 'Instalaciones históricas. Necesita rehabilitación de canchas de frontón.',
        responsibleDirector: 'Servicios Urbanos',
        sensitiveTopics: ['Privatización de espacios por ligas externas'],
        keyMessages: ['Acceso gratuito garantizado', 'Escuelas técnico-deportivas'],
        tasksDone: ['Pintura de barda perimetral'],
        politicalClimate: 'Usuarios tradicionales, demandan respeto a la historia del club.',
        neighborhoodLeaders: [{ name: 'Sra. Gloria Estévez', role: 'Club de Corredores', affinity: 'Neutral' }]
    },
    {
        id: '7',
        name: 'Parque Av. Centenario',
        type: 'Parque',
        colonia: 'Juan de Dios Bátiz',
        geoPoint: { lat: 19.49, lng: -99.10 },
        conditionRating: 2,
        impactRating: 3,
        status: 'Crítico',
        budgetNeeded: 450000,
        lastVisit: '2025-12-20',
        images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800'],
        description: 'Área verde descuidada. Presencia de personas en situación de calle.',
        responsibleDirector: 'Seguridad',
        sensitiveTopics: ['Consumo de sustancias', 'Falta de poda'],
        keyMessages: ['Recuperación de espacio público', 'Módulo de policía activo'],
        tasksDone: ['Retiro de maleza'],
        politicalClimate: 'Vecinos organizados en chats de seguridad, exigen resultados.',
        neighborhoodLeaders: [{ name: 'Ing. Arturo Vaca', role: 'Presidente de Vigilancia', affinity: 'Neutral' }]
    },
    {
        id: '8',
        name: 'Centro Cultural La Casilda',
        type: 'Cultura',
        colonia: 'La Casilda',
        geoPoint: { lat: 19.53, lng: -99.13 },
        conditionRating: 4,
        impactRating: 5,
        status: 'Óptimo',
        budgetNeeded: 15000,
        lastVisit: '2025-12-14',
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'],
        description: 'Ubicado en la zona alta de Cuautepec. Vital para la cohesión social.',
        responsibleDirector: 'Desarrollo Social',
        sensitiveTopics: ['Frecuencia del transporte (Cablebús)'],
        keyMessages: ['Más talleres para niños', 'Internet gratuito en la plaza'],
        tasksDone: ['Mantenimiento preventivo'],
        politicalClimate: 'Zona de alta prioridad política, base social sólida.',
        neighborhoodLeaders: [{ name: 'Sra. Juanita López', role: 'Promotora Cultural', affinity: 'Aliado' }]
    }
];

const COLONIAS_GAM = [
    "6 de Junio", "7 de Noviembre", "Acueducto de Guadalupe", "Ahuehuetes", "Ampliación Arboledas",
    "Ampliación Benito Juárez", "Ampliación Castillo Grande", "Ampliación Chalma de Guadalupe",
    "Ampliación Cocoyotes", "Aragón Inguarán", "Aragón La Villa", "Arboledas", "Arboledas de Cuautepec",
    "Barrio Candelaria Ticomán", "Barrio Guadalupe Ticomán", "Barrio La Purísima Ticomán",
    "Barrio San Juan y Guadalupe Ticomán", "Barrio San Rafael Ticomán", "Belisario Domínguez",
    "Benito Juárez", "Bondojito", "Capultitlán", "Castillo Chico", "Castillo Grande",
    "Chalma de Guadalupe", "Cocoyotes", "Compositores Mexicanos", "Cuautepec Barrio Alto",
    "Cuautepec de Madero", "Del Bosque", "Del Carmen", "El Arbolillo", "El Arbolillo 1",
    "El Arbolillo 2", "El Arbolillo 3", "El Coyol", "El Olivo", "El Tepetatal", "Emiliano Zapata",
    "Estanzuela", "Estrella", "Ex-Escuela de Tiro", "Faja de Oro", "Fernando Casas Alemán",
    "Ferrocarrilera Insurgentes", "Forestal", "Forestal I", "Forestal II", "Fovissste Aragón",
    "Fovissste Cuchilla", "Fovissste Río de Guadalupe", "Gabriel Hernández", "General Felipe Berriozábal",
    "Gertrudis Sánchez 1a Secc.", "Gertrudis Sánchez 2a Secc.", "Gertrudis Sánchez 3a Secc.",
    "Guadalupe Insurgentes", "Industrial", "Jorge Negrete", "Juventino Rosas", "La Casilda",
    "La Lengüeta", "La Pastora", "Lindavista", "Lindavista Vallejo 1a Secc.", "Lindavista Vallejo 2a Secc.",
    "Lindavista Vallejo 3a Secc.", "Loma La Palma", "Lomas de Cuautepec", "Luis Donaldo Colosio",
    "Malacates", "Palmatitla", "Parque Metropolitano", "Pradera", "Pradera 2a Secc.",
    "Prados de Cuautepec", "Residencial Acueducto de Guadalupe", "San Antonio",
    "San Juan de Aragón 1a Secc.", "San Juan de Aragón 2a Secc.", "San Juan de Aragón 3a Secc.",
    "San Juan de Aragón 4a Secc.", "San Juan de Aragón 5a Secc.", "San Juan de Aragón 6a Secc.",
    "San Juan de Aragón 7a Secc.", "San Miguel", "Santa María Ticomán", "Tlalpexco", "Vallejo",
    "Vallejo Poniente", "Villa de Aragón", "Villa Gustavo A. Madero"
].sort();

const App: React.FC = () => {
    const [spaces, setSpaces] = useState<Space[]>(MOCK_SPACES);
    const [view, setView] = useState<'list' | 'detail' | 'add' | 'map'>('list');
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
    const [filter, setFilter] = useState<string>('Todos');
    const [selectedColonias, setSelectedColonias] = useState<string[]>([]);
    const [showColoniaFilter, setShowColoniaFilter] = useState(false);
    const [searchColonia, setSearchColonia] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Space>>({
        type: 'Mercado',
        responsibleDirector: 'Obras',
        sensitiveTopics: [],
        keyMessages: [],
        tasksDone: [],
        images: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800'],
        politicalClimate: '',
        neighborhoodLeaders: []
    });

    const categories = ['Todos', 'Mercado', 'Deportivo', 'Cultura', 'Parque', 'Clínica', 'Fuente', 'Paradero', 'Camellón', 'Plaza', 'Sendero Seguro', 'Bajo Puente', 'Kiosko'];

    const renderStars = (rating: number) => {
        return (
            <div className="stars">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        size={12}
                        fill={s <= rating ? "var(--accent)" : "none"}
                        className={s <= rating ? "star active" : "star"}
                    />
                ))}
            </div>
        );
    };

    const handleSaveSpace = () => {
        const newSpace: Space = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name || 'Nuevo Espacio',
            type: formData.type as any || 'Mercado',
            colonia: formData.colonia || 'Villa Gustavo A. Madero',
            geoPoint: { lat: 19.48, lng: -99.11 },
            conditionRating: 3,
            impactRating: 4,
            status: 'Regular',
            budgetNeeded: 0,
            lastVisit: new Date().toISOString().split('T')[0],
            images: formData.images || [],
            description: formData.description || '',
            responsibleDirector: formData.responsibleDirector as any || 'Obras',
            sensitiveTopics: formData.sensitiveTopics || [],
            keyMessages: formData.keyMessages || [],
            tasksDone: formData.tasksDone || [],
            politicalClimate: formData.politicalClimate || '',
            neighborhoodLeaders: formData.neighborhoodLeaders || []
        };

        setSpaces([newSpace, ...spaces]);
        setView('list');
        setFormData({
            type: 'Mercado',
            responsibleDirector: 'Obras',
            sensitiveTopics: [],
            keyMessages: [],
            tasksDone: [],
            images: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800'],
            politicalClimate: '',
            neighborhoodLeaders: []
        });
    };

    const renderList = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="header">
                <div className="logo-container">
                    <img src="http://gamadero.cdmx.gob.mx/assets/img/logo_gam1.webp" alt="GAM" className="logo-img" />
                    <div className="title-group">
                        <h1>Espacios GAM</h1>
                        <p>Radiografía de Territorio</p>
                    </div>
                </div>
            </header>

            <div className="search-bar">
                <Search size={18} color="#999" />
                <input
                    type="text"
                    placeholder="Buscar mercado, parque, deportivo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    onClick={() => setShowColoniaFilter(true)}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                    <Filter size={18} color={selectedColonias.length > 0 ? "var(--primary)" : "#999"} />
                    {selectedColonias.length > 0 && <span className="filter-count">{selectedColonias.length}</span>}
                </button>
            </div>

            <AnimatePresence>
                {showColoniaFilter && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="colonia-modal-overlay"
                        onClick={() => setShowColoniaFilter(false)}
                    >
                        <div className="colonia-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Filtrar por Colonias</h3>
                                <button onClick={() => setShowColoniaFilter(false)} className="close-btn">×</button>
                            </div>
                            <div className="modal-search">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar colonia..."
                                    value={searchColonia}
                                    onChange={(e) => setSearchColonia(e.target.value)}
                                />
                            </div>
                            <div className="colonia-list">
                                {COLONIAS_GAM.filter(c => c.toLowerCase().includes(searchColonia.toLowerCase())).map(colonia => (
                                    <label key={colonia} className="colonia-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedColonias.includes(colonia)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedColonias([...selectedColonias, colonia]);
                                                } else {
                                                    setSelectedColonias(selectedColonias.filter(c => c !== colonia));
                                                }
                                            }}
                                        />
                                        <span>{colonia}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => setSelectedColonias([])} className="btn-secondary">Limpiar</button>
                                <button onClick={() => setShowColoniaFilter(false)} className="btn-primary">Aplicar</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedColonias.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="active-filters"
                    >
                        {selectedColonias.map(colonia => (
                            <span key={colonia} className="filter-chip">
                                {colonia}
                                <button onClick={() => setSelectedColonias(selectedColonias.filter(c => c !== colonia))}>×</button>
                            </span>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="category-scroll">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`category-chip ${filter === cat ? 'active' : ''}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="spaces-list">
                {spaces
                    .filter(s => filter === 'Todos' || s.type === filter)
                    .filter(s => selectedColonias.length === 0 || selectedColonias.includes(s.colonia))
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.colonia.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(space => (
                        <motion.div
                            key={space.id}
                            whileTap={{ scale: 0.98 }}
                            className="space-card"
                            onClick={() => {
                                setSelectedSpace(space);
                                setView('detail');
                            }}
                        >
                            <img src={space.images[0]} alt={space.name} className="space-image" />
                            <div className="radiografia-badge">
                                <div className={`status-dot status-${space.status === 'Crítico' ? 'critical' : space.status === 'Regular' ? 'warning' : 'good'}`} />
                                {space.status}
                            </div>

                            <div className="space-content">
                                <div className="space-header">
                                    <div>
                                        <h2 className="space-title">{space.name}</h2>
                                        <p className="space-colonia"><MapPin size={12} /> {space.colonia}</p>
                                    </div>
                                    <div className={`impact-badge impact-${space.impactRating >= 4 ? 'high' : space.impactRating >= 3 ? 'med' : 'low'}`}>
                                        Impacto {space.impactRating >= 4 ? 'Alto' : space.impactRating >= 3 ? 'Medio' : 'Bajo'}
                                    </div>
                                </div>

                                <div className="rating-row">
                                    <div className="rating-item">
                                        <span className="rating-label">Condición</span>
                                        {renderStars(space.conditionRating)}
                                    </div>
                                    <div className="rating-item">
                                        <span className="rating-label">Importancia</span>
                                        {renderStars(space.impactRating)}
                                    </div>
                                    <div className="rating-item" style={{ textAlign: 'right' }}>
                                        <span className="rating-label">Presupuesto</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: space.budgetNeeded > 0 ? 'var(--danger)' : 'var(--safe)' }}>
                                            ${space.budgetNeeded.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
            </div>
        </motion.div>
    );

    const renderDetail = () => (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            style={{ background: 'white', minHeight: '100vh' }}
        >
            <div style={{ position: 'relative' }}>
                <img src={selectedSpace?.images[0]} alt="" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                <button
                    onClick={() => setView('list')}
                    style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div style={{ padding: '24px', marginTop: '-30px', background: 'white', borderRadius: '32px 32px 0 0', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '12px', background: 'var(--primary-light)', color: 'white', fontSize: '0.7rem', fontWeight: '700' }}>
                            {selectedSpace?.type}
                        </span>
                        <span style={{ padding: '4px 12px', borderRadius: '12px', background: 'var(--secondary)', color: 'white', fontSize: '0.7rem', fontWeight: '700' }}>
                            Dir: {selectedSpace?.responsibleDirector}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="glass" style={{ padding: '8px', borderRadius: '12px', border: 'none' }}><Camera size={18} color="var(--primary)" /></button>
                        <button className="glass" style={{ padding: '8px', borderRadius: '12px', border: 'none' }} onClick={() => setView('map')}><MapIcon size={18} color="var(--primary)" /></button>
                    </div>
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '4px' }}>{selectedSpace?.name}</h1>
                <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', marginBottom: '24px' }}>
                    <MapPin size={14} /> {selectedSpace?.colonia}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <TrendingUp size={16} color="var(--accent)" />
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Impacto Social</span>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{selectedSpace?.impactRating}/5</div>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Prioridad en Agenda</p>
                    </div>
                    <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <DollarSign size={16} color="var(--danger)" />
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Inversión</span>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>${selectedSpace?.budgetNeeded.toLocaleString()}</div>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Estimado de Obra</p>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>Radiografía Express</h3>
                    <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '20px', borderLeft: `4px solid ${selectedSpace?.status === 'Crítico' ? 'var(--danger)' : 'var(--warning)'}` }}>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#444' }}>
                            {selectedSpace?.description}
                        </p>
                    </div>
                </div>

                {selectedSpace?.politicalClimate && (
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <User size={18} color="var(--secondary)" />
                            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Clima Político (Participación Ciudadana)</h3>
                        </div>
                        <div className="glass" style={{ padding: '16px', borderRadius: '20px', borderLeft: '4px solid var(--secondary)', background: '#f0f4f3' }}>
                            <p style={{ fontSize: '0.9rem', color: '#235b4e', fontWeight: '500' }}>{selectedSpace.politicalClimate}</p>
                        </div>
                    </div>
                )}

                {selectedSpace?.neighborhoodLeaders && selectedSpace.neighborhoodLeaders.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-muted)' }}>Liderazgos Identificados</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {selectedSpace.neighborhoodLeaders.map((leader, i) => (
                                <div key={i} className="glass" style={{ padding: '12px 16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{leader.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{leader.role}</div>
                                    </div>
                                    <span style={{
                                        fontSize: '0.6rem',
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        fontWeight: '800',
                                        background: leader.affinity === 'Aliado' ? '#d1fae5' : leader.affinity === 'Opositor' ? '#fee2e2' : '#f3f4f6',
                                        color: leader.affinity === 'Aliado' ? '#059669' : leader.affinity === 'Opositor' ? '#dc2626' : '#666'
                                    }}>
                                        {leader.affinity}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <AlertTriangle size={18} color="var(--warning)" />
                        <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Temas Sensibles (Comunidad)</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedSpace?.sensitiveTopics.map((topic, i) => (
                            <div key={i} className="sensitive-topic-card">
                                {topic}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <MessageSquare size={18} color="var(--primary)" />
                        <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Mensajes para el Alcalde</h3>
                    </div>
                    <div className="key-messages-container">
                        {selectedSpace?.keyMessages.map((msg, i) => (
                            <div key={i} className="message-bubble">
                                {msg}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Check size={18} color="var(--safe)" />
                        <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Tareas Realizadas</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedSpace?.tasksDone.map((task, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#555' }}>
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#e1f5fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={12} color="#03a9f4" />
                                </div>
                                {task}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>Evidencia Fotográfica</h3>
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
                        {selectedSpace?.images.map((img, i) => (
                            <img key={i} src={img} alt="" style={{ width: '120px', height: '120px', borderRadius: '16px', objectFit: 'cover' }} />
                        ))}
                        <button style={{ width: '120px', height: '120px', borderRadius: '16px', border: '2px dashed #ccc', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#999' }}>
                            <Plus size={24} />
                            <span style={{ fontSize: '0.7rem' }}>Añadir Foto</span>
                        </button>
                    </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 15px rgba(159, 34, 65, 0.3)' }}>
                    Generar Reporte de Recorrido
                </button>
            </div>
        </motion.div>
    );

    const renderMap = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100vh', width: '100%', position: 'relative', background: '#e5e5e5' }}>
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 10 }}>
                <div className="search-bar" style={{ margin: 0 }}>
                    <Search size={18} color="#999" />
                    <input type="text" placeholder="Buscar en el mapa..." />
                </div>
            </div>

            {/* Simulated Map Background */}
            <div style={{ width: '100%', height: '100%', background: 'url(https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-99.11,19.48,11,0/800x1200?access_token=pk.eyJ1IjoiZGV2ZWxvcGVyIiwiYSI6ImNrZndnMmZ6ZzBnd2Yyc3BicmZ6ZzBnd2YifQ) center/cover' }}>
                {spaces.map(space => (
                    <motion.div
                        key={space.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            position: 'absolute',
                            left: `${50 + (space.geoPoint.lng + 99.11) * 500}%`,
                            top: `${50 - (space.geoPoint.lat - 19.48) * 500}%`,
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            setSelectedSpace(space);
                            setView('detail');
                        }}
                    >
                        <div style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50% 50% 50% 0',
                            background: space.status === 'Crítico' ? 'var(--danger)' : space.status === 'Regular' ? 'var(--warning)' : 'var(--safe)',
                            transform: 'rotate(-45deg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            border: '2px solid white'
                        }}>
                            <div style={{ transform: 'rotate(45deg)', color: 'white' }}>
                                {space.type === 'Mercado' ? 'M' : space.type === 'Deportivo' ? 'D' : 'P'}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ position: 'absolute', bottom: 100, left: 20, right: 20 }}>
                <div className="glass" style={{ padding: '16px', borderRadius: '20px', display: 'flex', gap: '12px', overflowX: 'auto' }}>
                    {spaces.slice(0, 5).map(space => (
                        <div
                            key={space.id}
                            onClick={() => { setSelectedSpace(space); setView('detail'); }}
                            style={{ minWidth: '140px', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        >
                            <img src={space.images[0]} style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                            <div style={{ padding: '8px' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{space.name}</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{space.colonia}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    const renderAdd = () => (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="add-view"
        >
            <div className="modal-header" style={{ padding: '20px' }}>
                <button onClick={() => setView('list')} className="close-btn"><ArrowLeft size={20} /></button>
                <h3>Nueva Captura de Recorrido</h3>
                <div style={{ width: 32 }}></div>
            </div>

            <div className="form-container">
                <section className="form-section">
                    <label>Director Responsable</label>
                    <select
                        className="form-input"
                        value={formData.responsibleDirector}
                        onChange={(e) => setFormData({ ...formData, responsibleDirector: e.target.value as any })}
                    >
                        <option value="Obras">Obras y Desarrollo Urbano</option>
                        <option value="Servicios Urbanos">Servicios Urbanos</option>
                        <option value="Desarrollo Social">Desarrollo Social</option>
                        <option value="Seguridad">Seguridad Ciudadana</option>
                        <option value="Gobierno">Gobierno</option>
                        <option value="Participacion">Participación Ciudadana</option>
                    </select>
                </section>

                {formData.responsibleDirector === 'Participacion' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="form-section" style={{ background: '#f0f4f3', padding: '16px', borderRadius: '20px', border: '1px solid var(--secondary)' }}>
                        <label style={{ color: 'var(--secondary)' }}>Clima Político de la Colonia</label>
                        <textarea
                            className="form-input"
                            placeholder="Análisis de la situación social y política..."
                            value={formData.politicalClimate}
                            onChange={(e) => setFormData({ ...formData, politicalClimate: e.target.value })}
                            style={{ borderColor: 'var(--secondary)' }}
                        ></textarea>

                        <label style={{ color: 'var(--secondary)', marginTop: '16px' }}>Líderes y Referentes</label>
                        <div className="tasks-capture">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Nombre del líder..."
                                id="leader-name"
                                style={{ borderColor: 'var(--secondary)' }}
                            />
                            <button
                                className="add-task-btn"
                                style={{ background: 'var(--secondary)' }}
                                onClick={() => {
                                    const nameInput = document.getElementById('leader-name') as HTMLInputElement;
                                    if (nameInput.value) {
                                        setFormData({
                                            ...formData,
                                            neighborhoodLeaders: [...(formData.neighborhoodLeaders || []), { name: nameInput.value, role: 'Líder Vecinal', affinity: 'Neutral' }]
                                        });
                                        nameInput.value = '';
                                    }
                                }}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {formData.neighborhoodLeaders?.map((l, i) => (
                                <div key={i} className="filter-chip" style={{ background: 'white', border: '1px solid var(--secondary)' }}>
                                    {l.name}
                                    <button onClick={() => setFormData({ ...formData, neighborhoodLeaders: formData.neighborhoodLeaders?.filter((_, idx) => idx !== i) })}>×</button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <section className="form-section">
                    <label>Nombre del Espacio</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Ej. Parque Lindavista"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </section>

                <section className="form-section">
                    <label>Colonia</label>
                    <select
                        className="form-input"
                        value={formData.colonia || ''}
                        onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                    >
                        <option value="">Seleccionar Colonia...</option>
                        {COLONIAS_GAM.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </section>

                <section className="form-section">
                    <label>Tipo de Espacio</label>
                    <div className="type-grid">
                        {categories.filter(c => c !== 'Todos').map(cat => (
                            <button
                                key={cat}
                                className={`type-chip ${formData.type === cat ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, type: cat as any })}
                                style={{
                                    borderColor: formData.type === cat ? 'var(--primary)' : '#eee',
                                    color: formData.type === cat ? 'var(--primary)' : 'inherit'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="form-section">
                    <label>Temas Sensibles (Comunidad)</label>
                    <textarea
                        className="form-input"
                        placeholder="¿Qué le duele a la gente aquí?"
                        value={formData.sensitiveTopics?.join('\n') || ''}
                        onChange={(e) => setFormData({ ...formData, sensitiveTopics: e.target.value.split('\n').filter(t => t.trim()) })}
                    ></textarea>
                </section>

                <section className="form-section">
                    <label>Mensajes Clave para el Alcalde</label>
                    <textarea
                        className="form-input"
                        placeholder="¿Qué debe decir el alcalde a los vecinos?"
                        value={formData.keyMessages?.join('\n') || ''}
                        onChange={(e) => setFormData({ ...formData, keyMessages: e.target.value.split('\n').filter(t => t.trim()) })}
                    ></textarea>
                </section>

                <section className="form-section">
                    <label>Evidencia de Tareas Realizadas</label>
                    <div className="tasks-capture">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Tarea realizada..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value;
                                    if (val) {
                                        setFormData({ ...formData, tasksDone: [...(formData.tasksDone || []), val] });
                                        (e.target as HTMLInputElement).value = '';
                                    }
                                }
                            }}
                        />
                        <button className="add-task-btn"><Plus size={18} /></button>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {formData.tasksDone?.map((task, i) => (
                            <div key={i} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Check size={12} color="var(--safe)" /> {task}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="form-section">
                    <label>Reporte Antes y Después</label>
                    <div className="before-after-grid">
                        <div className="photo-box">
                            <Camera size={24} />
                            <span>Antes</span>
                        </div>
                        <div className="photo-box">
                            <Camera size={24} />
                            <span>Después</span>
                        </div>
                    </div>
                </section>

                <button className="btn-primary" style={{ marginTop: '20px', width: '100%' }} onClick={handleSaveSpace}>
                    Guardar Captura de Territorio
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="app-container">
            <AnimatePresence mode="wait">
                {view === 'list' ? renderList() :
                    view === 'detail' ? renderDetail() :
                        view === 'map' ? renderMap() :
                            renderAdd()}
            </AnimatePresence>

            <nav className="bottom-nav">
                <a href="#" className={`nav-item ${view === 'list' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('list'); }}>
                    <Home size={24} />
                    <span>Inicio</span>
                </a>
                <a href="#" className={`nav-item ${view === 'map' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('map'); }}>
                    <MapIcon size={24} />
                    <span>Mapa</span>
                </a>
                <div className="fab" onClick={() => setView('add')}>
                    <Plus size={32} />
                </div>
                <a href="#" className="nav-item">
                    <LayoutGrid size={24} />
                    <span>Espacios</span>
                </a>
                <a href="#" className="nav-item">
                    <User size={24} />
                    <span>Perfil</span>
                </a>
            </nav>
        </div>
    );
};

export default App;
