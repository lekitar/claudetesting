'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const floatingOrbs = [
  { w: 350, h: 350, top: '-8%', right: '-5%', color: '#8b5cf6', delay: 0 },
  { w: 250, h: 250, top: '65%', left: '-6%', color: '#6366f1', delay: 2 },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); return; }
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }

    setIsLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName } },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const fields = [
    { name: 'fullName', label: 'Nombre completo', type: 'text', placeholder: 'Juan Pérez' },
    { name: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'nombre@empresa.com' },
    { name: 'password', label: 'Contraseña', type: showPassword ? 'text' : 'password', placeholder: 'Mínimo 8 caracteres' },
    { name: 'confirm', label: 'Confirmar contraseña', type: 'password', placeholder: 'Repite tu contraseña' },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a1a] py-10">
      {floatingOrbs.map((orb, i) => (
        <motion.div key={i} className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ width: orb.w, height: orb.h, top: orb.top, left: orb.left, right: orb.right, background: orb.color }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.22, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }} />
      ))}

      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)`, backgroundSize: '40px 40px' }} />

      <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 w-full max-w-md mx-4">

        <div className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/40 p-8">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />

          {/* Brand */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">PerformIQ</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Crear cuenta</h1>
            <p className="text-white/50 text-sm">Empieza a gestionar el desempeño de tu equipo</p>
          </motion.div>

          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest transition-colors"
                  style={{ color: focusedField === field.name ? '#818cf8' : 'rgba(255,255,255,0.5)' }}>
                  {field.label}
                </label>
                <input name={field.name} type={field.type} value={form[field.name]}
                  onChange={handleChange} onFocus={() => setFocusedField(field.name)} onBlur={() => setFocusedField(null)}
                  placeholder={field.placeholder} required
                  className="w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm outline-none transition-all duration-300"
                  style={{
                    borderColor: focusedField === field.name ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    boxShadow: focusedField === field.name ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                  }} />
              </div>
            ))}

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span className="text-red-400 text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="relative w-full py-3.5 rounded-xl font-semibold text-white text-sm overflow-hidden mt-2 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2">
                    <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                    <span>Creando cuenta...</span>
                  </motion.div>
                ) : (
                  <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Crear Cuenta →
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-center text-white/30 text-xs mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Iniciar sesión
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
