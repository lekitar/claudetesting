'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/app/components/Sidebar';
import { createClient } from '@/lib/supabase/client';

const ROLE_LABELS = {
  employee: 'Empleado',
  manager: 'Manager',
  hr_admin: 'RR.HH.',
  super_admin: 'Super Admin',
};

const ROLE_OPTIONS = [
  { value: 'employee', label: 'Empleado' },
  { value: 'manager', label: 'Manager' },
  { value: 'hr_admin', label: 'RR.HH.' },
  { value: 'super_admin', label: 'Super Admin' },
];

const DEPT_COLORS = ['#E7E5E4', '#DCFCE7', '#DBEAFE', '#FEF3C7', '#FCE7F3', '#EDE9FE'];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ name, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#292524', border: '1px solid #3B3B38',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 600, color: '#A8A29E', flexShrink: 0,
      letterSpacing: '0.02em',
    }}>
      {getInitials(name)}
    </div>
  );
}

function StatusDot({ active }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
      background: active ? '#DCFCE7' : '#F5F5F4',
      color: active ? '#15803D' : '#78716C',
      border: `1px solid ${active ? '#BBF7D0' : '#E7E5E4'}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: active ? '#22C55E' : '#A8A29E' }} />
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function RoleBadge({ role }) {
  const colors = {
    super_admin: { bg: '#1C1917', color: '#D6D3D1' },
    hr_admin: { bg: '#292524', color: '#D6D3D1' },
    manager: { bg: '#F5F5F4', color: '#57534E' },
    employee: { bg: '#F5F5F4', color: '#78716C' },
  };
  const c = colors[role] || colors.employee;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
      background: c.bg, color: c.color,
    }}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button" onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
        background: checked ? '#0C0A09' : '#E7E5E4', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
      aria-checked={checked} role="switch"
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
}

function Field({ label, children, note }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12.5, fontWeight: 500, color: '#292524' }}>{label}</label>
      {children}
      {note && <span style={{ fontSize: 11.5, color: '#78716C', lineHeight: 1.4 }}>{note}</span>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', readOnly }) {
  return (
    <input
      type={type} value={value || ''} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} readOnly={readOnly}
      style={{
        height: 36, padding: '0 10px', borderRadius: 7,
        border: '1px solid #E7E5E4', background: readOnly ? '#F5F5F4' : '#FFFFFF',
        color: '#0C0A09', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
      }}
      onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = '#0C0A09'; }}
      onBlur={e => e.currentTarget.style.borderColor = '#E7E5E4'}
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      style={{
        height: 36, padding: '0 10px', borderRadius: 7,
        border: '1px solid #E7E5E4', background: '#FFFFFF',
        color: value ? '#0C0A09' : '#A8A29E', fontSize: 13,
        outline: 'none', width: '100%', boxSizing: 'border-box', cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 30,
      }}
      onFocus={e => e.currentTarget.style.borderColor = '#0C0A09'}
      onBlur={e => e.currentTarget.style.borderColor = '#E7E5E4'}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function SlideOver({ title, subtitle, onClose, onSave, saving, saveLabel, error, children }) {
  return (
    <>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 40 }}
      />
      <motion.div
        key="panel"
        initial={{ x: 460, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 460, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 460,
          background: '#FFFFFF', borderLeft: '1px solid #E7E5E4',
          zIndex: 50, display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 18px', borderBottom: '1px solid #E7E5E4',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 1,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.02em' }}>{title}</p>
            {subtitle && <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#A8A29E' }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6, border: '1px solid #E7E5E4',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716C',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F4'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: 7,
              background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 12.5,
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #E7E5E4',
          display: 'flex', gap: 8,
          position: 'sticky', bottom: 0, background: '#FFFFFF',
        }}>
          <button
            onClick={onSave} disabled={saving}
            style={{
              flex: 1, height: 36, borderRadius: 7, border: 'none',
              background: saving ? '#A8A29E' : '#0C0A09',
              color: '#FFFFFF', fontSize: 13, fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#292524'; }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#0C0A09'; }}
          >
            {saving ? 'Guardando...' : saveLabel}
          </button>
          <button
            onClick={onClose}
            style={{
              height: 36, padding: '0 16px', borderRadius: 7,
              border: '1px solid #E7E5E4', background: '#FFFFFF',
              color: '#0C0A09', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F4'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </>
  );
}

const EMPTY_FORM = {
  full_name: '', email: '', job_title: '', department: '',
  role: 'employee', manager_id: '', team_id: '', hire_date: '', is_active: true,
};

export default function PeopleClient({ user, profile, people: initialPeople, teams }) {
  const supabase = createClient();
  const [people, setPeople] = useState(initialPeople);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Panels
  const [showNew, setShowNew] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Forms
  const [newForm, setNewForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState({});

  const isSuperAdmin = profile?.role === 'super_admin';

  const filtered = useMemo(() => {
    let result = people;
    const q = search.toLowerCase().trim();
    if (q) result = result.filter(p =>
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.job_title || '').toLowerCase().includes(q) ||
      (p.department || '').toLowerCase().includes(q)
    );
    if (filterRole) result = result.filter(p => p.role === filterRole);
    if (filterTeam) result = result.filter(p => p.team_id === filterTeam);
    if (filterStatus === 'active') result = result.filter(p => p.is_active !== false);
    if (filterStatus === 'inactive') result = result.filter(p => p.is_active === false);
    return result;
  }, [people, search, filterRole, filterTeam, filterStatus]);

  function getManagerName(mid) {
    if (!mid) return '—';
    return people.find(p => p.id === mid)?.full_name || '—';
  }
  function getTeamName(tid) {
    if (!tid) return '—';
    return teams.find(t => t.id === tid)?.name || '—';
  }

  function openNew() {
    setNewForm(EMPTY_FORM);
    setError('');
    setShowNew(true);
  }
  function closeNew() { setShowNew(false); setError(''); }

  function openEdit(person) {
    setEditForm({
      full_name: person.full_name || '',
      job_title: person.job_title || '',
      department: person.department || '',
      role: person.role || 'employee',
      manager_id: person.manager_id || '',
      team_id: person.team_id || '',
      hire_date: person.hire_date || '',
      is_active: person.is_active !== false,
    });
    setDeleteConfirm(false);
    setError('');
    setEditingPerson(person);
  }
  function closeEdit() { setEditingPerson(null); setError(''); setDeleteConfirm(false); }

  async function handleCreate() {
    if (!newForm.full_name.trim()) { setError('El nombre es obligatorio.'); return; }
    if (!newForm.email.trim()) { setError('El email es obligatorio.'); return; }
    setSaving(true); setError('');
    const id = crypto.randomUUID();
    const payload = {
      id,
      full_name: newForm.full_name.trim(),
      email: newForm.email.trim(),
      job_title: newForm.job_title || null,
      department: newForm.department || null,
      role: newForm.role || 'employee',
      manager_id: newForm.manager_id || null,
      team_id: newForm.team_id || null,
      hire_date: newForm.hire_date || null,
      is_active: true,
    };
    const { error: err } = await supabase.from('profiles').insert(payload);
    if (err) { setError(err.message); setSaving(false); return; }
    setPeople(prev => [...prev, payload].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')));
    setSaving(false);
    closeNew();
  }

  async function handleSaveEdit() {
    if (!editForm.full_name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true); setError('');
    const payload = {
      full_name: editForm.full_name.trim(),
      job_title: editForm.job_title || null,
      department: editForm.department || null,
      role: editForm.role || 'employee',
      manager_id: editForm.manager_id || null,
      team_id: editForm.team_id || null,
      hire_date: editForm.hire_date || null,
      is_active: editForm.is_active,
    };
    const { error: err } = await supabase.from('profiles').update(payload).eq('id', editingPerson.id);
    if (err) { setError(err.message); setSaving(false); return; }
    setPeople(prev => prev.map(p => p.id === editingPerson.id ? { ...p, ...payload } : p));
    setSaving(false);
    closeEdit();
  }

  async function handleToggleActive(person) {
    const newActive = person.is_active === false ? true : false;
    const { error: err } = await supabase.from('profiles').update({ is_active: newActive }).eq('id', person.id);
    if (!err) {
      setPeople(prev => prev.map(p => p.id === person.id ? { ...p, is_active: newActive } : p));
    }
  }

  const managerOptions = [
    { value: '', label: 'Sin manager' },
    ...people.filter(p => p.id !== editingPerson?.id).map(p => ({ value: p.id, label: p.full_name || p.email || p.id })),
  ];

  const teamOptions = [
    { value: '', label: 'Sin equipo' },
    ...teams.map(t => ({ value: t.id, label: t.name })),
  ];

  const stats = {
    total: people.length,
    active: people.filter(p => p.is_active !== false).length,
    managers: people.filter(p => p.role === 'manager').length,
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', background: '#F5F5F4',
      fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased',
    }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '36px 36px 56px' }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}
          >
            <div>
              <h1 style={{ margin: '0 0 5px', fontSize: 24, fontWeight: 700, color: '#0C0A09', letterSpacing: '-0.03em' }}>
                Personas
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: '#78716C' }}>
                {stats.total} {stats.total === 1 ? 'persona' : 'personas'} · {stats.active} activas · {stats.managers} managers
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={openNew}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 36, padding: '0 16px', borderRadius: 8, border: 'none',
                background: '#0C0A09', color: '#FFFFFF', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#292524'}
              onMouseLeave={e => e.currentTarget.style.background = '#0C0A09'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nueva persona
            </motion.button>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}
          >
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: 220, maxWidth: 340 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', pointerEvents: 'none' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, cargo..."
                style={{
                  height: 34, width: '100%', paddingLeft: 32, paddingRight: 12,
                  borderRadius: 7, border: '1px solid #E7E5E4', background: '#FFFFFF',
                  color: '#0C0A09', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            {/* Role filter */}
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', borderRadius: 7,
                border: '1px solid #E7E5E4', background: '#FFFFFF', color: filterRole ? '#0C0A09' : '#A8A29E',
                fontSize: 13, outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
              }}
            >
              <option value="">Todos los roles</option>
              {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Team filter */}
            <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', borderRadius: 7,
                border: '1px solid #E7E5E4', background: '#FFFFFF', color: filterTeam ? '#0C0A09' : '#A8A29E',
                fontSize: 13, outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
              }}
            >
              <option value="">Todos los equipos</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {/* Status filter */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', borderRadius: 7,
                border: '1px solid #E7E5E4', background: '#FFFFFF', color: filterStatus ? '#0C0A09' : '#A8A29E',
                fontSize: 13, outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
              }}
            >
              <option value="">Cualquier estado</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>

            {(search || filterRole || filterTeam || filterStatus) && (
              <button
                onClick={() => { setSearch(''); setFilterRole(''); setFilterTeam(''); setFilterStatus(''); }}
                style={{
                  height: 34, padding: '0 12px', borderRadius: 7,
                  border: '1px solid #E7E5E4', background: '#FFFFFF',
                  color: '#78716C', fontSize: 12.5, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F4'}
                onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Limpiar filtros
              </button>
            )}

            <span style={{ fontSize: 12.5, color: '#A8A29E', marginLeft: 'auto' }}>
              {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 10, overflow: 'hidden' }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E7E5E4', background: '#FAFAF9' }}>
                    {['Persona', 'Cargo / Rol', 'Equipo', 'Manager', 'Estado', ''].map(col => (
                      <th key={col} style={{
                        padding: '10px 16px', textAlign: 'left',
                        fontSize: 11, fontWeight: 600, color: '#78716C',
                        letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '56px 16px', textAlign: 'center' }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, background: '#F5F5F4',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#0C0A09' }}>
                          {search || filterRole || filterTeam || filterStatus ? 'Sin resultados' : 'No hay personas registradas'}
                        </p>
                        <p style={{ margin: 0, fontSize: 13, color: '#A8A29E' }}>
                          {search || filterRole || filterTeam || filterStatus ? 'Probá con otros filtros.' : 'Creá la primera persona para empezar.'}
                        </p>
                      </td>
                    </tr>
                  ) : filtered.map((person, idx) => (
                    <motion.tr
                      key={person.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 + idx * 0.025 }}
                      style={{ borderBottom: '1px solid #F5F5F4', cursor: 'pointer' }}
                      onClick={() => openEdit(person)}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Persona */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={person.full_name} size={32} />
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 500, color: '#0C0A09', lineHeight: 1.3 }}>
                              {person.full_name || '—'}
                            </div>
                            <div style={{ fontSize: 11.5, color: '#A8A29E', marginTop: 1 }}>
                              {person.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Cargo / Rol */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 13, color: '#0C0A09', marginBottom: 3 }}>
                          {person.job_title || <span style={{ color: '#D6D3D1' }}>Sin cargo</span>}
                        </div>
                        <RoleBadge role={person.role} />
                      </td>
                      {/* Equipo */}
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#78716C', whiteSpace: 'nowrap' }}>
                        {getTeamName(person.team_id)}
                      </td>
                      {/* Manager */}
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#78716C', whiteSpace: 'nowrap' }}>
                        {getManagerName(person.manager_id)}
                      </td>
                      {/* Estado */}
                      <td style={{ padding: '12px 16px' }}>
                        <StatusDot active={person.is_active !== false} />
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => openEdit(person)}
                            style={{
                              height: 28, padding: '0 10px', borderRadius: 6,
                              border: '1px solid #E7E5E4', background: '#FFFFFF',
                              color: '#0C0A09', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F4'}
                            onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleActive(person)}
                            title={person.is_active !== false ? 'Desactivar' : 'Activar'}
                            style={{
                              width: 28, height: 28, borderRadius: 6,
                              border: '1px solid #E7E5E4', background: '#FFFFFF',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', color: '#78716C',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F4'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                          >
                            {person.is_active !== false ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide-over panels */}
      <AnimatePresence>
        {/* New person */}
        {showNew && (
          <SlideOver
            key="new"
            title="Nueva persona"
            subtitle="Completá los datos para crear un nuevo perfil"
            onClose={closeNew}
            onSave={handleCreate}
            saving={saving}
            saveLabel="Crear persona"
            error={error}
          >
            <Field label="Nombre completo *">
              <TextInput value={newForm.full_name} onChange={v => setNewForm(f => ({ ...f, full_name: v }))} placeholder="Nombre completo" />
            </Field>
            <Field label="Email *" note="El empleado debe registrarse con este email desde el login.">
              <TextInput type="email" value={newForm.email} onChange={v => setNewForm(f => ({ ...f, email: v }))} placeholder="email@empresa.com" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Cargo">
                <TextInput value={newForm.job_title} onChange={v => setNewForm(f => ({ ...f, job_title: v }))} placeholder="Ej. Diseñador Senior" />
              </Field>
              <Field label="Departamento">
                <TextInput value={newForm.department} onChange={v => setNewForm(f => ({ ...f, department: v }))} placeholder="Ej. Diseño" />
              </Field>
            </div>
            <Field label="Rol">
              <SelectInput
                value={newForm.role}
                onChange={v => setNewForm(f => ({ ...f, role: v }))}
                options={ROLE_OPTIONS}
              />
            </Field>
            <Field label="Manager">
              <SelectInput
                value={newForm.manager_id}
                onChange={v => setNewForm(f => ({ ...f, manager_id: v }))}
                options={[{ value: '', label: 'Sin manager' }, ...people.map(p => ({ value: p.id, label: p.full_name || p.email || p.id }))]}
              />
            </Field>
            <Field label="Equipo">
              <SelectInput
                value={newForm.team_id}
                onChange={v => setNewForm(f => ({ ...f, team_id: v }))}
                options={teamOptions}
              />
            </Field>
            <Field label="Fecha de incorporación">
              <TextInput type="date" value={newForm.hire_date} onChange={v => setNewForm(f => ({ ...f, hire_date: v }))} />
            </Field>
          </SlideOver>
        )}

        {/* Edit person */}
        {editingPerson && (
          <SlideOver
            key="edit"
            title={editingPerson.full_name || 'Editar persona'}
            subtitle={editingPerson.email}
            onClose={closeEdit}
            onSave={handleSaveEdit}
            saving={saving}
            saveLabel="Guardar cambios"
            error={error}
          >
            <Field label="Nombre completo *">
              <TextInput value={editForm.full_name} onChange={v => setEditForm(f => ({ ...f, full_name: v }))} placeholder="Nombre completo" />
            </Field>
            <Field label="Email (solo lectura)">
              <TextInput value={editingPerson.email} onChange={() => {}} readOnly />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Cargo">
                <TextInput value={editForm.job_title} onChange={v => setEditForm(f => ({ ...f, job_title: v }))} placeholder="Ej. Diseñador Senior" />
              </Field>
              <Field label="Departamento">
                <TextInput value={editForm.department} onChange={v => setEditForm(f => ({ ...f, department: v }))} placeholder="Ej. Diseño" />
              </Field>
            </div>
            <Field label="Rol">
              <SelectInput
                value={editForm.role}
                onChange={v => setEditForm(f => ({ ...f, role: v }))}
                options={ROLE_OPTIONS}
              />
            </Field>
            <Field label="Manager">
              <SelectInput
                value={editForm.manager_id}
                onChange={v => setEditForm(f => ({ ...f, manager_id: v }))}
                options={managerOptions}
              />
            </Field>
            <Field label="Equipo">
              <SelectInput
                value={editForm.team_id}
                onChange={v => setEditForm(f => ({ ...f, team_id: v }))}
                options={teamOptions}
              />
            </Field>
            <Field label="Fecha de incorporación">
              <TextInput type="date" value={editForm.hire_date} onChange={v => setEditForm(f => ({ ...f, hire_date: v }))} />
            </Field>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', background: '#F5F5F4', borderRadius: 8,
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#0C0A09' }}>Perfil activo</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#78716C' }}>
                  {editForm.is_active ? 'Puede iniciar sesión y participar en ciclos' : 'Cuenta desactivada'}
                </p>
              </div>
              <Toggle checked={editForm.is_active} onChange={v => setEditForm(f => ({ ...f, is_active: v }))} />
            </div>
          </SlideOver>
        )}
      </AnimatePresence>
    </div>
  );
}
