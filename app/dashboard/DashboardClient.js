'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

const stats = [
  { label: 'Evaluaciones activas', value: '3', sub: 'ciclos en curso' },
  { label: 'Completadas', value: '87%', sub: 'tasa de finalización' },
  { label: 'Participantes', value: '142', sub: 'en este ciclo' },
  { label: 'Pendientes de revisión', value: '5', sub: 'requieren atención' },
];

const recentActivity = [
  { name: 'Ana García', role: 'Senior Developer', status: 'Completada', score: 4.8, avatar: 'AG', color: '#292524' },
  { name: 'Carlos López', role: 'Product Manager', status: 'En progreso', score: null, avatar: 'CL', color: '#1C1917' },
  { name: 'María Rodríguez', role: 'UX Designer', status: 'Completada', score: 4.5, avatar: 'MR', color: '#292524' },
  { name: 'Juan Pérez', role: 'Data Analyst', status: 'Pendiente', score: null, avatar: 'JP', color: '#1C1917' },
  { name: 'Laura Martínez', role: 'Backend Developer', status: 'Completada', score: 4.2, avatar: 'LM', color: '#292524' },
];

const STATUS = {
  'Completada': { color: '#15803D', bg: '#F0FDF4' },
  'En progreso': { color: '#92400E', bg: '#FFFBEB' },
  'Pendiente': { color: '#78716C', bg: '#F5F5F4' },
};

export default function DashboardClient({ user, profile }) {
  const router = useRouter();
  const userName = user?.email?.split('@')[0] || 'Usuario';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F4' }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 40px' }}>

          {/* Greeting */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>
              {greeting}, {userName}.
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#78716C' }}>
              Ciclo Q1 2026 · 23 días restantes para cerrar
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 40 }}>
            {stats.map((s) => (
              <div key={s.label} style={{
                background: '#FFFFFF',
                border: '1px solid #E7E5E4',
                borderRadius: 12,
                padding: '20px 20px 18px',
              }}>
                <p style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 500, color: '#292524' }}>{s.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#A8A29E' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Recent */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px 16px', borderBottom: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0C0A09' }}>Actividad reciente</h2>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#A8A29E' }}>Evaluaciones del ciclo actual</p>
              </div>
              <button
                onClick={() => router.push('/review-cycles')}
                style={{ fontSize: 13, color: '#0C0A09', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                Ver ciclos →
              </button>
            </div>

            {/* Table head */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 160px 130px 70px',
              padding: '9px 24px', background: '#FAFAF9',
              borderBottom: '1px solid #F5F5F4',
              fontSize: 11.5, fontWeight: 500, color: '#A8A29E', letterSpacing: '0.03em', textTransform: 'uppercase',
            }}>
              <span>Persona</span><span>Cargo</span><span>Estado</span><span style={{ textAlign: 'right' }}>Score</span>
            </div>

            {recentActivity.map((p, i) => {
              const s = STATUS[p.status];
              return (
                <div
                  key={p.name}
                  onClick={() => router.push('/review-cycles/1')}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 160px 130px 70px',
                    padding: '13px 24px', alignItems: 'center',
                    borderBottom: i < recentActivity.length - 1 ? '1px solid #FAFAF9' : 'none',
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: p.color, color: '#A8A29E',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600, flexShrink: 0,
                    }}>{p.avatar}</div>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: '#1C1917' }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#78716C' }}>{p.role}</span>
                  <span>
                    <span style={{
                      fontSize: 12, fontWeight: 500, padding: '3px 10px',
                      borderRadius: 20, background: s.bg, color: s.color,
                    }}>{p.status}</span>
                  </span>
                  <span style={{ textAlign: 'right', fontSize: 13.5, fontWeight: 600, color: p.score ? '#0C0A09' : '#D6D3D1' }}>
                    {p.score || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
