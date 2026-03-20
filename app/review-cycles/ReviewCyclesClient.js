'use client';

import { useState } from 'react';
import Sidebar from '@/app/components/Sidebar';

const MOCK_CYCLES = [
  {
    id: 1,
    name: 'Q1 Performance Review 2026',
    type: 'Trimestral',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'active',
    participants: 138,
    completed: 89,
    description: 'Evaluación de desempeño del primer trimestre 2026.',
  },
  {
    id: 2,
    name: 'Mid-Year Review 2026',
    type: 'Semestral',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: 'draft',
    participants: 0,
    completed: 0,
    description: 'Revisión de medio año con énfasis en objetivos y desarrollo.',
  },
  {
    id: 3,
    name: 'Evaluación Anual 2025',
    type: 'Anual',
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    status: 'completed',
    participants: 135,
    completed: 135,
    description: 'Evaluación anual de desempeño y competencias del equipo.',
  },
  {
    id: 4,
    name: 'Q3 Performance Review 2025',
    type: 'Trimestral',
    startDate: '2025-09-01',
    endDate: '2025-09-30',
    status: 'completed',
    participants: 130,
    completed: 127,
    description: 'Evaluación trimestral Q3 2025.',
  },
  {
    id: 5,
    name: 'Q2 Peer Feedback 2026',
    type: 'Trimestral',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    status: 'draft',
    participants: 0,
    completed: 0,
    description: 'Ciclo de feedback entre pares para el Q2.',
  },
];

