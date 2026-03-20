'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

const PENDING_ACTIONS = [
  {
    id: 'self-1',
    type: 'self',
    cycle: 'Q1 Performance Review 2026',
    cycleId: 1,
    dueDate: '31 mar 2026',
    daysLeft: 11,
    description: 'Reflexioná sobre tus logros, competencias y objetivos del trimestre.',
    progress: 2,
    totalSections: 5,
  },
  {
    id: 'peer-2',
    type: 'peer',
    cycle: 'Q1 Performance Review 2026',
    cycleId: 1,
    subject: { name: 'Diego Fernández', role: 'Frontend Developer', avatar: 'DF' },
    dueDate: '31 mar 2026',
    daysLeft: 11,
    description: 'Compartí tu perspectiva sobre el trabajo y la colaboración con Diego.',
    progress: 0,
    totalSections: 4,
  },
  {
    id: 'manager-3',
    type: 'manager',
    cycle: 'Q1 Performance Review 2026',
    cycleId: 1,
    subject: { name: 'Valentina Gómez', role: 'QA Engineer', avatar: 'VG' },
    dueDate: '31 mar 2026',
    daysLeft: 11,
    description: 'Evaluá el desempeño de Valentina en este ciclo trimestral.',
    progress: 0,
    totalSections: 5,
  },
  {
    id: 'manager-4',
    type: 'manager',
    cycle: 'Q1 Performance Review 2026',
    cycleId: 1,
    subject: { name: 'Juan Pérez', role: 'Data Analyst', avatar: 'JP' },
    dueDate: '31 mar 2026',
    daysLeft: 11,
    description: 'Evaluá el desempeño de Juan en este ciclo trimestral.',
    progress: 0,
    totalSections: 5,
  },
];

const COMPLETED_ACTIONS = [
  {
    id: 'self-old',
    type: 'self',
    cycle: 'Evaluación Anual 2025',
    cycleId: 3,
    completedAt: '18 dic 2025',
  },
  {
    id: 'peer-old',
    type: 'peer',
    cycle: 'Evaluación Anual 2025',
    cycleId: 3,
    subject: { name: 'Carlos López', role: 'Product Manager', avatar: 'CL' },
    completedAt: '20 dic 2025',
  },
];

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

function ActionCard({ action, onClick }) {
  const tc = TYPE_CONFIG[action.type];
  const pct = action.totalSections > 0 ? Math.round((action.progress / action.totalSections) * 100) : 0;
  const hasProgress = action.progress > 0;
  const isUrgent = action.daysLeft <= 7;

  return (
    <div
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
          <span style={{ fontSize: 12, color: '#A8A29E' }}>{action.cycle}</span>
        </div>
        <span style={{
          fontSize: 11.5, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
          background: isUrgent ? '#FFF7ED' : '#F5F5F4',
          color: isUrgent ? '#C2410C' : '#78716C',
        }}>
          {action.daysLeft}d restantes
        </span>
      </div>

      {/* Subject (for peer/manager reviews) */}
      {action.subject && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: '#1C1917',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: '#78716C', flexShrink: 0,
          }}>
            {action.subject.avatar}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.01em' }}>
              {action.subject.name}
            </p>
            <p style={{ margin: '1px 0 0', fontSize: 12.5, color: '#A8A29E' }}>{action.subject.role}</p>
          </div>
        </div>
      )}

      {!action.subject && (
        <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.02em' }}>
          Tu autoevaluación
        </p>
      )}

      <p style={{ margin: '0 0 16px', fontSize: 13.5, color: '#78716C', lineHeight: 1.55 }}>
        {action.description}
      </p>

      {/* Progress + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          {hasProgress ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11.5, color: '#A8A29E' }}>Sección {action.progress} de {action.totalSections}</span>
                <span style={{ fontSize: 11.5, color: '#A8A29E' }}>{pct}%</span>
              </div>
              <div style={{ height: 3, background: '#F5F5F4', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: '#0C0A09', borderRadius: 3 }} />
              </div>
            </>
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
    </div>
  );
}

export default function MyReviewsClient({ user, profile }) {
  const router = useRouter();
  const userName = user?.email?.split('@')[0] || 'Usuario';

  const handleActionClick = (action) => {
    if (action.type === 'self') {
      router.push(`/review-cycles/${action.cycleId}/self-assessment`);
    } else {
      router.push(`/review-cycles/${action.cycleId}/review/${action.subject?.id || 1}`);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F4' }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 40px 80px' }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>
              Mis revisiones
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#78716C' }}>
              Tenés {PENDING_ACTIONS.length} acción{PENDING_ACTIONS.length !== 1 ? 'es' : ''} pendiente{PENDING_ACTIONS.length !== 1 ? 's' : ''} en el ciclo actual.
            </p>
          </div>

          {/* Pending */}
          {PENDING_ACTIONS.length > 0 && (
            <section style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Pendientes
                </h2>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 10,
                  background: '#0C0A09', color: '#FFFFFF',
                }}>
                  {PENDING_ACTIONS.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PENDING_ACTIONS.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onClick={() => handleActionClick(action)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Completed */}
          {COMPLETED_ACTIONS.length > 0 && (
            <section>
              <h2 style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Completadas
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden' }}>
                {COMPLETED_ACTIONS.map((action, i) => {
                  const tc = TYPE_CONFIG[action.type];
                  return (
                    <div
                      key={action.id}
                      onClick={() => router.push(`/review-cycles/${action.cycleId}`)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 20px', cursor: 'pointer', transition: 'background 0.1s',
                        borderBottom: i < COMPLETED_ACTIONS.length - 1 ? '1px solid #FAFAF9' : 'none',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#D6D3D1' }}>{tc.icon}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#292524' }}>
                            {action.type === 'self' ? 'Autoevaluación' : action.subject?.name}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#A8A29E' }}>{action.cycle}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#A8A29E' }}>{action.completedAt}</span>
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
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
