'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/app/components/Sidebar';

const STATUS = {
  active: { label: 'Activo', color: '#15803D', bg: '#F0FDF4', dot: '#22C55E' },
  draft: { label: 'Borrador', color: '#78716C', bg: '#F5F5F4', dot: '#A8A29E' },
  completed: { label: 'Completado', color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6' },
  archived: { label: 'Archivado', color: '#92400E', bg: '#FFF7ED', dot: '#F97316' },
};

const TYPE_LABELS = { quarterly: 'Trimestral', semiannual: 'Semestral', annual: 'Anual', custom: 'Personalizado' };
const TYPE_COLORS = { quarterly: '#065F46', semiannual: '#0369A1', annual: '#7C3AED', custom: '#44403C' };

const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'draft', label: 'Borradores' },
  { key: 'completed', label: 'Completados' },
];

function fmt(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReviewCyclesClient({ user, profile, cycles: initialCycles }) {
  const router = useRouter();
  const [cycles] = useState(initialCycles);
  const [tab, setTab] = useState('all');
  const isSuperAdmin = profile?.role === 'super_admin';

  const filtered = tab === 'all' ? cycles : cycles.filter(c => c.status === tab);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F4', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 40px' }}>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}
          >
            <div>
              <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>
                Ciclos de evaluación
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: '#78716C' }}>
                {cycles.filter(c => c.status === 'active').length} activos · {cycles.length} en total
              </p>
            </div>
            {isSuperAdmin && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/review-cycles/new')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                  borderRadius: 8, border: 'none', background: '#0C0A09', color: '#FFFFFF',
                  fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#292524'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#0C0A09'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Nuevo ciclo
              </motion.button>
            )}
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}
          >
            {[
              { val: cycles.filter(c => c.status === 'active').length, label: 'Ciclos activos', hint: 'en este momento' },
              { val: cycles.reduce((s, c) => s + (c.participantCount || 0), 0), label: 'Participantes totales', hint: 'acumulado' },
              {
                val: (() => {
                  const withData = cycles.filter(c => c.reviewStats?.total > 0);
                  if (!withData.length) return '—';
                  return Math.round(withData.reduce((s, c) => s + (c.reviewStats.completed / c.reviewStats.total) * 100, 0) / withData.length) + '%';
                })(),
                label: 'Completitud promedio', hint: 'de todos los ciclos',
              },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, padding: '20px 20px 18px' }}
              >
                <p style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.04em' }}>{s.val}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#292524' }}>{s.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#A8A29E' }}>{s.hint}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden' }}
          >
            {/* Tabs */}
            <div style={{ padding: '0 24px', borderBottom: '1px solid #F5F5F4', display: 'flex', gap: 0 }}>
              {TABS.map((t) => {
                const count = t.key === 'all' ? cycles.length : cycles.filter(c => c.status === t.key).length;
                const active = tab === t.key;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)} style={{
                    padding: '14px 4px', marginRight: 20, border: 'none',
                    borderBottom: active ? '2px solid #0C0A09' : '2px solid transparent',
                    background: 'transparent', cursor: 'pointer',
                    fontSize: 13.5, fontWeight: active ? 600 : 400, color: active ? '#0C0A09' : '#78716C',
                    marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {t.label}
                    <span style={{
                      fontSize: 11, padding: '1px 6px', borderRadius: 10,
                      background: active ? '#F5F5F4' : '#FAFAF9', color: active ? '#0C0A09' : '#A8A29E', fontWeight: 500,
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Head */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 100px 200px 170px 110px 80px',
              padding: '9px 24px', background: '#FAFAF9', borderBottom: '1px solid #F5F5F4',
              fontSize: 11.5, fontWeight: 500, color: '#A8A29E', letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              <span>Ciclo</span><span>Tipo</span><span>Período</span><span>Progreso</span><span>Estado</span><span />
            </div>

            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ padding: '60px 24px', textAlign: 'center' }}
              >
                <p style={{ margin: 0, fontSize: 14, color: '#A8A29E' }}>No hay ciclos en esta categoría</p>
              </motion.div>
            ) : filtered.map((c, i) => {
              const st = STATUS[c.status] || STATUS.draft;
              const typeLabel = TYPE_LABELS[c.type] || c.type;
              const typeColor = TYPE_COLORS[c.type] || '#44403C';
              const total = c.reviewStats?.total || 0;
              const completed = c.reviewStats?.completed || 0;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 + i * 0.03 }}
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
                  <div>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#0C0A09' }}>{c.name}</p>
                    {c.description && (
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#A8A29E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{c.description}</p>
                    )}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: typeColor }}>{typeLabel}</span>
                  <span style={{ fontSize: 13, color: '#78716C' }}>{fmt(c.start_date)} – {fmt(c.end_date)}</span>
                  <div>
                    {total > 0 ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 4, background: '#F5F5F4', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#15803D' : '#0C0A09', borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#78716C', minWidth: 28 }}>{pct}%</span>
                        </div>
                        <span style={{ fontSize: 11.5, color: '#A8A29E' }}>{completed}/{total} revisiones</span>
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
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