const STATUS_CONFIG = {
  active: { label: 'Activo', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', dot: '#10B981' },
  draft: { label: 'Borrador', bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB', dot: '#9CA3AF' },
  completed: { label: 'Completado', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', dot: '#3B82F6' },
  archived: { label: 'Archivado', bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA', dot: '#F97316' },
};

const TYPE_CONFIG = {
  'Anual': { bg: '#F5F3FF', color: '#6D28D9' },
  'Semestral': { bg: '#EFF6FF', color: '#1D4ED8' },
  'Trimestral': { bg: '#F0FDF4', color: '#15803D' },
};

const FILTER_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'draft', label: 'Borradores' },
  { key: 'completed', label: 'Completados' },
];

function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: '#E4E7EC' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? '#059669' : '#4F46E5',
          }}
        />
      </div>
      <span className="text-xs tabular-nums" style={{ color: '#667085', minWidth: 32 }}>
        {pct}%
      </span>
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CreateCycleModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '',
    type: 'Trimestral',
    startDate: '',
    endDate: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) return;
    onCreate({
      ...form,
      id: Date.now(),
      status: 'draft',
      participants: 0,
      completed: 0,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(16, 24, 40, 0.4)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-xl"
        style={{ background: '#FFFFFF', border: '1px solid #E4E7EC' }}
      >
        {/* Modal header */}
        <div className="px-6 py-5" style={{ borderBottom: '1px solid #E4E7EC' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold" style={{ color: '#101828' }}>
                Crear ciclo de evaluación
              </h2>
              <p className="text-sm mt-0.5" style={{ color: '#667085' }}>
                Define los parámetros del nuevo ciclo
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#98A2B3' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#667085'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#98A2B3'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#344054' }}>
              Nombre del ciclo <span style={{ color: '#F04438' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Q2 Performance Review 2026"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                border: '1px solid #D0D5DD',
                color: '#101828',
                background: '#FFFFFF',
              }}
              onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
              onBlur={(e) => e.target.style.borderColor = '#D0D5DD'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#344054' }}>
              Tipo de evaluación
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                border: '1px solid #D0D5DD',
                color: '#101828',
                background: '#FFFFFF',
              }}
              onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
              onBlur={(e) => e.target.style.borderColor = '#D0D5DD'}
            >
              <option>Trimestral</option>
              <option>Semestral</option>
              <option>Anual</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#344054' }}>
                Fecha de inicio <span style={{ color: '#F04438' }}>*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{ border: '1px solid #D0D5DD', color: '#101828', background: '#FFFFFF' }}
                onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                onBlur={(e) => e.target.style.borderColor = '#D0D5DD'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#344054' }}>
                Fecha de fin <span style={{ color: '#F04438' }}>*</span>
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{ border: '1px solid #D0D5DD', color: '#101828', background: '#FFFFFF' }}
                onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                onBlur={(e) => e.target.style.borderColor = '#D0D5DD'}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#344054' }}>
              Descripción <span className="font-normal" style={{ color: '#98A2B3' }}>(opcional)</span>
            </label>
            <textarea
              placeholder="Describe el objetivo de este ciclo de evaluación..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all resize-none"
              style={{ border: '1px solid #D0D5DD', color: '#101828', background: '#FFFFFF' }}
              onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
              onBlur={(e) => e.target.style.borderColor = '#D0D5DD'}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: '#FFFFFF', border: '1px solid #D0D5DD', color: '#344054' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: '#4F46E5', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4338CA'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#4F46E5'}
            >
              Crear ciclo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReviewCyclesClient({ user, profile }) {
  const [cycles, setCycles] = useState(MOCK_CYCLES);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const filtered = activeFilter === 'all'
    ? cycles
    : cycles.filter((c) => c.status === activeFilter);

  const handleCreate = (newCycle) => {
    setCycles((prev) => [newCycle, ...prev]);
    setActiveFilter('draft');
  };

  const activeCycles = cycles.filter((c) => c.status === 'active');
  const totalParticipants = cycles.reduce((sum, c) => sum + c.participants, 0);
  const avgCompletion = cycles.filter(c => c.participants > 0).reduce((sum, c) => {
    return sum + Math.round((c.completed / c.participants) * 100);
  }, 0) / (cycles.filter(c => c.participants > 0).length || 1);

  return (
    <div className="flex min-h-screen" style={{ background: '#F7F8FA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Sidebar user={user} profile={profile} />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header
          className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E4E7EC' }}
        >
          <div>
            <h1 className="text-lg font-semibold" style={{ color: '#101828' }}>Ciclos de evaluación</h1>
            <p className="text-sm" style={{ color: '#667085' }}>
              {activeCycles.length} ciclo{activeCycles.length !== 1 ? 's' : ''} activo{activeCycles.length !== 1 ? 's' : ''} · {cycles.length} en total
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: '#4F46E5', color: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4338CA'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#4F46E5'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Crear ciclo
          </button>
        </header>

        <div className="p-8 space-y-6">

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Ciclos activos', value: activeCycles.length, sub: 'en este momento' },
              { label: 'Total participantes', value: totalParticipants.toLocaleString('es'), sub: 'en todos los ciclos' },
              { label: 'Tasa de completitud', value: `${Math.round(avgCompletion)}%`, sub: 'promedio general' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl px-6 py-5"
                style={{ background: '#FFFFFF', border: '1px solid #E4E7EC' }}
              >
                <p className="text-2xl font-bold mb-1" style={{ color: '#101828' }}>{s.value}</p>
                <p className="text-sm font-medium" style={{ color: '#344054' }}>{s.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#98A2B3' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs + list */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E4E7EC' }}>
            {/* Tabs */}
            <div
              className="px-6 flex items-center gap-1"
              style={{ borderBottom: '1px solid #E4E7EC' }}
            >
              {FILTER_TABS.map((tab) => {
                const count = tab.key === 'all' ? cycles.length : cycles.filter(c => c.status === tab.key).length;
                const isActive = activeFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className="flex items-center gap-1.5 px-1 py-3.5 text-sm font-medium transition-colors relative"
                    style={{
                      color: isActive ? '#4F46E5' : '#667085',
                      borderBottom: isActive ? '2px solid #4F46E5' : '2px solid transparent',
                      marginBottom: -1,
                    }}
                  >
                    {tab.label}
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        background: isActive ? '#EEF2FF' : '#F2F4F7',
                        color: isActive ? '#4F46E5' : '#98A2B3',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Table header */}
            <div
              className="grid px-6 py-2.5 text-xs font-medium"
              style={{
                gridTemplateColumns: '2fr 110px 200px 160px 120px 100px',
                background: '#F9FAFB',
                borderBottom: '1px solid #E4E7EC',
                color: '#667085',
              }}
            >
              <span>Ciclo</span>
              <span>Tipo</span>
              <span>Período</span>
              <span>Progreso</span>
              <span>Estado</span>
              <span className="text-right">Acciones</span>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: '#F2F4F7' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: '#344054' }}>No hay ciclos en esta categoría</p>
                <p className="text-sm mt-1" style={{ color: '#98A2B3' }}>Crea un nuevo ciclo para empezar</p>
              </div>
            ) : (
              filtered.map((cycle, i) => {
                const st = STATUS_CONFIG[cycle.status];
                const tp = TYPE_CONFIG[cycle.type] || { bg: '#F2F4F7', color: '#667085' };
                const isLast = i === filtered.length - 1;

                return (
                  <div
                    key={cycle.id}
                    className="grid px-6 py-4 items-center transition-colors cursor-pointer"
                    style={{
                      gridTemplateColumns: '2fr 110px 200px 160px 120px 100px',
                      borderBottom: isLast ? 'none' : '1px solid #F2F4F7',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Name */}
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#101828' }}>{cycle.name}</p>
                      {cycle.description && (
                        <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: '#98A2B3' }}>
                          {cycle.description}
                        </p>
                      )}
                    </div>

                    {/* Type */}
                    <span
                      className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full w-fit"
                      style={{ background: tp.bg, color: tp.color }}
                    >
                      {cycle.type}
                    </span>

                    {/* Period */}
                    <span className="text-sm" style={{ color: '#667085' }}>
                      {formatDate(cycle.startDate)} – {formatDate(cycle.endDate)}
                    </span>

                    {/* Progress */}
                    <div>
                      {cycle.participants > 0 ? (
                        <>
                          <ProgressBar completed={cycle.completed} total={cycle.participants} />
                          <p className="text-xs mt-1" style={{ color: '#98A2B3' }}>
                            {cycle.completed} / {cycle.participants} participantes
                          </p>
                        </>
                      ) : (
                        <span className="text-sm" style={{ color: '#D0D5DD' }}>Sin asignar</span>
                      )}
                    </div>

                    {/* Status */}
                    <span>
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: st.dot }}
                        />
                        {st.label}
                      </span>
                    </span>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                        style={{ color: '#4F46E5' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF2FF'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        Ver
                      </button>
                      <button
                        className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                        style={{ color: '#98A2B3' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F2F4F7'; e.currentTarget.style.color = '#667085'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#98A2B3'; }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <CreateCycleModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
