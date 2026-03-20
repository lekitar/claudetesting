'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/app/components/Sidebar';

const QUESTION_TYPES = [
  { value: 'textarea', label: 'Texto abierto', icon: '¶' },
  { value: 'rating', label: 'Valoración 1–5', icon: '★' },
];

const APPLIES_TO = [
  { value: 'all', label: 'Todos' },
  { value: 'self', label: 'Solo autoevaluación' },
  { value: 'manager', label: 'Solo revisión de manager' },
  { value: 'peer', label: 'Solo revisión de par' },
];

function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

export default function TemplateEditorClient({ user, profile, template: initialTemplate, sections: initialSections }) {
  const router = useRouter();
  const supabase = createClient();
  const [template, setTemplate] = useState(initialTemplate);
  const [sections, setSections] = useState(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState(initialSections[0]?.id || null);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  // --- Template name/description ---
  const saveTemplateMeta = useCallback(debounce(async (field, value) => {
    setSaving(true);
    await supabase.from('review_templates').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', template.id);
    setSaving(false);
  }, 800), [template.id]);

  const updateTemplateMeta = (field, value) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
    saveTemplateMeta(field, value);
  };

  // --- Sections ---
  const addSection = async () => {
    const maxOrder = sections.reduce((m, s) => Math.max(m, s.order_index), -1);
    const { data } = await supabase
      .from('template_sections')
      .insert({ template_id: template.id, title: 'Nueva sección', description: '', applies_to: 'all', order_index: maxOrder + 1 })
      .select('*, template_questions(*)').single();
    if (data) {
      setSections(prev => [...prev, { ...data, template_questions: [] }]);
      setSelectedSectionId(data.id);
      showToast('Sección agregada');
    }
  };

  const saveSectionMeta = useCallback(debounce(async (sectionId, field, value) => {
    await supabase.from('template_sections').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', sectionId);
  }, 800), []);

  const updateSection = (sectionId, field, value) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, [field]: value } : s));
    saveSectionMeta(sectionId, field, value);
  };

  const deleteSection = async (sectionId) => {
    if (!confirm('¿Eliminar esta sección y todas sus preguntas?')) return;
    await supabase.from('template_sections').delete().eq('id', sectionId);
    setSections(prev => {
      const remaining = prev.filter(s => s.id !== sectionId);
      setSelectedSectionId(remaining[0]?.id || null);
      return remaining;
    });
    showToast('Sección eliminada');
  };

  const moveSectionUp = async (index) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    const updates = newSections.map((s, i) => ({ id: s.id, order_index: i }));
    setSections(newSections.map((s, i) => ({ ...s, order_index: i })));
    for (const u of updates) {
      await supabase.from('template_sections').update({ order_index: u.order_index }).eq('id', u.id);
    }
  };

  const moveSectionDown = async (index) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    const updates = newSections.map((s, i) => ({ id: s.id, order_index: i }));
    setSections(newSections.map((s, i) => ({ ...s, order_index: i })));
    for (const u of updates) {
      await supabase.from('template_sections').update({ order_index: u.order_index }).eq('id', u.id);
    }
  };

  // --- Questions ---
  const addQuestion = async () => {
    if (!selectedSectionId) return;
    const currentQs = selectedSection?.template_questions || [];
    const maxOrder = currentQs.reduce((m, q) => Math.max(m, q.order_index), -1);
    const { data } = await supabase
      .from('template_questions')
      .insert({ section_id: selectedSectionId, type: 'textarea', label: 'Nueva pregunta', hint: '', placeholder: '', required: true, is_private: false, order_index: maxOrder + 1 })
      .select().single();
    if (data) {
      setSections(prev => prev.map(s => s.id === selectedSectionId
        ? { ...s, template_questions: [...s.template_questions, data] }
        : s
      ));
      setExpandedQuestionId(data.id);
      showToast('Pregunta agregada');
    }
  };

  const saveQuestionMeta = useCallback(debounce(async (questionId, updates) => {
    await supabase.from('template_questions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', questionId);
  }, 800), []);

  const updateQuestion = (sectionId, questionId, field, value) => {
    setSections(prev => prev.map(s => s.id === sectionId
      ? { ...s, template_questions: s.template_questions.map(q => q.id === questionId ? { ...q, [field]: value } : q) }
      : s
    ));
    saveQuestionMeta(questionId, { [field]: value });
  };

  const deleteQuestion = async (sectionId, questionId) => {
    await supabase.from('template_questions').delete().eq('id', questionId);
    setSections(prev => prev.map(s => s.id === sectionId
      ? { ...s, template_questions: s.template_questions.filter(q => q.id !== questionId) }
      : s
    ));
    if (expandedQuestionId === questionId) setExpandedQuestionId(null);
    showToast('Pregunta eliminada');
  };

  const moveQuestionUp = async (sectionId, index) => {
    if (index === 0) return;
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...s.template_questions];
      [qs[index - 1], qs[index]] = [qs[index], qs[index - 1]];
      qs.forEach(async (q, i) => await supabase.from('template_questions').update({ order_index: i }).eq('id', q.id));
      return { ...s, template_questions: qs.map((q, i) => ({ ...q, order_index: i })) };
    }));
  };

  const moveQuestionDown = async (sectionId, index) => {
    const qs = selectedSection?.template_questions || [];
    if (index >= qs.length - 1) return;
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const newQs = [...s.template_questions];
      [newQs[index], newQs[index + 1]] = [newQs[index + 1], newQs[index]];
      newQs.forEach(async (q, i) => await supabase.from('template_questions').update({ order_index: i }).eq('id', q.id));
      return { ...s, template_questions: newQs.map((q, i) => ({ ...q, order_index: i })) };
    }));
  };

  const totalQuestions = sections.reduce((s, sec) => s + (sec.template_questions?.length || 0), 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F4', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: 56,
          background: '#FFFFFF', borderBottom: '1px solid #E7E5E4', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => router.push('/admin/templates')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0C0A09'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A8A29E'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Plantillas
            </button>
            <span style={{ color: '#E7E5E4' }}>|</span>
            <input
              value={template.name}
              onChange={e => updateTemplateMeta('name', e.target.value)}
              style={{ fontSize: 14, fontWeight: 600, color: '#0C0A09', border: 'none', outline: 'none', background: 'transparent', width: 320 }}
              placeholder="Nombre de la plantilla"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: saving ? '#F59E0B' : '#A8A29E' }}>
              {saving ? 'Guardando...' : `${sections.length} secciones · ${totalQuestions} preguntas`}
            </span>
            <span style={{
              fontSize: 11.5, fontWeight: 500, padding: '2px 9px', borderRadius: 20,
              background: template.is_default ? '#F0FDF4' : '#F5F5F4',
              color: template.is_default ? '#15803D' : '#78716C',
            }}>
              {template.is_default ? 'Por defecto' : 'Personalizada'}
            </span>
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 100,
                padding: '8px 18px', borderRadius: 8,
                background: toast.type === 'error' ? '#FEF2F2' : '#F0FDF4',
                border: `1px solid ${toast.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
                color: toast.type === 'error' ? '#DC2626' : '#15803D',
                fontSize: 13, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            >{toast.msg}</motion.div>
          )}
        </AnimatePresence>

        {/* Main two-column layout */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left: sections */}
          <div style={{
            width: 260, flexShrink: 0, borderRight: '1px solid #E7E5E4', background: '#FAFAF9',
            display: 'flex', flexDirection: 'column', overflow: 'auto',
          }}>
            <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #F0EFED' }}>
              <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Secciones
              </p>
            </div>

            <div style={{ flex: 1, padding: '8px', overflow: 'auto' }}>
              {sections.map((s, i) => {
                const isActive = selectedSectionId === s.id;
                return (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedSectionId(s.id)}
                    style={{
                      padding: '10px 12px', borderRadius: 8, marginBottom: 2, cursor: 'pointer',
                      background: isActive ? '#FFFFFF' : 'transparent',
                      border: isActive ? '1px solid #E7E5E4' : '1px solid transparent',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#F0EFED'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#0C0A09' : '#44403C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.title}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#A8A29E' }}>
                          {s.template_questions?.length || 0} pregunta{s.template_questions?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {isActive && (
                        <div style={{ display: 'flex', gap: 2, marginLeft: 6 }}>
                          <button onClick={(e) => { e.stopPropagation(); moveSectionUp(i); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', padding: '2px 3px', borderRadius: 4, fontSize: 10 }}
                            title="Subir">▲</button>
                          <button onClick={(e) => { e.stopPropagation(); moveSectionDown(i); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', padding: '2px 3px', borderRadius: 4, fontSize: 10 }}
                            title="Bajar">▼</button>
                          <button onClick={(e) => { e.stopPropagation(); deleteSection(s.id); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', padding: '2px 3px', borderRadius: 4 }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#A8A29E'}
                            title="Eliminar">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div style={{ padding: '12px 8px', borderTop: '1px solid #F0EFED' }}>
              <button onClick={addSection}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1.5px dashed #D6D3D1', background: 'transparent',
                  fontSize: 13, color: '#78716C', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0C0A09'; e.currentTarget.style.color = '#0C0A09'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D6D3D1'; e.currentTarget.style.color = '#78716C'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Agregar sección
              </button>
            </div>
          </div>

          {/* Right: section editor */}
          <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px', maxWidth: 760 }}>
            {!selectedSection ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 14, color: '#A8A29E' }}>Seleccioná una sección para editarla</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={selectedSection.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Section meta */}
                  <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #E7E5E4' }}>
                    <input
                      value={selectedSection.title}
                      onChange={e => updateSection(selectedSection.id, 'title', e.target.value)}
                      style={{ display: 'block', width: '100%', fontSize: 22, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.02em', border: 'none', outline: 'none', background: 'transparent', marginBottom: 8 }}
                      placeholder="Título de la sección"
                    />
                    <textarea
                      value={selectedSection.description || ''}
                      onChange={e => updateSection(selectedSection.id, 'description', e.target.value)}
                      rows={2}
                      placeholder="Descripción o instrucciones para esta sección (opcional)"
                      style={{ display: 'block', width: '100%', fontSize: 14, color: '#78716C', border: 'none', outline: 'none', background: 'transparent', resize: 'none', lineHeight: 1.6 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                      <label style={{ fontSize: 12.5, color: '#A8A29E' }}>Aplica a:</label>
                      <select
                        value={selectedSection.applies_to}
                        onChange={e => updateSection(selectedSection.id, 'applies_to', e.target.value)}
                        style={{ fontSize: 12.5, color: '#0C0A09', border: '1px solid #E7E5E4', borderRadius: 6, padding: '4px 10px', background: '#FFFFFF', outline: 'none', cursor: 'pointer' }}
                      >
                        {APPLIES_TO.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Questions */}
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Preguntas
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedSection.template_questions.map((q, qi) => {
                        const isExpanded = expandedQuestionId === q.id;
                        return (
                          <motion.div key={q.id}
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: qi * 0.04 }}
                            style={{
                              border: `1px solid ${isExpanded ? '#0C0A09' : '#E7E5E4'}`,
                              borderRadius: 10, background: '#FFFFFF', overflow: 'hidden',
                            }}
                          >
                            {/* Question header */}
                            <div
                              onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer' }}
                            >
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#A8A29E', background: '#F5F5F4', padding: '2px 7px', borderRadius: 5 }}>
                                {QUESTION_TYPES.find(t => t.value === q.type)?.label || q.type}
                              </span>
                              <span style={{ flex: 1, fontSize: 13.5, color: '#0C0A09', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {q.label || 'Sin título'}
                              </span>
                              <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                                {q.is_private && <span style={{ fontSize: 10.5, color: '#92400E', background: '#FFF7ED', padding: '2px 6px', borderRadius: 4 }}>Privado</span>}
                                {!q.required && <span style={{ fontSize: 10.5, color: '#78716C', background: '#F5F5F4', padding: '2px 6px', borderRadius: 4 }}>Opcional</span>}
                                <button onClick={(e) => { e.stopPropagation(); moveQuestionUp(selectedSection.id, qi); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D6D3D1', fontSize: 10 }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#78716C'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#D6D3D1'}
                                >▲</button>
                                <button onClick={(e) => { e.stopPropagation(); moveQuestionDown(selectedSection.id, qi); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D6D3D1', fontSize: 10 }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#78716C'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#D6D3D1'}
                                >▼</button>
                                <button onClick={(e) => { e.stopPropagation(); deleteQuestion(selectedSection.id, q.id); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D6D3D1' }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#D6D3D1'}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                                  </svg>
                                </button>
                                <span style={{ color: '#D6D3D1', fontSize: 14 }}>{isExpanded ? '↑' : '↓'}</span>
                              </div>
                            </div>

                            {/* Expanded editor */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F5F5F4', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div style={{ paddingTop: 16 }}>
                                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#78716C', marginBottom: 6 }}>Tipo</label>
                                      <select
                                        value={q.type}
                                        onChange={e => updateQuestion(selectedSection.id, q.id, 'type', e.target.value)}
                                        style={{ border: '1px solid #E7E5E4', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, color: '#0C0A09', background: '#FFFFFF', outline: 'none', cursor: 'pointer', width: '100%' }}
                                      >
                                        {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                      </select>
                                    </div>

                                    <div>
                                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#78716C', marginBottom: 6 }}>
                                        Pregunta <span style={{ color: '#F04438' }}>*</span>
                                      </label>
                                      <input
                                        value={q.label}
                                        onChange={e => updateQuestion(selectedSection.id, q.id, 'label', e.target.value)}
                                        style={{ width: '100%', border: '1px solid #E7E5E4', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, color: '#0C0A09', outline: 'none', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = '#0C0A09'}
                                        onBlur={e => e.target.style.borderColor = '#E7E5E4'}
                                        placeholder="¿Cuál fue el logro más importante del período?"
                                      />
                                    </div>

                                    <div>
                                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#78716C', marginBottom: 6 }}>Descripción / ayuda</label>
                                      <input
                                        value={q.hint || ''}
                                        onChange={e => updateQuestion(selectedSection.id, q.id, 'hint', e.target.value)}
                                        style={{ width: '100%', border: '1px solid #E7E5E4', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, color: '#0C0A09', outline: 'none', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = '#0C0A09'}
                                        onBlur={e => e.target.style.borderColor = '#E7E5E4'}
                                        placeholder="Texto de ayuda que verá el usuario bajo la pregunta"
                                      />
                                    </div>

                                    {q.type === 'textarea' && (
                                      <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#78716C', marginBottom: 6 }}>Placeholder</label>
                                        <input
                                          value={q.placeholder || ''}
                                          onChange={e => updateQuestion(selectedSection.id, q.id, 'placeholder', e.target.value)}
                                          style={{ width: '100%', border: '1px solid #E7E5E4', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, color: '#0C0A09', outline: 'none', boxSizing: 'border-box' }}
                                          onFocus={e => e.target.style.borderColor = '#0C0A09'}
                                          onBlur={e => e.target.style.borderColor = '#E7E5E4'}
                                          placeholder="Ej: Describí con ejemplos concretos..."
                                        />
                                      </div>
                                    )}

                                    <div style={{ display: 'flex', gap: 20 }}>
                                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={q.required} onChange={e => updateQuestion(selectedSection.id, q.id, 'required', e.target.checked)}
                                          style={{ width: 14, height: 14, cursor: 'pointer' }} />
                                        <span style={{ fontSize: 13, color: '#44403C' }}>Obligatoria</span>
                                      </label>
                                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={q.is_private} onChange={e => updateQuestion(selectedSection.id, q.id, 'is_private', e.target.checked)}
                                          style={{ width: 14, height: 14, cursor: 'pointer' }} />
                                        <span style={{ fontSize: 13, color: '#44403C' }}>Solo para calibración (privada)</span>
                                      </label>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <button onClick={addQuestion}
                    style={{
                      width: '100%', padding: '10px', borderRadius: 10,
                      border: '1.5px dashed #D6D3D1', background: 'transparent',
                      fontSize: 13.5, color: '#78716C', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0C0A09'; e.currentTarget.style.color = '#0C0A09'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D6D3D1'; e.currentTarget.style.color = '#78716C'; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Agregar pregunta
                  </button>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
