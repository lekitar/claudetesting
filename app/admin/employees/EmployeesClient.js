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

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ name }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: '#0C0A09',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        background: active ? '#DCFCE7' : '#F5F5F4',
        color: active ? '#15803D' : '#78716C',
        border: `1px solid ${active ? '#BBF7D0' : '#E7E5E4'}`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: active ? '#22C55E' : '#A8A29E',
        }}
      />
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        border: 'none',
        cursor: 'pointer',
        background: checked ? '#0C0A09' : '#E7E5E4',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
      aria-checked={checked}
      role="switch"
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#FFFFFF',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}
      />
    </button>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, readOnly, note }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#0C0A09' }}>{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          height: 36,
          padding: '0 10px',
          borderRadius: 7,
          border: '1px solid #E7E5E4',
          background: readOnly ? '#F5F5F4' : '#FFFFFF',
          color: '#0C0A09',
          fontSize: 13,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          cursor: readOnly ? 'default' : 'text',
        }}
      />
      {note && (
        <span style={{ fontSize: 11, color: '#78716C', lineHeight: 1.4 }}>{note}</span>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#0C0A09' }}>{label}</label>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{
          height: 36,
          padding: '0 10px',
          borderRadius: 7,
          border: '1px solid #E7E5E4',
          background: '#FFFFFF',
          color: value ? '#0C0A09' : '#A8A29E',
          fontSize: 13,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          paddingRight: 32,
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SlideOverPanel({ title, onClose, children, onSubmit, submitLabel, loading, error }) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 40,
        }}
      />

      {/* Panel */}
      <motion.div
        key="panel"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 440,
          maxWidth: '100vw',
          background: '#FFFFFF',
          borderLeft: '1px solid #E7E5E4',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 18px',
            borderBottom: '1px solid #E7E5E4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: '#FFFFFF',
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0A09' }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: '1px solid #E7E5E4',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#78716C',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
          {error && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 7,
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E7E5E4',
            display: 'flex',
            gap: 8,
            position: 'sticky',
            bottom: 0,
            background: '#FFFFFF',
          }}
        >
          <button
            onClick={onSubmit}
            disabled={loading}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 7,
              border: 'none',
              background: loading ? '#A8A29E' : '#0C0A09',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#292524'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0C0A09'; }}
          >
            {loading ? 'Guardando...' : submitLabel}
          </button>
          <button
            onClick={onClose}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 7,
              border: '1px solid #E7E5E4',
              background: '#FFFFFF',
              color: '#0C0A09',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
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

