import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    AlertTriangle,
    MapPin,
    ExternalLink,
    Loader2,
    Search
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Report {
    id: string;
    category: string;
    description: string;
    address: string;
    photos: string[];
    folio?: string;
    status: 'pendiente' | 'asignado' | 'atendido' | 'cerrado';
    created_at: string;
}

interface AdminViewProps {
    onBack: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ciudadano_reportes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching admin reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: Report['status']) => {
        setUpdatingId(id);
        try {
            const { error } = await supabase
                .from('ciudadano_reportes')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar el estatus.');
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'atendido': return <CheckCircle size={18} color="var(--safe)" />;
            case 'pendiente': return <Clock size={18} color="var(--accent)" />;
            default: return <AlertTriangle size={18} color="var(--primary)" />;
        }
    };

    const filteredReports = reports.filter(r =>
        r.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <header className="header" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <ArrowLeft size={20} color="var(--primary)" />
                    </button>
                    <div className="title-group">
                        <h1>Gestión de Reportes</h1>
                        <p>Panel Administrativo</p>
                    </div>
                </div>
            </header>

            <div style={{ padding: '0 16px', marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <Search
                        size={18}
                        color="var(--text-muted)"
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                        type="text"
                        placeholder="Buscar por folio o categoría..."
                        className="form-input"
                        style={{ paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                </div>
            ) : (
                <div className="report-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 16px' }}>
                    {filteredReports.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron reportes.</p>
                    ) : (
                        filteredReports.map(report => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={report.id}
                                className="location-card"
                                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {getStatusIcon(report.status)}
                                        <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>GAM-{report.id.slice(0, 8).toUpperCase()}</span>
                                    </div>
                                    <div className={`status-badge status-${report.status}`}>
                                        {report.status}
                                    </div>
                                </div>

                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', marginBottom: '4px' }}>
                                        <MapPin size={14} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{report.category}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{report.address}</p>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>{report.description}</p>
                                </div>

                                {report.photos && report.photos.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', width: '100%', paddingBottom: '8px' }}>
                                        {report.photos.map((photo, i) => (
                                            <a key={i} href={photo} target="_blank" rel="noopener noreferrer" style={{ position: 'relative' }}>
                                                <img
                                                    src={photo}
                                                    alt="evidencia"
                                                    style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #eee' }}
                                                />
                                                <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '2px' }}>
                                                    <ExternalLink size={10} color="white" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '8px', width: '100%', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                                    {report.status === 'pendiente' && (
                                        <button
                                            className="btn-submit"
                                            style={{ marginTop: 0, padding: '8px', fontSize: '0.8rem' }}
                                            onClick={() => updateStatus(report.id, 'atendido')}
                                            disabled={updatingId === report.id}
                                        >
                                            {updatingId === report.id ? '...' : 'Marcar como Atendido'}
                                        </button>
                                    )}
                                    {report.status === 'atendido' && (
                                        <button
                                            className="btn-submit"
                                            style={{ marginTop: 0, padding: '8px', fontSize: '0.8rem', background: '#eee', color: '#666' }}
                                            onClick={() => updateStatus(report.id, 'pendiente')}
                                            disabled={updatingId === report.id}
                                        >
                                            Reabrir
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminView;
