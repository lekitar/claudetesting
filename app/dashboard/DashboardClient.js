'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const stats = [
  { label: 'Evaluaciones Activas', value: '12', change: '+3', trend: 'up', icon: '📋', color: '#6366f1' },
  { label: 'Completadas este ciclo', value: '87%', change: '+12%', trend: 'up', icon: '✅', color: '#10b981' },
  { label: 'Empleados evaluados', value: '142', change: '+8', trend: 'up', icon: '👥', color: '#8b5cf6' },
  { label: 'Pendientes de revisión', value: '5', change: '-2', trend: 'down', icon: '⏳', color: '#f59e0b' },
];

const recentActivity = [
  { name: 'Ana García', role: 'Senior Developer', status: 'Completada', score: 4.8, avatar: 'AG' },
  { name: 'Carlos López', role: 'Product Manager', status: 'En progreso', score: null, avatar: 'CL' },
  { name: 'María Rodríguez', role: 'UX Designer', status: 'Completada', score: 4.5, avatar: 'MR' },
  { name: 'Juan Pérez', role: 'Data Analyst', status: 'Pendiente', score: null, avatar: 'JP' },
  { name: 'Laura Martínez', role: 'Backend Developer', status: 'Completada', score: 4.2, avatar: 'LM' },
];

const navItems = [
  { icon: '⊞', label: 'Dashboard', active: true },
  { icon: '📋', label: 'Evaluaciones', active: false },
  { icon: '🎯', label: 'Objetivos', active: false },
  { icon: '👥', label: 'Empleados', active: false },
  { icon: '📊', label: 'Reportes', active: false },
  { icon: '⚙️', label: 'Configuración', active: false },
];

export default function DashboardClient({ user, profile }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const isSuperAdmin = profile?.role === 'super_admin';

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const userName = user.email?.split('@')[0] || 'Usuario';

  return (
    <div className="flex min-h-screen bg-[#0f0f1a] text-white" style={{ fontFamily: 'sans-serif' }}>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-64 flex-shrink-0 bg-white/[0.03] border-r border-white/[0.06] flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">PerformIQ</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </motion.button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{userName}</p>
              <p className="text-xs text-white/30 truncate">{user.email}</p>
            </div>
            <button onClick={handleSignOut} disabled={signingOut}
              className="text-white/30 hover:text-white/70 transition-colors text-xs" title="Cerrar sesión">
              {signingOut ? '...' : '→'}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sticky top-0 z-10 bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-white/[0.06] px-8 py-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-white/40 text-sm">Ciclo Q1 2026 — 23 días restantes</p>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium hover:bg-purple-500/20 transition-colors flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Admin
              </button>
            )}
            <button className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium hover:bg-indigo-500/20 transition-colors">
              + Nueva evaluación
            </button>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 cursor-pointer transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
          </div>
        </motion.header>

        <div className="p-8 space-y-8">

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-white/40 text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent evaluations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="font-semibold text-white">Evaluaciones Recientes</h2>
              <button className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">Ver todas →</button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {recentActivity.map((person, i) => (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.06 }}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-600/40 border border-white/10 flex items-center justify-center text-sm font-bold text-white/80">
                    {person.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/90">{person.name}</p>
                    <p className="text-xs text-white/40">{person.role}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    person.status === 'Completada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    person.status === 'En progreso' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    'bg-white/5 text-white/30 border border-white/10'
                  }`}>
                    {person.status}
                  </span>
                  {person.score && (
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 text-xs">★</span>
                      <span className="text-sm font-semibold text-white/80">{person.score}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
