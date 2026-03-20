'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

const CYCLES = {
  1: { id: 1, name: 'Q1 Performance Review 2026', type: 'Trimestral', start: '2026-03-01', end: '2026-03-31', status: 'active', description: 'Evaluación de desempeño del primer trimestre 2026. Enfocada en resultados, competencias y objetivos del período.' },
  2: { id: 2, name: 'Mid-Year Review 2026', type: 'Semestral', start: '2026-06-01', end: '2026-06-30', status: 'draft', description: 'Revisión de mitad de año con énfasis en crecimiento y desarrollo profesional.' },
  3: { id: 3, name: 'Evaluación Anual 2025', type: 'Anual', start: '2025-12-01', end: '2025-12-31', status: 'completed', description: 'Evaluación anual de desempeño y competencias.' },
};

const PARTICIPANTS = [
  { id: 1, name: 'Ana García', role: 'Senior Developer', avatar: 'AG', selfStatus: 'completed', managerStatus: 'completed', updatedAt: 'hace 2 días' },
  { id: 2, name: 'Carlos López', role: 'Product Manager', avatar: 'CL', selfStatus: 'in_progress', managerStatus: 'pending', updatedAt: 'hace 5 horas' },
  { id: 3, name: 'María Rodríguez', role: 'UX Designer', avatar: 'MR', selfStatus: 'completed', managerStatus: 'in_progress', updatedAt: 'ayer' },
  { id: 4, name: 'Juan Pérez', role: 'Data Analyst', avatar: 'JP', selfStatus: 'pending', managerStatus: 'pending', updatedAt: '—' },
  { id: 5, name: 'Laura Martínez', role: 'Backend Developer', avatar: 'LM', selfStatus: 'completed', managerStatus: 'completed', updatedAt: 'hace 1 día' },
  { id: 6, name: 'Diego Fernández', role: 'Frontend Developer', avatar: 'DF', selfStatus: 'in_progress', managerStatus: 'pending', updatedAt: 'hace 3 horas' },
  { id: 7, name: 'Valentina Gómez', role: 'QA Engineer', avatar: 'VG', selfStatus: 'pending', managerStatus: 'pending', updatedAt: '—' },
  { id: 8, name: 'Martín Torres', role: 'DevOps Engineer', avatar: 'MT', selfStatus: 'completed', managerStatus: 'pending', updatedAt: 'hace 4 días' },
];

const REVIEW_STATUS = {
  completed: { label: 'Completada', color: '#15803D', bg: '#F0FDF4' },
  in_progress: { label: 'En progreso', color: '#92400E', bg: '#FFFBEB' },
  pending: { label: 'Pendiente', color: '#78716C', bg: '#F5F5F4' },
};

