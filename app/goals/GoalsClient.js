'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/app/components/Sidebar';
import { createClient } from '@/lib/supabase/client';

const STATUS_CONFIG = {
  active:    { label: 'Activo',      bg: '#F5F5F4', color: '#0C0A09' },
  completed: { label: 'Completado',  bg: '#F0FDF4', color: '#15803D' },
  draft:     { label: 'Borrador',    bg: '#F5F5F4', color: '#78716C' },
  cancelled: { label: 'Cancelado',   bg: '#FFF2F2', color: '#DC2626' },
};

const TABS = [
  { key: 'all',        label: 'Todos' },
  { key: 'mine',       label: 'Mis objetivos' },
  { key: 'active',     label: 'En progreso' },
  { key: 'completed',  label: 'Completados' },
];

const EMPTY_OBJ = {
  title: '', description: '', owner_id: '', team_id: '',
  due_date: '', status: 'active', progress: 0,
};

const EMPTY_KR = { title: '', target_value: '', unit: '' };

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ── Circular progress ring ──────────────────────────────────────────────────
function CircleProgress({ value }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const gap  = circ - dash;
  return (
    <svg width="48" height="48" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx="24" cy="24" r={r} fill="none" stroke="#E7E5E4" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke="#0C0A09" strokeWidth="4"
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
      />
      <text
        x="24" y="24"
        textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 11, fontWeight: 700, fill: '#0C0A09', transform: 'rotate(90deg)', transformOrigin: '24px 24px' }}
      >
        {pct}%
      </text>
    </svg>
  );
}

// ── Mini progress bar ───────────────────────────────────────────────────────
function MiniBar({ current, target }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div style={{ height: 4, background: '#E7E5E4', borderRadius: 2, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: '#0C0A09', borderRadius: 2, transition: 'width 0.4s' }} />
    </div>
  );
}

// ── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}22`,
    }}>
      {cfg.label}
    </span>
  );
}

// ── Input / select shared style ─────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1px solid #E7E5E4', background: '#FFFFFF', color: '#0C0A09',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#78716C', marginBottom: 5, letterSpacing: '0.03em', textTransform: 'uppercase' };

