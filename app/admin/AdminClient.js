'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/app/components/Sidebar';

const ROLES = ['employee', 'manager', 'hr_admin', 'super_admin'];
const ROLE_LABELS = { super_admin: 'Super Admin', hr_admin: 'HR Admin', manager: 'Manager', employee: 'Empleado' };
const ROLE_COLORS = {
  super_admin: { bg: '#F5F3FF', color: '#6D28D9' },
  hr_admin: { bg: '#EFF6FF', color: '#1D4ED8' },
  manager: { bg: '#F0FDF4', color: '#15803D' },
  employee: { bg: '#F5F5F4', color: '#78716C' },
};

export default function AdminClient({ currentUser, users: initialUsers, profile }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_update_user_role', {
      target_user_id: userId,
      new_role: newRole,
    });
    if (error) {
      showToast('Error al actualizar rol', 'error');
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast('Rol actualizado correctamente');
    }
    setUpdating(null);
  };

  const initials = (name, email) => {
    if (name) return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return email?.slice(0, 2).toUpperCase() || '??';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F4', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Sidebar user={currentUser} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -16, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -16, x: '-50%' }}
              style={{
                position: 'fixed', top: 20, left: '50%', zIndex: 100,
                padding: '10px 20px', borderRadius: 10,
                background: toast.type === 'error' ? '#FEF2F2' : '#F0FDF4',
                border: `1px solid ${toast.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
                color: toast.type === 'error' ? '#DC2626' : '#15803D',
                fontSize: 13.5, fontWeight: 500, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '48px 40px' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: 36 }}
          >
            <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>
              Administración
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#78716C' }}>
              Condor Agency Performance Review · {users.length} usuarios
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E7E5E4', marginBottom: 28 }}
          >
            {[
              { key: 'users', label: 'Usuarios' },
              { key: 'employees', label: 'Empleados' },
              { key: 'templates', label: 'Plantillas de evaluación' },
            ].map((t) => {
              const active = activeTab === t.key;
              return (
                <button key={t.key} onClick={() => {
                  if (t.key === 'templates') router.push('/admin/templates');
                  else if (t.key === 'employees') router.push('/admin/employees');
                  else setActiveTab(t.key);
                }} style={{
                  padding: '10px 4px', marginRight: 20, border: 'none',
                  borderBottom: active ? '2px solid #0C0A09' : '2px solid transparent',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: 13.5, fontWeight: active ? 600 : 400,
                  color: active ? '#0C0A09' : '#78716C',
                  marginBottom: -1,
                }}>
                  {t.label}
                </button>
              );
            })}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}
          >
            {Object.entries(ROLE_LABELS).map(([role, label], i) => {
              const count = users.filter(u => u.role === role).length;
              const rc = ROLE_COLORS[role];
              return (
                <motion.div key={role}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.05 }}
                  style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, padding: '18px 20px' }}
                >
                  <p style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>{count}</p>
                  <span style={{ fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: rc.bg, color: rc.color }}>
                    {label}s
                  </span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden' }}
          >
            {/* Search */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text" placeholder="Buscar por nombre, email o departamento..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13.5, color: '#0C0A09', background: 'transparent' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', fontSize: 13 }}>✕</button>
              )}
            </div>

            {/* Head */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.5fr',
              padding: '9px 20px', background: '#FAFAF9', borderBottom: '1px solid #F5F5F4',
              fontSize: 11.5, fontWeight: 500, color: '#A8A29E', letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              <span>Usuario</span><span>Email</span><span>Departamento</span><span>Registro</span><span>Rol</span>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#A8A29E', fontSize: 14 }}>
                No se encontraron usuarios
              </div>
            ) : filtered.map((u, i) => {
              const rc = ROLE_COLORS[u.role] || ROLE_COLORS.employee;
              return (
                <motion.div key={u.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.03 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.5fr',
                    padding: '13px 20px', alignItems: 'center',
                    borderBottom: i < filtered.length - 1 ? '1px solid #FAFAF9' : 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: '#1C1917',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600, color: '#78716C', flexShrink: 0,
                    }}>{initials(u.full_name, u.email)}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#0C0A09' }}>{u.full_name || '—'}</p>
                      <p style={{ margin: '1px 0 0', fontSize: 12, color: '#A8A29E' }}>{u.job_title || '—'}</p>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#78716C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 16 }}>{u.email}</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#78716C' }}>{u.department || '—'}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#A8A29E' }}>
                    {new Date(u.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </p>
                  <div>
                    {updating === u.id ? (
                      <span style={{ fontSize: 12.5, color: '#A8A29E' }}>Guardando...</span>
                    ) : u.id === currentUser.id ? (
                      <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: rc.bg, color: rc.color }}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        style={{
                          border: '1px solid #E7E5E4', borderRadius: 8, padding: '5px 10px',
                          fontSize: 12.5, color: '#0C0A09', background: '#FFFFFF', cursor: 'pointer', outline: 'none',
                        }}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    )}
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