export default function EmployeesClient({ user, profile, employees: initialEmployees, teams, allProfiles }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showNewPanel, setShowNewPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({});

  // New employee form state
  const [newForm, setNewForm] = useState({
    full_name: '',
    email: '',
    job_title: '',
    department: '',
    role: 'employee',
    manager_id: '',
    team_id: '',
    hire_date: '',
  });

  const supabase = createClient();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(
      e =>
        (e.full_name || '').toLowerCase().includes(q) ||
        (e.job_title || '').toLowerCase().includes(q) ||
        (e.department || '').toLowerCase().includes(q)
    );
  }, [employees, search]);

  function getManagerName(managerId) {
    if (!managerId) return '—';
    const m = employees.find(e => e.id === managerId);
    return m ? m.full_name || '—' : '—';
  }

  function getTeamName(teamId) {
    if (!teamId) return '—';
    const t = teams.find(t => t.id === teamId);
    return t ? t.name : '—';
  }

  function openEdit(emp) {
    setEditForm({
      full_name: emp.full_name || '',
      job_title: emp.job_title || '',
      department: emp.department || '',
      role: emp.role || 'employee',
      manager_id: emp.manager_id || '',
      team_id: emp.team_id || '',
      hire_date: emp.hire_date || '',
      is_active: emp.is_active !== false,
    });
    setEditingEmployee(emp);
    setError('');
  }

  function closeEdit() {
    setEditingEmployee(null);
    setError('');
  }

  function closeNew() {
    setShowNewPanel(false);
    setNewForm({
      full_name: '',
      email: '',
      job_title: '',
      department: '',
      role: 'employee',
      manager_id: '',
      team_id: '',
      hire_date: '',
    });
    setError('');
  }

  async function handleSaveEdit() {
    if (!editingEmployee) return;
    setLoading(true);
    setError('');
    const payload = {
      full_name: editForm.full_name || null,
      job_title: editForm.job_title || null,
      department: editForm.department || null,
      role: editForm.role || 'employee',
      manager_id: editForm.manager_id || null,
      team_id: editForm.team_id || null,
      hire_date: editForm.hire_date || null,
      is_active: editForm.is_active,
    };
    const { error: updateError } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', editingEmployee.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setEmployees(prev =>
      prev.map(e => (e.id === editingEmployee.id ? { ...e, ...payload } : e))
    );
    setLoading(false);
    closeEdit();
  }

  async function handleCreateEmployee() {
    if (!newForm.full_name.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }
    if (!newForm.email.trim()) {
      setError('El email es obligatorio.');
      return;
    }
    setLoading(true);
    setError('');

    const newId = crypto.randomUUID();
    const payload = {
      id: newId,
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

    const { error: insertError } = await supabase.from('profiles').insert(payload);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setEmployees(prev => [...prev, payload].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')));
    setLoading(false);
    closeNew();
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F5F5F4', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar user={user} profile={profile} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 48px' }}>
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}
          >
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0C0A09', margin: 0, lineHeight: 1.2 }}>
                Empleados
              </h1>
              <p style={{ fontSize: 13, color: '#78716C', marginTop: 4, margin: '4px 0 0' }}>
                {employees.length} {employees.length === 1 ? 'empleado' : 'empleados'} en total
              </p>
            </div>
            <button
              onClick={() => { setShowNewPanel(true); setError(''); }}
              style={{
                height: 36,
                padding: '0 16px',
                borderRadius: 7,
                border: 'none',
                background: '#0C0A09',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#292524'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0C0A09'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo empleado
            </button>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={{ marginBottom: 16, position: 'relative', maxWidth: 360 }}
          >
            <span
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#A8A29E',
                pointerEvents: 'none',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, cargo o departamento..."
              style={{
                height: 36,
                width: '100%',
                paddingLeft: 32,
                paddingRight: 12,
                borderRadius: 7,
                border: '1px solid #E7E5E4',
                background: '#FFFFFF',
                color: '#0C0A09',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </motion.div>

          {/* Table card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E7E5E4',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E7E5E4' }}>
                    {['Empleado', 'Cargo', 'Departamento', 'Manager', 'Equipo', 'Estado', 'Acciones'].map(col => (
                      <th
                        key={col}
                        style={{
                          padding: '10px 16px',
                          textAlign: 'left',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#78716C',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          background: '#FAFAF9',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding: '40px 16px',
                          textAlign: 'center',
                          color: '#A8A29E',
                          fontSize: 13,
                        }}
                      >
                        {search ? 'No hay empleados que coincidan con la búsqueda.' : 'No hay empleados registrados.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((emp, idx) => (
                      <motion.tr
                        key={emp.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.12 + idx * 0.03 }}
                        style={{
                          borderBottom: '1px solid #F5F5F4',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FAFAF9'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Avatar + Name */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={emp.full_name} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: '#0C0A09', lineHeight: 1.3 }}>
                                {emp.full_name || '—'}
                              </div>
                              <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 1 }}>
                                {emp.email || '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cargo */}
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#0C0A09', whiteSpace: 'nowrap' }}>
                          <div>{emp.job_title || '—'}</div>
                          {emp.role && (
                            <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 1 }}>
                              {ROLE_LABELS[emp.role] || emp.role}
                            </div>
                          )}
                        </td>

                        {/* Departamento */}
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#0C0A09' }}>
                          {emp.department || '—'}
                        </td>

                        {/* Manager */}
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#78716C', whiteSpace: 'nowrap' }}>
                          {getManagerName(emp.manager_id)}
                        </td>

                        {/* Equipo */}
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#78716C', whiteSpace: 'nowrap' }}>
                          {getTeamName(emp.team_id)}
                        </td>

                        {/* Estado */}
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge active={emp.is_active !== false} />
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            onClick={() => openEdit(emp)}
                            style={{
                              height: 30,
                              padding: '0 12px',
                              borderRadius: 6,
                              border: '1px solid #E7E5E4',
                              background: '#FFFFFF',
                              color: '#0C0A09',
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'background 0.15s, border-color 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F4'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                          >
                            Editar
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide-over panels */}
      <AnimatePresence>
        {/* Edit Panel */}
        {editingEmployee && (
          <SlideOverPanel
            key="edit-panel"
            title={`Editar: ${editingEmployee.full_name || 'Empleado'}`}
            onClose={closeEdit}
            onSubmit={handleSaveEdit}
            submitLabel="Guardar cambios"
            loading={loading}
            error={error}
          >
            <InputField
              label="Nombre completo"
              value={editForm.full_name}
              onChange={v => setEditForm(f => ({ ...f, full_name: v }))}
              placeholder="Nombre completo"
            />
            <InputField
              label="Cargo"
              value={editForm.job_title}
              onChange={v => setEditForm(f => ({ ...f, job_title: v }))}
              placeholder="Ej. Diseñador Senior"
            />
            <InputField
              label="Departamento"
              value={editForm.department}
              onChange={v => setEditForm(f => ({ ...f, department: v }))}
              placeholder="Ej. Diseño"
            />
            <SelectField
              label="Rol"
              value={editForm.role}
              onChange={v => setEditForm(f => ({ ...f, role: v }))}
              options={ROLE_OPTIONS}
              placeholder="Seleccionar rol"
            />
            <SelectField
              label="Manager"
              value={editForm.manager_id}
              onChange={v => setEditForm(f => ({ ...f, manager_id: v }))}
              options={[
                { value: '', label: 'Sin manager' },
                ...employees
                  .filter(e => e.id !== editingEmployee.id)
                  .map(e => ({ value: e.id, label: e.full_name || e.email || e.id })),
              ]}
              placeholder="Seleccionar manager"
            />
            <SelectField
              label="Equipo"
              value={editForm.team_id}
              onChange={v => setEditForm(f => ({ ...f, team_id: v }))}
              options={[
                { value: '', label: 'Sin equipo' },
                ...teams.map(t => ({ value: t.id, label: t.name })),
              ]}
              placeholder="Seleccionar equipo"
            />
            <InputField
              label="Fecha de incorporación"
              type="date"
              value={editForm.hire_date}
              onChange={v => setEditForm(f => ({ ...f, hire_date: v }))}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#0C0A09' }}>Empleado activo</span>
              <Toggle
                checked={editForm.is_active}
                onChange={v => setEditForm(f => ({ ...f, is_active: v }))}
              />
            </div>
          </SlideOverPanel>
        )}

        {/* New Employee Panel */}
        {showNewPanel && (
          <SlideOverPanel
            key="new-panel"
            title="Nuevo empleado"
            onClose={closeNew}
            onSubmit={handleCreateEmployee}
            submitLabel="Crear empleado"
            loading={loading}
            error={error}
          >
            <InputField
              label="Nombre completo *"
              value={newForm.full_name}
              onChange={v => setNewForm(f => ({ ...f, full_name: v }))}
              placeholder="Nombre completo"
            />
            <InputField
              label="Email *"
              type="email"
              value={newForm.email}
              onChange={v => setNewForm(f => ({ ...f, email: v }))}
              placeholder="email@empresa.com"
              note="El empleado necesita crear su cuenta con este email en el login."
            />
            <InputField
              label="Cargo"
              value={newForm.job_title}
              onChange={v => setNewForm(f => ({ ...f, job_title: v }))}
              placeholder="Ej. Diseñador Senior"
            />
            <InputField
              label="Departamento"
              value={newForm.department}
              onChange={v => setNewForm(f => ({ ...f, department: v }))}
              placeholder="Ej. Diseño"
            />
            <SelectField
              label="Rol"
              value={newForm.role}
              onChange={v => setNewForm(f => ({ ...f, role: v }))}
              options={ROLE_OPTIONS}
              placeholder="Seleccionar rol"
            />
            <SelectField
              label="Manager"
              value={newForm.manager_id}
              onChange={v => setNewForm(f => ({ ...f, manager_id: v }))}
              options={[
                { value: '', label: 'Sin manager' },
                ...employees.map(e => ({ value: e.id, label: e.full_name || e.email || e.id })),
              ]}
              placeholder="Seleccionar manager"
            />
            <SelectField
              label="Equipo"
              value={newForm.team_id}
              onChange={v => setNewForm(f => ({ ...f, team_id: v }))}
              options={[
                { value: '', label: 'Sin equipo' },
                ...teams.map(t => ({ value: t.id, label: t.name })),
              ]}
              placeholder="Seleccionar equipo"
            />
            <InputField
              label="Fecha de incorporación"
              type="date"
              value={newForm.hire_date}
              onChange={v => setNewForm(f => ({ ...f, hire_date: v }))}
            />
          </SlideOverPanel>
        )}
      </AnimatePresence>
    </div>
  );
}
