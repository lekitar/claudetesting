'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

const CYCLES = [
  { id: 1, name: 'Q1 Performance Review 2026', type: 'Trimestral', start: '2026-03-01', end: '2026-03-31', status: 'active', participants: 138, completed: 89 },
  { id: 2, name: 'Mid-Year Review 2026', type: 'Semestral', start: '2026-06-01', end: '2026-06-30', status: 'draft', participants: 0, completed: 0 },
  { id: 3, name: 'Evaluación Anual 2025', type: 'Anual', start: '2025-12-01', end: '2025-12-31', status: 'completed', participants: 135, completed: 135 },
  { id: 4, name: 'Q3 Review 2025', type: 'Trimestral', start: '2025-09-01', end: '2025-09-30', status: 'completed', participants: 130, completed: 127 },
  { id: 5, name: 'Q2 Peer Feedback 2026', type: 'Trimestral', start: '2026-07-01', end: '2026-07-31', status: 'draft', participants: 0, completed: 0 },
];

const STATUS = {
  active: { label: 'Activo', color: '#15803D', bg: '#F0FDF4', dot: '#22C55E' },
  draft: { label: 'Borrador', color: '#78716C', bg: '#F5F5F4', dot: '#A8A29E' },
  completed: { label: 'Completado', color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6' },
};

const TYPE_COLOR = {
  Anual: '#7C3AED',
  Semestral: '#0369A1',
  Trimestral: '#065F46',
};

const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'draft', label: 'Borradores' },
  { key: 'completed', label: 'Completados' },
];

function fmt(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReviewCyclesClient({ user, profile }) {
  const router = useRouter();
  const [cycles, setCycles] = useState(CYCLES);
  const [tab, setTab] = useState('all');

  const filtered = tab === 'all' ? cycles : cycles.filter(c => c.status === tab);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F4' }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 40px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>
                Ciclos de evaluación
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#78716C' }}>
                {cycles.filter(c => c.status === 'active').length} activos · {cycles.length} en total
              </p>
            </div>
            <button
              onClick={() => router.push('/review-cycles/new')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 8, border: 'none',
                background: '#0C0A09', color: '#FFFFFF',
                fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#292524'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0C0A09'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo ciclo
            </button>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { val: cycles.filter(c => c.status === 'active').length, label: 'Ciclos activos', hint: 'en este momento' },
              { val: cycles.reduce((s, c) => s + c.participants, 0), label: 'Participantes totales', hint: 'acumulado histórico' },
              {
                val: (() => {
                  const withData = cycles.filter(c => c.participants > 0);
                  return withData.length ? Math.round(withData.reduce((s, c) => s + (c.completed / c.participants) * 100, 0) / withData.length) + '%' : '—';
                })(),
                label: 'Completitud promedio',
                hint: 'de todos los ciclos',
              },
            ].map((s) => (
              <div key={s.label} style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, padding: '20px 20px 18px' }}>
                <p style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.04em' }}>{s.val}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#292524' }}>{s.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#A8A29E' }}>{s.hint}</p>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden' }}>

            {/* Tabs */}
            <div style={{ padding: '0 24px', borderBottom: '1px solid #F5F5F4', display: 'flex', gap: 0 }}>
              {TABS.map((t) => {
                const count = t.key === 'all' ? cycles.length : cycles.filter(c => c.status === t.key).length;
                const active = tab === t.key;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)} style={{
                    padding: '14px 4px', marginRight: 20,
                    border: 'none', borderBottom: active ? '2px solid #0C0A09' : '2px solid transparent',
                    background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13.5, fontWeight: active ? 600 : 400,
                    color: active ? '#0C0A09' : '#78716C',
                    marginBottom: -1,
                  }}>
                    {t.label}
                    <span style={{
                      fontSize: 11, padding: '1px 6px', borderRadius: 10,
                      background: active ? '#F5F5F4' : '#FAFAF9',
                      color: active ? '#0C0A09' : '#A8A29E',
                      fontWeight: 500,
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Table head */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 100px 200px 170px 110px 80px',
              padding: '9px 24px', background: '#FAFAF9', borderBottom: '1px solid #F5F5F4',
              fontSize: 11.5, fontWeight: 500, color: '#A8A29E', letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              <span>Ciclo</span><span>Tipo</span><span>Período</span><span>Progreso</span><span>Estado</span><span />
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 14, color: '#A8A29E' }}>No hay ciclos en esta categoría</p>
              </div>
            ) : filtered.map((c, i) => {
              const st = STATUS[c.status];
              const pct = c.participants > 0 ? Math.round((c.completed / c.participants) * 100) : 0;
              const typeColor = TYPE_COLOR[c.type] || '#78716C';
              return (
                <div
                  key={c.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 100px 200px 170px 110px 80px',
                    padding: '15px 24px', alignItems: 'center', cursor: 'pointer',
                    borderBottom: i < filtered.length - 1 ? '1px solid #FAFAF9' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => router.push(`/review-cycles/${c.id}`)}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: '#0C0A09' }}>{c.name}</span>

                  <span style={{ fontSize: 12, fontWeight: 500, color: typeColor }}>{c.type}</span>

                  <span style={{ fontSize: 13, color: '#78716C' }}>
                    {fmt(c.start)} – {fmt(c.end)}
                  </span>

                  <div>
                    {c.participants > 0 ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 4, background: '#F5F5F4', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#15803D' : '#0C0A09', borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#78716C', minWidth: 28 }}>{pct}%</span>
                        </div>
                        <span style={{ fontSize: 11.5, color: '#A8A29E' }}>{c.completed}/{c.participants}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 13, color: '#D6D3D1' }}>Sin asignar</span>
                    )}
                  </div>

                  <span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
                      background: st.bg, color: st.color,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                      {st.label}
                    </span>
                  </span>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      style={{ fontSize: 12.5, fontWeight: 500, color: '#0C0A09', background: 'none', border: '1px solid #E7E5E4', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      onClick={(e) => { e.stopPropagation(); router.push(`/review-cycles/${c.id}`); }}
                    >
                      Ver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
