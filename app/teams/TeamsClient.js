'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/app/components/Sidebar';
import { createClient } from '@/lib/supabase/client';

// Warm stone palette for team initials circles
const TEAM_COLORS = [
  { bg: '#292524', text: '#D6D3D1' },
  { bg: '#1C1917', text: '#A8A29E' },
  { bg: '#44403C', text: '#E7E5E4' },
  { bg: '#57534E', text: '#F5F5F4' },
  { bg: '#78716C', text: '#FAFAF9' },
  { bg: '#3B2F2B', text: '#D6D3D1' },
];

function getTeamColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return TEAM_COLORS[Math.abs(hash) % TEAM_COLORS.length];
}

export default function TeamsClient({ user, profile, teams: initialTeams }) {
  const router = useRouter();
  const [teams, setTeams] = useState(initialTeams);
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'hr_admin';

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setSaveError('');
    const supabase = createClient();
    const { data: newTeam, error } = await supabase
      .from('teams')
      .insert({ name: newName.trim(), description: newDesc.trim() || null })
      .select()
      .single();

    if (error) {
      setSaveError('Error al crear el equipo. Intentá de nuevo.');
      setSaving(false);
      return;
    }

    setTeams(prev => [...prev, { ...newTeam, member_count: 0, profiles: null }]);
    setNewName('');
    setNewDesc('');
    setShowSlideOver(false);
    setSaving(false);
    router.push(`/teams/${newTeam.id}`);
  };

  const closeSlideOver = () => {
    setShowSlideOver(false);
    setNewName('');
    setNewDesc('');
    setSaveError('');
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#F5F5F4',
      fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased',
    }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 40px 64px' }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}
          >
            <div>
              <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>
                Equipos
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: '#78716C' }}>
                Organizá tu empresa en equipos de trabajo
              </p>
            </div>
            {isAdmin && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowSlideOver(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                  borderRadius: 8, border: 'none', background: '#0C0A09', color: '#FFFFFF',
                  fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#292524'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#0C0A09'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nuevo equipo
              </motion.button>
            )}
          </motion.div>

          {/* Teams grid or empty state */}
          {teams.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{
                background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12,
                padding: '64px 24px', textAlign: 'center',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: '#F5F5F4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 500, color: '#0C0A09' }}>
                No hay equipos creados aún
              </p>
              <p style={{ margin: 0, fontSize: 13.5, color: '#A8A29E' }}>
                {isAdmin ? 'Creá el primer equipo para empezar a organizar tu empresa.' : 'Cuando se creen equipos, aparecerán aquí.'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowSlideOver(true)}
                  style={{
                    marginTop: 20, padding: '9px 20px', borderRadius: 8, border: 'none',
                    background: '#0C0A09', color: '#FFFFFF', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#292524'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0C0A09'}
                >
                  Crear primer equipo
                </button>
              )}
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {teams.map((team, i) => {
                const color = getTeamColor(team.name);
                const lead = team.profiles;
                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 + i * 0.05 }}
                    onClick={() => router.push(`/teams/${team.id}`)}
                    style={{
                      background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12,
                      padding: '22px 24px', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#D6D3D1';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E7E5E4';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Top row: icon + member badge */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: color.bg, color: color.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', flexShrink: 0,
                      }}>
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 500, padding: '3px 9px', borderRadius: 20,
                        background: '#F5F5F4', color: '#78716C',
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {team.member_count} {team.member_count === 1 ? 'miembro' : 'miembros'}
                      </span>
                    </div>

                    {/* Name */}
                    <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.02em' }}>
                      {team.name}
                    </p>

                    {/* Description */}
                    {team.description ? (
                      <p style={{
                        margin: '0 0 14px', fontSize: 13, color: '#A8A29E', lineHeight: 1.55,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {team.description}
                      </p>
                    ) : (
                      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#D6D3D1', fontStyle: 'italic' }}>
                        Sin descripción
                      </p>
                    )}

                    {/* Divider */}
                    <div style={{ height: 1, background: '#F5F5F4', marginBottom: 14 }} />

                    {/* Footer: lead + link */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        {lead ? (
                          <>
                            <div style={{
                              width: 22, height: 22, borderRadius: '50%', background: '#1C1917',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 600, color: '#78716C', flexShrink: 0,
                            }}>
                              {lead.full_name?.slice(0, 2).toUpperCase() || '??'}
                            </div>
                            <div>
                              <span style={{ fontSize: 12.5, fontWeight: 500, color: '#292524' }}>{lead.full_name}</span>
                              {lead.job_title && (
                                <span style={{ fontSize: 12, color: '#A8A29E', marginLeft: 5 }}>· {lead.job_title}</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: 12.5, color: '#D6D3D1' }}>Sin líder asignado</span>
                        )}
                      </div>
                      <span style={{
                        fontSize: 12.5, fontWeight: 500, color: '#78716C',
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        Ver equipo
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Slide-over: New team */}
      <AnimatePresence>
        {showSlideOver && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSlideOver}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
                zIndex: 40,
              }}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
                background: '#FFFFFF', zIndex: 50, display: 'flex', flexDirection: 'column',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
              }}
            >
              {/* Panel header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px 18px', borderBottom: '1px solid #E7E5E4',
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.02em' }}>
                    Nuevo equipo
                  </h2>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#A8A29E' }}>
                    Completá los datos del equipo
                  </p>
                </div>
                <button
                  onClick={closeSlideOver}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 6,
                    color: '#A8A29E', borderRadius: 6, display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F5F4'; e.currentTarget.style.color = '#0C0A09'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#A8A29E'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreate} style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#292524', marginBottom: 6 }}>
                    Nombre del equipo <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ej. Producto, Ingeniería, Marketing..."
                    required
                    style={{
                      width: '100%', padding: '9px 12px', fontSize: 14, color: '#0C0A09',
                      background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 8,
                      outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#0C0A09'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E7E5E4'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#292524', marginBottom: 6 }}>
                    Descripción
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#A8A29E', marginLeft: 6 }}>opcional</span>
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="¿Cuál es el propósito o área de este equipo?"
                    rows={4}
                    style={{
                      width: '100%', padding: '9px 12px', fontSize: 14, color: '#0C0A09',
                      background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 8,
                      outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.55,
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#0C0A09'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E7E5E4'}
                  />
                </div>

                {saveError && (
                  <p style={{ margin: 0, fontSize: 13, color: '#DC2626', background: '#FEF2F2', padding: '10px 12px', borderRadius: 8 }}>
                    {saveError}
                  </p>
                )}
              </form>

              {/* Footer */}
              <div style={{
                padding: '16px 24px', borderTop: '1px solid #E7E5E4',
                display: 'flex', gap: 8, justifyContent: 'flex-end',
              }}>
                <button
                  type="button"
                  onClick={closeSlideOver}
                  style={{
                    padding: '9px 16px', borderRadius: 8, border: '1px solid #E7E5E4',
                    background: '#FFFFFF', color: '#292524', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F4'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !newName.trim()}
                  style={{
                    padding: '9px 18px', borderRadius: 8, border: 'none',
                    background: saving || !newName.trim() ? '#D6D3D1' : '#0C0A09',
                    color: '#FFFFFF', fontSize: 13.5, fontWeight: 500,
                    cursor: saving || !newName.trim() ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!saving && newName.trim()) e.currentTarget.style.background = '#292524'; }}
                  onMouseLeave={(e) => { if (!saving && newName.trim()) e.currentTarget.style.background = '#0C0A09'; }}
                >
                  {saving ? 'Creando...' : 'Crear equipo'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
