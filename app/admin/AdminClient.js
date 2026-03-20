'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const ROLES = ['employee', 'manager', 'hr_admin', 'super_admin'];

const ROLE_COLORS = {
  super_admin: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  hr_admin: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  manager: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  employee: 'bg-white/5 text-white/40 border-white/10',
};

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  hr_admin: 'HR Admin',
  manager: 'Manager',
  employee: 'Empleado',
};

export default function AdminClient({ currentUser, users: initialUsers }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);

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
    <div className="min-h-screen bg-[#0f0f1a] text-white" style={{ fontFamily: 'sans-serif' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg border ${
              toast.type === 'error'
                ? 'bg-red-500/20 border-red-500/30 text-red-300'
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-white/[0.06] px-8 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white/40 hover:text-white/70 transition-colors text-sm flex items-center gap-2"
          >
            ← Dashboard
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div>
            <h1 className="text-lg font-bold text-white">Panel de Administración</h1>
            <p className="text-white/40 text-xs">{users.length} usuarios registrados</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/25">
            Super Admin
          </span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
            {initials(null, currentUser.email)}
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(ROLE_LABELS).map(([role, label], i) => {
            const count = users.filter(u => u.role === role).length;
            return (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5"
              >
                <p className="text-3xl font-bold text-white mb-1">{count}</p>
                <p className="text-white/40 text-xs">{label}s</p>
              </motion.div>
            );
          })}
        </div>

        {/* Search + Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden"
        >
          {/* Search bar */}
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 flex-shrink-0">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, email o departamento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-white/30 hover:text-white/60 transition-colors text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr] px-6 py-3 text-xs text-white/30 font-medium uppercase tracking-wider border-b border-white/[0.04]">
            <span>Usuario</span>
            <span>Email</span>
            <span>Departamento</span>
            <span>Registro</span>
            <span>Rol</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-white/30 text-sm">
                No se encontraron usuarios
              </div>
            ) : filtered.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr] px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                {/* Name */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-600/40 border border-white/10 flex items-center justify-center text-xs font-bold text-white/80 flex-shrink-0">
                    {initials(user.full_name, user.email)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90">{user.full_name || '—'}</p>
                    <p className="text-xs text-white/30">{user.job_title || '—'}</p>
                  </div>
                </div>

                {/* Email */}
                <p className="text-sm text-white/50 truncate pr-4">{user.email}</p>

                {/* Department */}
                <p className="text-sm text-white/40">{user.department || '—'}</p>

                {/* Date */}
                <p className="text-xs text-white/30">
                  {new Date(user.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: '2-digit' })}
                </p>

                {/* Role selector */}
                <div className="flex items-center gap-2">
                  {updating === user.id ? (
                    <span className="text-xs text-white/30">Guardando...</span>
                  ) : user.id === currentUser.id ? (
                    <span className={`text-xs px-3 py-1 rounded-full font-medium border ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  ) : (
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 outline-none hover:border-white/20 transition-colors cursor-pointer"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r} className="bg-[#1a1a2e]">
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
