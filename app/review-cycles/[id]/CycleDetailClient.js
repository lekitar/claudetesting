'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/app/components/Sidebar';

const REVIEW_STATUS = {
  completed: { label: 'Completada', color: '#15803D', bg: '#F0FDF4' },
  in_progress: { label: 'En progreso', color: '#92400E', bg: '#FFFBEB' },
  pending: { label: 'Pendiente', color: '#78716C', bg: '#F5F5F4' },
};

const CYCLE_STATUS = {
  active: { label: 'Activo', color: '#15803D', bg: '#F0FDF4', dot: '#22C55E' },
  draft: { label: 'Borrador', color: '#78716C', bg: '#F5F5F4', dot: '#A8A29E' },
  completed: { label: 'Completado', color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6' },
  archived: { label: 'Archivado', color: '#92400E', bg: '#FFF7ED', dot: '#F97316' },
};

const TYPE_LABELS = { quarterly: 'Trimestral', semiannual: 'Semestral', annual: 'Anual', custom: 'Personalizado' };

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtRelative(d) {
  if (!d) return '—';
  const diff = Math.floor((Date.now() - new Date(d)) / 1000 / 60);
  if (diff < 60) return `hace ${diff}m`;
  if (diff < 1440) return `hace ${Math.floor(diff / 60)}h`;
  return `hace ${Math.floor(diff / 1440)}d`;
}

export default function CycleDetailClient({ user, profile, cycle, participants, myReview }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('participants');
  const cs = CYCLE_STATUS[cycle.status] || CYCLE_STATUS.draft;
  const isSuperAdmin = profile?.role === 'super_admin';

  const total = participants.length;
  const selfDone = participants.filter(p => p.selfStatus === 'completed').length;
  const managerDone = participants.filter(p => p.managerStatus === 'completed').length;
  const fullyDone = participants.filter(p => p.selfStatus === 'completed' && p.managerStatus === 'completed').length;
  const pct = total > 0 ? Math.round((fullyDone / total) * 100) : 0;

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F4', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 40px 60px' }}>

          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}
          >
            <button onClick={() => router.push('/review-cycles')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#A8A29E', padding: 0 }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#78716C'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A8A29E'}
            >← Ciclos</button>
            <span style={{ color: '#D6D3D1', fontSize: 13 }}>/</span>
            <span style={{ fontSize: 13, color: '#78716C' }}>{cycle.name}</span>
          </motion.div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>{cycle.name}</h1>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500,
                  padding: '3px 10px', borderRadius: 20, background: cs.bg, color: cs.color,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: cs.dot }} />
                  {cs.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: '#78716C' }}>
                {fmt(cycle.start_date)} — {fmt(cycle.end_date)} · {TYPE_LABELS[cycle.type] || cycle.type}
              </p>
              {cycle.description && (
                <p style={{ margin: '10px 0 0', fontSize: 13.5, color: '#A8A29E', maxWidth: 520, lineHeight: 1.6 }}>{cycle.description}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {myReview ? (
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => router.push(`/review-cycles/${cycle.id}/self-assessment`)}
                  style={{
                    padding: '9px 16px', borderRadius: 8, border: 'none',
                    background: myReview.status === 'completed' ? '#F0FDF4' : '#0C0A09',
                    color: myReview.status === 'completed' ? '#15803D' : '#FFFFFF',
                    fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  {myReview.status === 'completed' ? '✓ Autoevaluación enviada' : myReview.status === 'in_progress' ? 'Continuar autoevaluación' : 'Completar autoevaluación'}
                </motion.button>
              ) : (
                <p style={{ fontSize: 13, color: '#A8A29E', margin: 0, alignSelf: 'center' }}>No participás en este ciclo</p>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ height: 1, background: '#E7E5E4', margin: '28px 0' }}
          />

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}
          >
            {[
              { val: total, label: 'Participantes' },
              { val: `${selfDone}/${total}`, label: 'Autoevaluaciones' },
              { val: `${managerDone}/${total}`, label: 'Reviews de manager' },
              { val: `${pct}%`, label: 'Completitud total', color: fullyDone === total && total > 0 ? '#15803D' : '#0C0A09' },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 + i * 0.04 }}
                style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, padding: '18px 20px' }}
              >
                <p style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 600, color: s.color || '#0C0A09', letterSpacing: '-0.03em' }}>{s.val}</p>
                <p style={{ margin: 0, fontSize: 12.5, color: '#78716C' }}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Progress bar */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>Progreso general</span>
              <span style={{ fontSize: 13, color: '#78716C' }}>{fullyDone} de {total} completas</span>
            </div>
            <div style={{ height: 6, background: '#F5F5F4', borderRadius: 6, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                style={{ height: '100%', background: '#0C0A09', borderRadius: 6 }}
              />
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E7E5E4', marginBottom: 0 }}
          >
            {[{ key: 'participants', label: 'Participantes' }, { key: 'overview', label: 'Resumen' }].map((t) => {
              const active = activeTab === t.key;
              return (
                <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                  padding: '12px 4px', marginRight: 20, border: 'none',
                  borderBottom: active ? '2px solid #0C0A09' : '2px solid transparent',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: 13.5, fontWeight: active ? 600 : 400, color: active ? '#0C0A09' : '#78716C',
                  marginBottom: -1,
                }}>{t.label}</button>
              );
            })}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'participants' && (
              <motion.div key="participants"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '0 0 12px 12px', borderTop: 'none', overflow: 'hidden' }}
              >
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 160px 140px 140px 130px 80px',
                  padding: '9px 24px', background: '#FAFAF9', borderBottom: '1px solid #F5F5F4',
                  fontSize: 11.5, fontWeight: 500, color: '#A8A29E', letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  <span>Persona</span><span>Cargo</span><span>Autoevaluación</span><span>Manager</span><span>Actualizado</span><span />
                </div>

                {participants.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#A8A29E' }}>No hay participantes en este ciclo</p>
                  </div>
                ) : participants.map((p, i) => {
                  const ss = REVIEW_STATUS[p.selfStatus] || REVIEW_STATUS.pending;
                  const ms = REVIEW_STATUS[p.managerStatus] || REVIEW_STATUS.pending;
                  return (
                    <motion.div key={p.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 + i * 0.03 }}
                      style={{
                        display: 'grid', gridTemplateColumns: '1fr 160px 140px 140px 130px 80px',
                        padding: '14px 24px', alignItems: 'center', cursor: 'pointer',
                        borderBottom: i < participants.length - 1 ? '1px solid #FAFAF9' : 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1C1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#78716C', flexShrink: 0 }}>
                          {initials(p.full_name)}
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: '#0C0A09' }}>{p.full_name || '—'}</span>
                      </div>
                      <span style={{ fontSize: 13, color: '#78716C' }}>{p.job_title || '—'}</span>
                      <span>
                        <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: ss.bg, color: ss.color }}>{ss.label}</span>
                      </span>
                      <span>
                        <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: ms.bg, color: ms.color }}>{ms.label}</span>
                      </span>
                      <span style={{ fontSize: 12.5, color: '#A8A29E' }}>{fmtRelative(p.updatedAt)}</span>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {isSuperAdmin && (
                          <button
                            onClick={() => router.push(`/review-cycles/${cycle.id}/review/${p.id}`)}
                            style={{ fontSize: 12.5, fontWeight: 500, color: '#0C0A09', background: 'none', border: '1px solid #E7E5E4', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F4'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          >
                            Revisar
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'overview' && (
              <motion.div key="overview"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ paddingTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
              >
                {[
                  { title: 'Tipo de evaluación', value: TYPE_LABELS[cycle.type] || cycle.type },
                  { title: 'Estado actual', value: cs.label },
                  { title: 'Fecha de inicio', value: fmt(cycle.start_date) },
                  { title: 'Fecha de cierre', value: fmt(cycle.end_date) },
                ].map((item) => (
                  <div key={item.title} style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, padding: '18px 20px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{item.title}</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#0C0A09' }}>{item.value}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
