'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/app/components/Sidebar';

const TYPE_CONFIG = {
  self: {
    label: 'Autoevaluación',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  peer: {
    label: 'Feedback de par',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  manager: {
    label: 'Revisión de manager',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
};

function daysLeft(endDate) {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate) - Date.now()) / 1000 / 60 / 60 / 24);
  return diff;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function ActionCard({ review, onClick }) {
  const tc = TYPE_CONFIG[review.type] || TYPE_CONFIG.manager;
  const cycle = review.review_cycles;
  const subject = review.type !== 'self' ? review.profiles : null;
  const dl = daysLeft(cycle?.end_date);
  const isUrgent = dl !== null && dl <= 7;
  const hasProgress = review.status === 'in_progress';

  const descriptions = {
    self: 'Reflexioná sobre tus logros, competencias y objetivos del ciclo.',
    peer: `Compartí tu perspectiva sobre el trabajo y la colaboración con ${subject?.full_name || 'este colaborador'}.`,
    manager: `Evaluá el desempeño de ${subject?.full_name || 'este colaborador'} en este ciclo.`,
  };

  return (
    <motion.div
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      style={{
        background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 14,
        padding: '22px 24px', cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#0C0A09';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E7E5E4';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#78716C' }}>{tc.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#78716C' }}>{tc.label}</span>
          <span style={{ color: '#D6D3D1', fontSize: 12 }}>·</span>
          <span style={{ fontSize: 12, color: '#A8A29E' }}>{cycle?.name || '—'}</span>
        </div>
        {dl !== null && (
          <span style={{
            fontSize: 11.5, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
            background: isUrgent ? '#FFF7ED' : '#F5F5F4',
            color: isUrgent ? '#C2410C' : '#78716C',
          }}>
            {dl > 0 ? `${dl}d restantes` : dl === 0 ? 'Vence hoy' : 'Vencida'}
          </span>
        )}
      </div>

      {/* Subject (for peer/manager reviews) */}
      {subject ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: '#1C1917',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: '#78716C', flexShrink: 0,
          }}>
            {initials(subject.full_name)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.01em' }}>
              {subject.full_name || '—'}
            </p>
            <p style={{ margin: '1px 0 0', fontSize: 12.5, color: '#A8A29E' }}>{subject.job_title || '—'}</p>
          </div>
        </div>
      ) : (
        <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.02em' }}>
          Tu autoevaluación
        </p>
      )}

      <p style={{ margin: '0 0 16px', fontSize: 13.5, color: '#78716C', lineHeight: 1.55 }}>
        {descriptions[review.type] || ''}
      </p>

      {/* Progress + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          {hasProgress ? (
            <span style={{ fontSize: 12.5, color: '#A8A29E' }}>En progreso</span>
          ) : (
            <span style={{ fontSize: 12.5, color: '#D6D3D1' }}>Sin empezar</span>
          )}
        </div>
        <button
          style={{
            padding: '8px 18px', borderRadius: 8, border: 'none',
            background: '#0C0A09', color: '#FFFFFF',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#292524'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#0C0A09'}
        >
          {hasProgress ? 'Continuar' : 'Comenzar'}
        </button>
      </div>
    </motion.div>
  );
}

export default function MyReviewsClient({ user, profile, pendingReviews = [], completedReviews = [] }) {
  const router = useRouter();

  const handleReviewClick = (review) => {
    const cycleId = review.cycle_id;
    if (review.type === 'self') {
      router.push(`/review-cycles/${cycleId}/self-assessment`);
    } else {
      router.push(`/review-cycles/${cycleId}/review/${review.reviewee_id}`);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F4', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 40px 80px' }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            style={{ marginBottom: 40 }}
          >
            <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>
              Mis revisiones
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#78716C' }}>
              {pendingReviews.length > 0
                ? `Tenés ${pendingReviews.length} acción${pendingReviews.length !== 1 ? 'es' : ''} pendiente${pendingReviews.length !== 1 ? 's' : ''}.`
                : 'No tenés revisiones pendientes por ahora.'}
            </p>
          </motion.div>

          {/* Pending */}
          <AnimatePresence>
            {pendingReviews.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ marginBottom: 48 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Pendientes
                  </h2>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 10,
                    background: '#0C0A09', color: '#FFFFFF',
                  }}>
                    {pendingReviews.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pendingReviews.map((review, i) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.05 }}
                    >
                      <ActionCard review={review} onClick={() => handleReviewClick(review)} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Empty pending state */}
          {pendingReviews.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{
                background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 14,
                padding: '48px 24px', textAlign: 'center', marginBottom: 48,
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#0C0A09' }}>Todo al día</p>
              <p style={{ margin: 0, fontSize: 13.5, color: '#A8A29E' }}>No tenés revisiones pendientes en este momento.</p>
            </motion.div>
          )}

          {/* Completed */}
          {completedReviews.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            >
              <h2 style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Completadas
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden' }}>
                {completedReviews.map((review, i) => {
                  const tc = TYPE_CONFIG[review.type] || TYPE_CONFIG.manager;
                  const cycle = review.review_cycles;
                  const subject = review.type !== 'self' ? review.profiles : null;
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.03 }}
                      onClick={() => router.push(`/review-cycles/${review.cycle_id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 20px', cursor: 'pointer', transition: 'background 0.1s',
                        borderBottom: i < completedReviews.length - 1 ? '1px solid #FAFAF9' : 'none',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#D6D3D1' }}>{tc.icon}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#292524' }}>
                            {review.type === 'self' ? 'Autoevaluación' : subject?.full_name || '—'}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#A8A29E' }}>{cycle?.name || '—'}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#A8A29E' }}>{fmtDate(review.submitted_at)}</span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 12, fontWeight: 500, padding: '3px 9px', borderRadius: 20,
                          background: '#F0FDF4', color: '#15803D',
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Enviada
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}

        </div>
      </div>
    </div>
  );
}
