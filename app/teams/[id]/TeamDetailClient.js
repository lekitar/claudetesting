'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/app/components/Sidebar';
import { createClient } from '@/lib/supabase/client';

// Role display helpers
const ROLE_LABELS = {
  super_admin: 'Super Admin',
  hr_admin: 'RRHH Admin',
  manager: 'Manager',
  employee: 'Empleado',
};

const ROLE_COLORS = {
  super_admin: { bg: '#1C1917', text: '#D6D3D1' },
  hr_admin: { bg: '#292524', text: '#D6D3D1' },
  manager: { bg: '#F5F5F4', text: '#57534E' },
  employee: { bg: '#F5F5F4', text: '#78716C' },
};

function RoleBadge({ role }) {
  const colors = ROLE_COLORS[role] || { bg: '#F5F5F4', text: '#78716C' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
      background: colors.bg, color: colors.text,
    }}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

function Avatar({ name, size = 36 }) {
  const initials = (name || '?').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#292524', border: '1px solid #E7E5E4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 600, color: '#A8A29E', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function TeamDetailClient({ user, profile, team: initialTeam, members: initialMembers, allProfiles }) {
  const router = useRouter();
  const supabase = createClient();

  const [team, setTeam] = useState(initialTeam);
  const [members, setMembers] = useState(initialMembers);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(initialTeam.name);
  const [editDesc, setEditDesc] = useState(initialTeam.description || '');
  const [editLeadId, setEditLeadId] = useState(initialTeam.team_lead_id || '');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Add member overlay
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [addingId, setAddingId] = useState(null);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'hr_admin';

  const existingUserIds = new Set(members.map(m => m.user_id));

  const availableProfiles = allProfiles.filter(
    p => !existingUserIds.has(p.id)
  );

  const filteredProfiles = memberSearch.trim()
    ? availableProfiles.filter(p =>
        p.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        p.job_title?.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : availableProfiles;

  const teamLead = members.find(m => m.role === 'lead');
  const leadProfile = teamLead?.profiles || allProfiles.find(p => p.id === team.team_lead_id);

  // --- Edit handlers ---
  const handleEditSave = async () => {
    if (!editName.trim()) return;
    setSavingEdit(true);
    setEditError('');

    const { data: updated, error } = await supabase
      .from('teams')
      .update({
        name: editName.trim(),
        description: editDesc.trim() || null,
        team_lead_id: editLeadId || null,
      })
      .eq('id', team.id)
      .select()
      .single();

    if (error) {
      setEditError('Error al guardar. Intentá de nuevo.');
      setSavingEdit(false);
      return;
    }

    setTeam(updated);
    setEditing(false);
    setSavingEdit(false);
  };

  const handleEditCancel = () => {
    setEditName(team.name);
    setEditDesc(team.description || '');
    setEditLeadId(team.team_lead_id || '');
    setEditing(false);
    setEditError('');
  };

  // --- Remove member ---
  const handleRemoveMember = async (memberId) => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (!error) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  // --- Add member ---
  const handleAddMember = async (profileId) => {
    setAddingId(profileId);
    const { data: newMember, error } = await supabase
      .from('team_members')
      .insert({ team_id: team.id, user_id: profileId, role: 'member' })
      .select('id, role, user_id, profiles(id, full_name, job_title, role)')
      .single();

    if (!error && newMember) {
      setMembers(prev => [...prev, newMember]);
    }
    setAddingId(null);
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#F5F5F4',
      fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased',
    }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 40px 72px' }}>

          {/* Back nav */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={() => router.push('/teams')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#78716C', fontSize: 13.5, fontWeight: 500, padding: '0 0 20px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0C0A09'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#78716C'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Equipos
            </button>
          </motion.div>

          {/* Header card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.04 }}
            style={{
              background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12,
              padding: '28px 32px', marginBottom: 20,
            }}
          >
            {editing ? (
              /* Edit form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#292524', marginBottom: 6 }}>
                    Nombre del equipo <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%', padding: '9px 12px', fontSize: 15, fontWeight: 600,
                      color: '#0C0A09', background: '#FFFFFF', border: '1px solid #0C0A09',
                      borderRadius: 8, outline: 'none', boxSizing: 'border-box', letterSpacing: '-0.02em',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#292524', marginBottom: 6 }}>
                    Descripción
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#A8A29E', marginLeft: 6 }}>opcional</span>
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%', padding: '9px 12px', fontSize: 14, color: '#0C0A09',
                      background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 8,
                      outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.55,
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#0C0A09'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E7E5E4'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#292524', marginBottom: 6 }}>
                    Líder del equipo
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#A8A29E', marginLeft: 6 }}>opcional</span>
                  </label>
                  <select
                    value={editLeadId}
                    onChange={(e) => setEditLeadId(e.target.value)}
                    style={{
                      width: '100%', padding: '9px 12px', fontSize: 14, color: '#0C0A09',
                      background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 8,
                      outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#0C0A09'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E7E5E4'}
                  >
                    <option value="">Sin líder</option>
                    {allProfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}{p.job_title ? ` — ${p.job_title}` : ''}</option>
                    ))}
                  </select>
                </div>

                {editError && (
                  <p style={{ margin: 0, fontSize: 13, color: '#DC2626', background: '#FEF2F2', padding: '10px 12px', borderRadius: 8 }}>
                    {editError}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleEditSave}
                    disabled={savingEdit || !editName.trim()}
                    style={{
                      padding: '8px 18px', borderRadius: 8, border: 'none',
                      background: savingEdit || !editName.trim() ? '#D6D3D1' : '#0C0A09',
                      color: '#FFFFFF', fontSize: 13.5, fontWeight: 500,
                      cursor: savingEdit || !editName.trim() ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => { if (!savingEdit && editName.trim()) e.currentTarget.style.background = '#292524'; }}
                    onMouseLeave={(e) => { if (!savingEdit && editName.trim()) e.currentTarget.style.background = '#0C0A09'; }}
                  >
                    {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button
                    onClick={handleEditCancel}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: '1px solid #E7E5E4',
                      background: '#FFFFFF', color: '#292524', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F4'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{
                      margin: '0 0 8px', fontSize: 24, fontWeight: 700, color: '#0C0A09',
                      letterSpacing: '-0.03em', lineHeight: 1.2,
                    }}>
                      {team.name}
                    </h1>
                    {team.description ? (
                      <p style={{ margin: '0 0 16px', fontSize: 14, color: '#78716C', lineHeight: 1.6 }}>
                        {team.description}
                      </p>
                    ) : (
                      <p style={{ margin: '0 0 16px', fontSize: 14, color: '#D6D3D1', fontStyle: 'italic' }}>
                        Sin descripción
                      </p>
                    )}

                    {/* Lead chip */}
                    {leadProfile ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 10px 5px 5px', background: '#F5F5F4', borderRadius: 20 }}>
                        <Avatar name={leadProfile.full_name} size={22} />
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: '#292524' }}>
                          {leadProfile.full_name}
                        </span>
                        <span style={{
                          fontSize: 11, padding: '1px 7px', borderRadius: 20,
                          background: '#E7E5E4', color: '#78716C', fontWeight: 500,
                        }}>
                          Líder
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: '#A8A29E' }}>Sin líder asignado</span>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setEditing(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 8, border: '1px solid #E7E5E4',
                        background: '#FFFFFF', color: '#292524', fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', flexShrink: 0,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Editar
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Members section */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden',
            }}
          >
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: members.length > 0 ? '1px solid #E7E5E4' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.02em' }}>
                  Miembros
                </h2>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '2px 8px', borderRadius: 20,
                  background: '#F5F5F4', color: '#78716C',
                  fontSize: 12, fontWeight: 600,
                }}>
                  {members.length}
                </span>
              </div>
              {isAdmin && (
                <button
                  onClick={() => { setShowAddMember(true); setMemberSearch(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 8, border: 'none',
                    background: '#0C0A09', color: '#FFFFFF',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#292524'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0C0A09'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Agregar miembro
                </button>
              )}
            </div>

            {/* Members list */}
            {members.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#F5F5F4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#0C0A09' }}>
                  Sin miembros todavía
                </p>
                <p style={{ margin: 0, fontSize: 13, color: '#A8A29E' }}>
                  {isAdmin ? 'Agregá personas a este equipo.' : 'Este equipo no tiene miembros aún.'}
                </p>
              </div>
            ) : (
              <div>
                {members.map((member, i) => {
                  const mp = member.profiles;
                  if (!mp) return null;
                  const isLead = member.role === 'lead';
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.12 + i * 0.05 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 24px',
                        borderBottom: i < members.length - 1 ? '1px solid #F5F5F4' : 'none',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Avatar name={mp.full_name} size={36} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.01em' }}>
                            {mp.full_name}
                          </span>
                          {isLead && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center',
                              padding: '2px 8px', borderRadius: 20,
                              background: '#0C0A09', color: '#FFFFFF',
                              fontSize: 11, fontWeight: 600,
                            }}>
                              Líder
                            </span>
                          )}
                          <RoleBadge role={mp.role} />
                        </div>
                        {mp.job_title && (
                          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#A8A29E' }}>
                            {mp.job_title}
                          </p>
                        )}
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          title="Eliminar miembro"
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: 'none', border: '1px solid transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#A8A29E', flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FEF2F2';
                            e.currentTarget.style.borderColor = '#FECACA';
                            e.currentTarget.style.color = '#DC2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.color = '#A8A29E';
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add member overlay */}
      <AnimatePresence>
        {showAddMember && (
          <>
            <motion.div
              key="member-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setShowAddMember(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 40,
              }}
            />

            <motion.div
              key="member-panel"
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
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
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.02em' }}>
                    Agregar miembro
                  </h2>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#A8A29E' }}>
                    Seleccioná una persona para agregar al equipo
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMember(false)}
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

              {/* Search */}
              <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid #F5F5F4' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                    color: '#A8A29E', display: 'flex', alignItems: 'center', pointerEvents: 'none',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Buscar por nombre o cargo..."
                    autoFocus
                    style={{
                      width: '100%', padding: '8px 12px 8px 32px', fontSize: 13.5,
                      color: '#0C0A09', background: '#F5F5F4', border: '1px solid transparent',
                      borderRadius: 8, outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#0C0A09'; }}
                    onBlur={(e) => { e.currentTarget.style.background = '#F5F5F4'; e.currentTarget.style.borderColor = 'transparent'; }}
                  />
                </div>
              </div>

              {/* Profiles list */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredProfiles.length === 0 ? (
                  <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#A8A29E' }}>
                      {memberSearch ? 'No se encontraron resultados.' : 'Todos los perfiles ya están en el equipo.'}
                    </p>
                  </div>
                ) : (
                  filteredProfiles.map((p) => {
                    const isAdding = addingId === p.id;
                    const alreadyAdded = existingUserIds.has(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => !alreadyAdded && !isAdding && handleAddMember(p.id)}
                        disabled={alreadyAdded || isAdding}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 24px', background: 'none', border: 'none',
                          cursor: alreadyAdded || isAdding ? 'not-allowed' : 'pointer',
                          textAlign: 'left', borderBottom: '1px solid #F5F5F4',
                          opacity: alreadyAdded ? 0.5 : 1,
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={(e) => { if (!alreadyAdded && !isAdding) e.currentTarget.style.background = '#F5F5F4'; }}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <Avatar name={p.full_name} size={34} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 2px', fontSize: 13.5, fontWeight: 600, color: '#0C0A09' }}>
                            {p.full_name}
                          </p>
                          <p style={{ margin: 0, fontSize: 12.5, color: '#A8A29E' }}>
                            {p.job_title || ROLE_LABELS[p.role] || p.role}
                          </p>
                        </div>
                        {isAdding ? (
                          <span style={{ fontSize: 12, color: '#A8A29E' }}>Agregando...</span>
                        ) : alreadyAdded ? (
                          <span style={{ fontSize: 12, color: '#A8A29E' }}>Ya en equipo</span>
                        ) : (
                          <span style={{
                            fontSize: 12, fontWeight: 500, color: '#78716C',
                            display: 'flex', alignItems: 'center', gap: 3,
                          }}>
                            Agregar
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
