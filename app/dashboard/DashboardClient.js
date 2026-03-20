'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

const stats = [
  {
    label: 'Evaluaciones activas',
    value: '12',
    change: '+3 este ciclo',
    trend: 'up',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    label: 'Completadas este ciclo',
    value: '87%',
    change: '+12% vs ciclo anterior',
    trend: 'up',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  {
    label: 'Empleados evaluados',
    value: '142',
    change: '+8 este mes',
    trend: 'up',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Pendientes de revisión',
    value: '5',
    change: '-2 desde ayer',
    trend: 'down',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
];

const recentActivity = [
  { name: 'Ana García', role: 'Senior Developer', status: 'Completada', score: 4.8, avatar: 'AG' },
  { name: 'Carlos López', role: 'Product Manager', status: 'En progreso', score: null, avatar: 'CL' },
  { name: 'María Rodríguez', role: 'UX Designer', status: 'Completada', score: 4.5, avatar: 'MR' },
  { name: 'Juan Pérez', role: 'Data Analyst', status: 'Pendiente', score: null, avatar: 'JP' },
  { name: 'Laura Martínez', role: 'Backend Developer', status: 'Completada', score: 4.2, avatar: 'LM' },
];

const statusStyles = {
  'Completada': { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
  'En progreso': { bg: '#EEF2FF', color: '#4F46E5', border: '#C7D2FE' },
  'Pendiente': { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' },
};

const avatarColors = ['#4F46E5', '#7C3AED', '#2563EB', '#059669', '#D97706'];

export default function DashboardClient({ user, profile }) {
  const router = useRouter();

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
            <h1 className="text-lg font-semibold" style={{ color: '#101828' }}>Dashboard</h1>
            <p className="text-sm" style={{ color: '#667085' }}>Ciclo Q1 2026 — 23 días restantes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/review-cycles')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: '#4F46E5', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4338CA'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#4F46E5'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nueva evaluación
            </button>
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: '#F9FAFB', border: '1px solid #E4E7EC', color: '#667085' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6">

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="rounded-xl p-5"
                style={{ background: '#FFFFFF', border: '1px solid #E4E7EC' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: '#EEF2FF', color: '#4F46E5' }}
                  >
                    {stat.icon}
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={
                      stat.trend === 'up'
                        ? { background: '#ECFDF5', color: '#059669' }
                        : { background: '#FFFBEB', color: '#D97706' }
                    }
                  >
                    {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#101828' }}>{stat.value}</p>
                <p className="text-sm" style={{ color: '#667085' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent evaluations */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E4E7EC' }}>
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid #E4E7EC' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: '#101828' }}>Evaluaciones recientes</h2>
              <button
                className="text-sm font-medium transition-colors"
                style={{ color: '#4F46E5' }}
                onClick={() => router.push('/review-cycles')}
              >
                Ver todas →
              </button>
            </div>

            {/* Table header */}
            <div
              className="grid px-6 py-2.5 text-xs font-medium"
              style={{
                gridTemplateColumns: '1fr 160px 120px 80px',
                background: '#F9FAFB',
                borderBottom: '1px solid #E4E7EC',
                color: '#667085',
              }}
            >
              <span>Empleado</span>
              <span>Cargo</span>
              <span>Estado</span>
              <span className="text-right">Score</span>
            </div>

            <div>
              {recentActivity.map((person, i) => {
                const s = statusStyles[person.status];
                return (
                  <div
                    key={person.name}
                    className="grid px-6 py-3.5 items-center cursor-pointer transition-colors"
                    style={{
                      gridTemplateColumns: '1fr 160px 120px 80px',
                      borderBottom: i < recentActivity.length - 1 ? '1px solid #F2F4F7' : 'none',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                        style={{ background: avatarColors[i % avatarColors.length] }}
                      >
                        {person.avatar}
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#344054' }}>{person.name}</span>
                    </div>
                    <span className="text-sm" style={{ color: '#667085' }}>{person.role}</span>
                    <span>
                      <span
                        className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                      >
                        {person.status}
                      </span>
                    </span>
                    <div className="text-right">
                      {person.score ? (
                        <span className="text-sm font-semibold" style={{ color: '#344054' }}>{person.score}</span>
                      ) : (
                        <span className="text-sm" style={{ color: '#D0D5DD' }}>—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