const CYCLE_STATUS = {
  active: { label: 'Activo', color: '#15803D', bg: '#F0FDF4', dot: '#22C55E' },
  draft: { label: 'Borrador', color: '#78716C', bg: '#F5F5F4', dot: '#A8A29E' },
  completed: { label: 'Completado', color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6' },
};

function fmt(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CycleDetailClient({ user, profile, cycleId }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('participants');
  const cycle = CYCLES[cycleId] || CYCLES[1];
  const cs = CYCLE_STATUS[cycle.status];

  const total = PARTICIPANTS.length;
  const selfDone = PARTICIPANTS.filter(p => p.selfStatus === 'completed').length;
  const managerDone = PARTICIPANTS.filter(p => p.managerStatus === 'completed').length;
  const fullyDone = PARTICIPANTS.filter(p => p.selfStatus === 'completed' && p.managerStatus === 'completed').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F4' }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 40px 60px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            <button
              onClick={() => router.push('/review-cycles')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#A8A29E', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#78716C'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A8A29E'}
            >
              ← Ciclos
            </button>
            <span style={{ color: '#D6D3D1', fontSize: 13 }}>/</span>
            <span style={{ fontSize: 13, color: '#78716C' }}>{cycle.name}</span>
          </div>

          {/* Cycle header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>
                  {cycle.name}
                </h1>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
                  background: cs.bg, color: cs.color,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: cs.dot }} />
                  {cs.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: '#78716C' }}>
                {fmt(cycle.start)} — {fmt(cycle.end)} · {cycle.type}
              </p>
              {cycle.description && (
                <p style={{ margin: '10px 0 0', fontSize: 13.5, color: '#A8A29E', maxWidth: 560, lineHeight: 1.6 }}>
                  {cycle.description}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => router.push(`/review-cycles/${cycle.id}/self-assessment`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 8, border: 'none',
                  background: '#0C0A09', color: '#FFFFFF',
                  fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#292524'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#0C0A09'}
              >
                Mi autoevaluación
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#E7E5E4', margin: '28px 0' }} />

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { val: total, label: 'Participantes', color: '#0C0A09' },
              { val: `${selfDone}/${total}`, label: 'Autoevaluaciones', color: '#0C0A09' },
              { val: `${managerDone}/${total}`, label: 'Revisiones de manager', color: '#0C0A09' },
              { val: `${Math.round((fullyDone / total) * 100)}%`, label: 'Completitud total', color: fullyDone === total ? '#15803D' : '#0C0A09' },
            ].map((s) => (
              <div key={s.label} style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, padding: '18px 20px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 600, color: s.color, letterSpacing: '-0.03em' }}>{s.val}</p>
                <p style={{ margin: 0, fontSize: 12.5, color: '#78716C' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>Progreso del ciclo</span>
              <span style={{ fontSize: 13, color: '#78716C' }}>{fullyDone} de {total} completadas</span>
            </div>
            <div style={{ height: 6, background: '#F5F5F4', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.round((fullyDone / total) * 100)}%`,
                background: '#0C0A09',
                borderRadius: 6,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
              {[
                { label: 'Completadas', count: fullyDone, color: '#15803D' },
                { label: 'En progreso', count: PARTICIPANTS.filter(p => p.selfStatus === 'in_progress' || p.managerStatus === 'in_progress').length, color: '#92400E' },
                { label: 'Pendientes', count: PARTICIPANTS.filter(p => p.selfStatus === 'pending' && p.managerStatus === 'pending').length, color: '#A8A29E' },
              ].map((l) => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#78716C' }}>{l.count} {l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E7E5E4', marginBottom: 0 }}>
            {['participants', 'overview'].map((t) => {
              const labels = { participants: 'Participantes', overview: 'Resumen' };
              const active = activeTab === t;
              return (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: '12px 4px', marginRight: 20, border: 'none',
                  borderBottom: active ? '2px solid #0C0A09' : '2px solid transparent',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: 13.5, fontWeight: active ? 600 : 400,
                  color: active ? '#0C0A09' : '#78716C',
                  marginBottom: -1,
                }}>
                  {labels[t]}
                </button>
              );
            })}
          </div>

          {/* Participants table */}
          {activeTab === 'participants' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderRadius: 12, overflow: 'hidden', marginTop: 0, borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              {/* Head */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 160px 140px 140px 130px 80px',
                padding: '9px 24px', background: '#FAFAF9', borderBottom: '1px solid #F5F5F4',
                fontSize: 11.5, fontWeight: 500, color: '#A8A29E', letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                <span>Persona</span><span>Cargo</span><span>Autoevaluación</span><span>Revisión manager</span><span>Actualizado</span><span />
              </div>

              {PARTICIPANTS.map((p, i) => {
                const ss = REVIEW_STATUS[p.selfStatus];
                const ms = REVIEW_STATUS[p.managerStatus];
                return (
                  <div key={p.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 160px 140px 140px 130px 80px',
                    padding: '14px 24px', alignItems: 'center',
                    borderBottom: i < PARTICIPANTS.length - 1 ? '1px solid #FAFAF9' : 'none',
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', background: '#1C1917',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600, color: '#78716C', flexShrink: 0,
                      }}>{p.avatar}</div>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: '#0C0A09' }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#78716C' }}>{p.role}</span>
                    <span>
                      <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: ss.bg, color: ss.color }}>{ss.label}</span>
                    </span>
                    <span>
                      <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: ms.bg, color: ms.color }}>{ms.label}</span>
                    </span>
                    <span style={{ fontSize: 12.5, color: '#A8A29E' }}>{p.updatedAt}</span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        onClick={() => router.push(`/review-cycles/${cycle.id}/review/${p.id}`)}
                        style={{
                          fontSize: 12.5, fontWeight: 500, color: '#0C0A09',
                          background: 'none', border: '1px solid #E7E5E4',
                          borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F4'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        Revisar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'overview' && (
            <div style={{ paddingTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { title: 'Tipo de evaluación', value: cycle.type },
                { title: 'Estado actual', value: cs.label },
                { title: 'Fecha de inicio', value: fmt(cycle.start) },
                { title: 'Fecha de cierre', value: fmt(cycle.end) },
              ].map((item) => (
                <div key={item.title} style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, padding: '18px 20px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{item.title}</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#0C0A09' }}>{item.value}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