// ── Objective card ──────────────────────────────────────────────────────────
function ObjectiveCard({ obj, index, canEdit, onEdit }) {
  const [open, setOpen] = useState(false);
  const hasKRs = obj.key_results && obj.key_results.length > 0;
  const ownerName = obj.profiles?.full_name || '—';
  const teamName  = obj.teams?.name || null;
  const overdue   = obj.status !== 'completed' && isOverdue(obj.due_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      style={{
        background: '#FFFFFF', borderRadius: 12, border: '1px solid #E7E5E4',
        padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <CircleProgress value={obj.progress} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0C0A09', lineHeight: 1.3 }}>{obj.title}</span>
            <StatusBadge status={obj.status} />
          </div>

          {obj.description && (
            <p style={{ margin: '0 0 6px', fontSize: 13, color: '#78716C', lineHeight: 1.5 }}>{obj.description}</p>
          )}

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#A8A29E' }}>
            <span>{ownerName}{obj.profiles?.job_title ? ` · ${obj.profiles.job_title}` : ''}</span>
            {teamName && <span>Equipo: {teamName}</span>}
            {obj.due_date && (
              <span style={{ color: overdue ? '#DC2626' : '#A8A29E', fontWeight: overdue ? 600 : 400 }}>
                Vence: {formatDate(obj.due_date)}{overdue ? ' · Vencido' : ''}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'flex-start' }}>
          {hasKRs && (
            <button
              onClick={() => setOpen(v => !v)}
              style={{
                padding: '5px 12px', borderRadius: 7, border: '1px solid #E7E5E4',
                background: '#FFFFFF', color: '#78716C', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {open ? 'Ocultar KRs' : `Ver KRs (${obj.key_results.length})`}
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => onEdit(obj)}
              style={{
                padding: '5px 12px', borderRadius: 7, border: '1px solid #E7E5E4',
                background: '#FFFFFF', color: '#0C0A09', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 6, background: '#E7E5E4', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${obj.progress || 0}%`, background: '#0C0A09', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        <span style={{ fontSize: 12, color: '#A8A29E', width: 36, textAlign: 'right' }}>{obj.progress || 0}%</span>
      </div>

      {/* Key results */}
      <AnimatePresence initial={false}>
        {open && hasKRs && (
          <motion.div
            key="krs"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid #E7E5E4', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#A8A29E', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Resultados clave</span>
              {obj.key_results.map((kr) => {
                const pct = kr.target_value > 0 ? Math.min(100, Math.round(((kr.current_value || 0) / kr.target_value) * 100)) : 0;
                return (
                  <div key={kr.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, color: '#0C0A09', flex: 1 }}>{kr.title}</span>
                      <span style={{ fontSize: 12, color: '#78716C', whiteSpace: 'nowrap' }}>
                        {kr.current_value ?? 0} / {kr.target_value} {kr.unit}
                      </span>
                      <span style={{ fontSize: 11, color: '#A8A29E', width: 32, textAlign: 'right' }}>{pct}%</span>
                    </div>
                    <MiniBar current={kr.current_value || 0} target={kr.target_value} />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Slide-over form ─────────────────────────────────────────────────────────
function SlideOver({ mode, initial, teams, allProfiles, currentUserId, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState(initial || { ...EMPTY_OBJ, owner_id: currentUserId });
  const [krs, setKrs] = useState(
    mode === 'edit' && initial?.key_results?.length
      ? initial.key_results.map(kr => ({ ...kr }))
      : [{ ...EMPTY_KR }]
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleKr = (i, field, value) => {
    setKrs(prev => prev.map((kr, idx) => idx === i ? { ...kr, [field]: value } : kr));
  };
  const addKr = () => setKrs(prev => [...prev, { ...EMPTY_KR }]);
  const removeKr = (i) => setKrs(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('El título es requerido.'); return; }
    setSaving(true);
    setError('');
    const supabase = createClient();

    const payload = {
      title:       form.title.trim(),
      description: form.description.trim() || null,
      owner_id:    form.owner_id || currentUserId,
      team_id:     form.team_id || null,
      due_date:    form.due_date || null,
      status:      form.status,
      progress:    Number(form.progress) || 0,
    };

    let objId = form.id;

    if (mode === 'new') {
      const { data, error: err } = await supabase.from('objectives').insert(payload).select().single();
      if (err) { setError('Error al crear el objetivo.'); setSaving(false); return; }
      objId = data.id;
    } else {
      const { error: err } = await supabase.from('objectives').update(payload).eq('id', objId);
      if (err) { setError('Error al guardar los cambios.'); setSaving(false); return; }
    }

    // Upsert key results
    const validKrs = krs.filter(kr => kr.title.trim());
    for (const kr of validKrs) {
      const krPayload = {
        objective_id: objId,
        title:        kr.title.trim(),
        target_value: Number(kr.target_value) || 0,
        unit:         kr.unit.trim() || null,
        current_value: kr.current_value ?? 0,
      };
      if (kr.id) {
        await supabase.from('key_results').update(krPayload).eq('id', kr.id);
      } else {
        await supabase.from('key_results').insert(krPayload);
      }
    }

    // Fetch updated objective with relations
    const { data: updated } = await supabase
      .from('objectives')
      .select('id, title, description, status, progress, due_date, created_at, owner_id, team_id, profiles!objectives_owner_id_fkey(full_name, job_title), teams(name), key_results(id, title, current_value, target_value, unit)')
      .eq('id', objId)
      .single();

    setSaving(false);
    onSaved(updated, mode);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('key_results').delete().eq('objective_id', form.id);
    const { error: err } = await supabase.from('objectives').delete().eq('id', form.id);
    if (err) { setError('Error al eliminar.'); setDeleting(false); return; }
    onDeleted(form.id);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          zIndex: 40, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <motion.div
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 480,
          background: '#FFFFFF', zIndex: 50, overflowY: 'auto',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Panel header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #E7E5E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0C0A09' }}>
            {mode === 'new' ? 'Nuevo objetivo' : 'Editar objetivo'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', padding: 4, lineHeight: 1 }} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 28px', gap: 20 }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Título <span style={{ color: '#DC2626' }}>*</span></label>
            <input
              style={inputStyle}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Ej. Aumentar retención de clientes"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Descripción opcional del objetivo…"
            />
          </div>

          {/* Owner */}
          <div>
            <label style={labelStyle}>Responsable</label>
            <select style={inputStyle} value={form.owner_id} onChange={e => set('owner_id', e.target.value)}>
              <option value="">Sin asignar</option>
              {allProfiles.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}{p.job_title ? ` — ${p.job_title}` : ''}</option>
              ))}
            </select>
          </div>

          {/* Team */}
          <div>
            <label style={labelStyle}>Equipo</label>
            <select style={inputStyle} value={form.team_id || ''} onChange={e => set('team_id', e.target.value)}>
              <option value="">Sin equipo</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Due date + Status row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Fecha de vencimiento</label>
              <input type="date" style={inputStyle} value={form.due_date || ''} onChange={e => set('due_date', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Estado</label>
              <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          {/* Progress */}
          <div>
            <label style={labelStyle}>Progreso: {form.progress}%</label>
            <input
              type="range" min={0} max={100} step={1}
              value={form.progress}
              onChange={e => set('progress', e.target.value)}
              style={{ width: '100%', accentColor: '#0C0A09' }}
            />
          </div>

          {/* Key results */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Resultados clave</label>
              <button type="button" onClick={addKr} style={{ background: 'none', border: 'none', color: '#0C0A09', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', padding: '2px 6px' }}>
                + Añadir KR
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {krs.map((kr, i) => (
                <div key={i} style={{ background: '#F5F5F4', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>KR {i + 1}</span>
                    {krs.length > 1 && (
                      <button type="button" onClick={() => removeKr(i)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', padding: 0 }}>
                        Eliminar
                      </button>
                    )}
                  </div>
                  <input
                    style={{ ...inputStyle, background: '#FFFFFF' }}
                    placeholder="Título del resultado clave"
                    value={kr.title}
                    onChange={e => handleKr(i, 'title', e.target.value)}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input
                      style={{ ...inputStyle, background: '#FFFFFF' }}
                      placeholder="Meta (ej. 100)"
                      type="number"
                      min={0}
                      value={kr.target_value}
                      onChange={e => handleKr(i, 'target_value', e.target.value)}
                    />
                    <input
                      style={{ ...inputStyle, background: '#FFFFFF' }}
                      placeholder="Unidad (ej. %)"
                      value={kr.unit}
                      onChange={e => handleKr(i, 'unit', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 13, color: '#DC2626', background: '#FFF2F2', padding: '8px 12px', borderRadius: 7 }}>{error}</p>
          )}

          {/* Actions */}
          <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                background: saving ? '#A8A29E' : '#0C0A09', color: '#FFFFFF',
                fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >
              {saving ? 'Guardando…' : mode === 'new' ? 'Crear objetivo' : 'Guardar cambios'}
            </button>

            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  width: '100%', padding: '11px', borderRadius: 8,
                  border: '1px solid #DC2626', background: confirmDelete ? '#FFF2F2' : '#FFFFFF',
                  color: '#DC2626', fontSize: 14, fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}
              >
                {deleting ? 'Eliminando…' : confirmDelete ? '¿Confirmar eliminación?' : 'Eliminar objetivo'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%', padding: '11px', borderRadius: 8,
                border: '1px solid #E7E5E4', background: '#FFFFFF',
                color: '#78716C', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function GoalsClient({ user, profile, objectives: initialObjectives, teams, allProfiles }) {
  const [objectives, setObjectives] = useState(initialObjectives);
  const [tab, setTab] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [editObj, setEditObj] = useState(null);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'hr_admin';

  const canEdit = (obj) => isAdmin || obj.owner_id === user.id;

  const filtered = objectives.filter(obj => {
    if (tab === 'mine')      return obj.owner_id === user.id;
    if (tab === 'active')    return obj.status === 'active';
    if (tab === 'completed') return obj.status === 'completed';
    return true;
  });

  const handleSaved = (updated, mode) => {
    if (mode === 'new') {
      setObjectives(prev => [updated, ...prev]);
    } else {
      setObjectives(prev => prev.map(o => o.id === updated.id ? updated : o));
    }
    setShowNew(false);
    setEditObj(null);
  };

  const handleDeleted = (id) => {
    setObjectives(prev => prev.filter(o => o.id !== id));
    setEditObj(null);
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#F5F5F4',
      fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased',
    }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 40px 64px' }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0C0A09', letterSpacing: '-0.5px' }}>Objetivos</h1>
              <p style={{ margin: '6px 0 0', fontSize: 15, color: '#78716C' }}>
                Seguí el progreso de tus metas y resultados clave.
              </p>
            </div>
            {(isAdmin || true) && (
              <button
                onClick={() => setShowNew(true)}
                style={{
                  padding: '10px 20px', borderRadius: 9, border: 'none',
                  background: '#0C0A09', color: '#FFFFFF',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#292524'}
                onMouseLeave={e => e.currentTarget.style.background = '#0C0A09'}
              >
                + Nuevo objetivo
              </button>
            )}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.08 }}
            style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid #E7E5E4', paddingBottom: 0 }}
          >
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderBottom: tab === t.key ? '2px solid #0C0A09' : '2px solid transparent',
                  background: 'transparent',
                  color: tab === t.key ? '#0C0A09' : '#78716C',
                  fontWeight: tab === t.key ? 700 : 400,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  marginBottom: -1,
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {t.label}
                <span style={{
                  marginLeft: 6, padding: '1px 7px', borderRadius: 99,
                  background: tab === t.key ? '#0C0A09' : '#E7E5E4',
                  color: tab === t.key ? '#FFFFFF' : '#78716C',
                  fontSize: 11, fontWeight: 600,
                }}>
                  {t.key === 'all'       ? objectives.length
                   : t.key === 'mine'    ? objectives.filter(o => o.owner_id === user.id).length
                   : t.key === 'active'  ? objectives.filter(o => o.status === 'active').length
                   : objectives.filter(o => o.status === 'completed').length}
                </span>
              </button>
            ))}
          </motion.div>

          {/* List */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              style={{
                textAlign: 'center', padding: '72px 32px',
                background: '#FFFFFF', borderRadius: 14, border: '1px solid #E7E5E4',
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#78716C' }}>No hay objetivos todavía.</p>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#A8A29E' }}>Creá tu primer objetivo usando el botón de arriba.</p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filtered.map((obj, i) => (
                <ObjectiveCard
                  key={obj.id}
                  obj={obj}
                  index={i}
                  canEdit={canEdit(obj)}
                  onEdit={setEditObj}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide-overs */}
      <AnimatePresence>
        {showNew && (
          <SlideOver
            key="new"
            mode="new"
            initial={{ ...EMPTY_OBJ, owner_id: user.id }}
            teams={teams}
            allProfiles={allProfiles}
            currentUserId={user.id}
            onClose={() => setShowNew(false)}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        )}
        {editObj && (
          <SlideOver
            key={`edit-${editObj.id}`}
            mode="edit"
            initial={editObj}
            teams={teams}
            allProfiles={allProfiles}
            currentUserId={user.id}
            onClose={() => setEditObj(null)}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
