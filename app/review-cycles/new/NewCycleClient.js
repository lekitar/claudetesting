'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/app/components/Sidebar';

const TYPES = [
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
  { value: 'custom', label: 'Personalizado' },
];

export default function NewCycleClient({ user, profile, templates, employees }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', type: 'quarterly', start_date: '', end_date: '',
    description: '', template_id: templates.find(t => t.is_default)?.id || templates[0]?.id || '',
  });
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');

  const filteredEmployees = employees.filter(e =>
    e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.job_title?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleEmployee = (id) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(e => e.id));
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.start_date || !form.end_date) {
      setError('Completá el nombre y las fechas del ciclo.');
      return;
    }
    setSaving(true);
    setError('');
    const supabase = createClient();

    const { data: cycle, error: cycleError } = await supabase
      .from('review_cycles')
      .insert({
        name: form.name, type: form.type,
        start_date: form.start_date, end_date: form.end_date,
        description: form.description, template_id: form.template_id || null,
        status: 'draft', created_by: user.id,
      })
      .select().single();

    if (cycleError || !cycle) {
      setError('Error al crear el ciclo. Intentá de nuevo.');
      setSaving(false);
      return;
    }

    // Add participants
    if (selectedEmployees.length > 0) {
      const participants = selectedEmployees.map(uid => ({ cycle_id: cycle.id, user_id: uid }));
      await supabase.from('cycle_participants').insert(participants);

      // Create self-assessment review for each participant
      const reviews = selectedEmployees.map(uid => ({
        cycle_id: cycle.id, reviewer_id: uid, reviewee_id: uid,
        type: 'self', status: 'pending',
      }));
      await supabase.from('reviews').insert(reviews);
    }

    router.push(`/review-cycles/${cycle.id}`);
  };

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F4', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 40px 80px' }}>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <button onClick={() => router.push('/review-cycles')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#A8A29E', padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0C0A09'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A8A29E'}
            >
              ← Ciclos
            </button>

            <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>
              Nuevo ciclo de evaluación
            </h1>
            <p style={{ margin: '0 0 36px', fontSize: 14, color: '#78716C' }}>
              Configurá el ciclo y seleccioná quiénes participan
            </p>

            {/* Step indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
              {[{ n: 1, label: 'Configuración' }, { n: 2, label: 'Participantes' }].map((s, i) => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: step >= s.n ? '#0C0A09' : '#E7E5E4',
                      fontSize: 12, fontWeight: 600, color: step >= s.n ? '#FFFFFF' : '#A8A29E',
                    }}>{s.n}</div>
                    <span style={{ fontSize: 13.5, color: step >= s.n ? '#0C0A09' : '#A8A29E', fontWeight: step === s.n ? 600 : 400 }}>{s.label}</span>
                  </div>
                  {i < 1 && <div style={{ width: 32, height: 1, background: step > s.n ? '#0C0A09' : '#E7E5E4' }} />}
                </div>
              ))}
            </div>
          </motion.div>

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#344054', marginBottom: 7 }}>
                      Nombre del ciclo <span style={{ color: '#F04438' }}>*</span>
                    </label>
                    <input
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Ej: Q2 Performance Review 2026"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E7E5E4', fontSize: 14, color: '#0C0A09', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#0C0A09'}
                      onBlur={e => e.target.style.borderColor = '#E7E5E4'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#344054', marginBottom: 7 }}>Tipo</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {TYPES.map(t => (
                        <button key={t.value} onClick={() => setForm({ ...form, type: t.value })}
                          style={{
                            padding: '9px 8px', borderRadius: 8, border: `1.5px solid ${form.type === t.value ? '#0C0A09' : '#E7E5E4'}`,
                            background: form.type === t.value ? '#0C0A09' : '#FFFFFF',
                            color: form.type === t.value ? '#FFFFFF' : '#78716C',
                            fontSize: 13, fontWeight: form.type === t.value ? 600 : 400, cursor: 'pointer',
                          }}
                        >{t.label}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#344054', marginBottom: 7 }}>
                        Fecha de inicio <span style={{ color: '#F04438' }}>*</span>
                      </label>
                      <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E7E5E4', fontSize: 14, color: '#0C0A09', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = '#0C0A09'}
                        onBlur={e => e.target.style.borderColor = '#E7E5E4'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#344054', marginBottom: 7 }}>
                        Fecha de cierre <span style={{ color: '#F04438' }}>*</span>
                      </label>
                      <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E7E5E4', fontSize: 14, color: '#0C0A09', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = '#0C0A09'}
                        onBlur={e => e.target.style.borderColor = '#E7E5E4'}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#344054', marginBottom: 7 }}>
                      Plantilla de preguntas
                    </label>
                    <select value={form.template_id} onChange={e => setForm({ ...form, template_id: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E7E5E4', fontSize: 14, color: '#0C0A09', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#0C0A09'}
                      onBlur={e => e.target.style.borderColor = '#E7E5E4'}
                    >
                      <option value="">Sin plantilla</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}{t.is_default ? ' (por defecto)' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#344054', marginBottom: 7 }}>
                      Descripción <span style={{ fontSize: 12, fontWeight: 400, color: '#A8A29E' }}>(opcional)</span>
                    </label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={3} placeholder="Describí el objetivo de este ciclo..."
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E7E5E4', fontSize: 14, color: '#0C0A09', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#0C0A09'}
                      onBlur={e => e.target.style.borderColor = '#E7E5E4'}
                    />
                  </div>
                </div>
              </div>

              {error && <p style={{ margin: 0, fontSize: 13.5, color: '#DC2626' }}>{error}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { if (!form.name || !form.start_date || !form.end_date) { setError('Completá el nombre y las fechas.'); return; } setError(''); setStep(2); }}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#0C0A09', color: '#FFFFFF', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#292524'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0C0A09'}
                >
                  Siguiente: Participantes →
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
                {/* Search + select all */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Buscar empleado..."
                      style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13.5, color: '#0C0A09', background: 'transparent' }}
                    />
                  </div>
                  <button onClick={selectAll}
                    style={{ fontSize: 12.5, color: '#0C0A09', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                  >
                    {selectedEmployees.length === filteredEmployees.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                  <span style={{ fontSize: 12.5, color: '#A8A29E' }}>{selectedEmployees.length} seleccionados</span>
                </div>

                <div style={{ maxHeight: 360, overflow: 'auto' }}>
                  {filteredEmployees.map((e, i) => {
                    const selected = selectedEmployees.includes(e.id);
                    return (
                      <div key={e.id}
                        onClick={() => toggleEmployee(e.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer',
                          background: selected ? '#FAFAF9' : 'transparent',
                          borderBottom: i < filteredEmployees.length - 1 ? '1px solid #FAFAF9' : 'none',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={(ev) => { if (!selected) ev.currentTarget.style.background = '#FAFAF9'; }}
                        onMouseLeave={(ev) => { if (!selected) ev.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                          border: `1.5px solid ${selected ? '#0C0A09' : '#D6D3D1'}`,
                          background: selected ? '#0C0A09' : '#FFFFFF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {selected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1C1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#78716C', flexShrink: 0 }}>
                          {initials(e.full_name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#0C0A09' }}>{e.full_name || '(Sin nombre)'}</p>
                          <p style={{ margin: '1px 0 0', fontSize: 12, color: '#A8A29E' }}>{[e.job_title, e.department].filter(Boolean).join(' · ') || '—'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setStep(1)}
                  style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid #E7E5E4', background: '#FFFFFF', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#0C0A09' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F4'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                >
                  ← Anterior
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={saving}
                  style={{
                    padding: '10px 24px', borderRadius: 8, border: 'none',
                    background: saving ? '#E7E5E4' : '#0C0A09', color: saving ? '#A8A29E' : '#FFFFFF',
                    fontSize: 14, fontWeight: 500, cursor: saving ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                  onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#292524'; }}
                  onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#0C0A09'; }}
                >
                  {saving ? 'Creando ciclo...' : `Crear ciclo${selectedEmployees.length > 0 ? ` con ${selectedEmployees.length} participantes` : ''}`}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
