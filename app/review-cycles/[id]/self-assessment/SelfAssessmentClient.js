'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const RATING_LABELS = ['Necesita desarrollo', 'En desarrollo', 'Cumple expectativas', 'Supera expectativas', 'Excepcional'];

function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function RatingScale({ value, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const sel = value === n;
          return (
            <motion.button key={n} whileTap={{ scale: 0.92 }} onClick={() => onChange(n)}
              style={{
                width: 46, height: 46, borderRadius: 10,
                border: sel ? '2px solid #0C0A09' : '1.5px solid #E7E5E4',
                background: sel ? '#0C0A09' : '#FFFFFF',
                color: sel ? '#FFFFFF' : '#78716C',
                fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { if (!sel) { e.currentTarget.style.borderColor = '#0C0A09'; e.currentTarget.style.color = '#0C0A09'; } }}
              onMouseLeave={(e) => { if (!sel) { e.currentTarget.style.borderColor = '#E7E5E4'; e.currentTarget.style.color = '#78716C'; } }}
            >{n}</motion.button>
          );
        })}
      </div>
      <div style={{ display: 'flex', marginTop: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} style={{ width: 54, fontSize: 10.5, color: value === n ? '#0C0A09' : '#D6D3D1', fontWeight: value === n ? 500 : 400, lineHeight: 1.3, paddingRight: 8 }}>
            {(n === 1 || n === 5 || value === n) ? RATING_LABELS[n - 1] : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

function isSectionComplete(section, answers) {
  return section.template_questions
    .filter(q => q.required && !q.is_private)
    .every(q => {
      const a = answers[q.id];
      if (q.type === 'textarea') return a?.answer_text && a.answer_text.trim().length > 5;
      if (q.type === 'rating') return a?.answer_rating && a.answer_rating > 0;
      return false;
    });
}

export default function SelfAssessmentClient({ user, cycle, review, sections, answersMap: initialAnswers }) {
  const router = useRouter();
  const supabase = createClient();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved
  const [submitting, setSubmitting] = useState(false);

  const section = sections[currentSection];
  const completedCount = sections.filter(s => isSectionComplete(s, answers)).length;
  const pct = sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0;
  const allComplete = sections.every(s => isSectionComplete(s, answers));

  const saveAnswer = useCallback(debounce(async (questionId, type, value) => {
    setSaveState('saving');
    const payload = {
      review_id: review.id,
      question_id: questionId,
      answer_text: type === 'textarea' ? value : null,
      answer_rating: type === 'rating' ? value : null,
    };
    await supabase.from('review_answers').upsert(payload, { onConflict: 'review_id,question_id' });
    // Update review status to in_progress
    if (review.status === 'pending') {
      await supabase.from('reviews').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', review.id);
    }
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 2000);
  }, 800), [review.id]);

  const handleChange = (questionId, type, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        answer_text: type === 'textarea' ? value : prev[questionId]?.answer_text,
        answer_rating: type === 'rating' ? value : prev[questionId]?.answer_rating,
      },
    }));
    saveAnswer(questionId, type, value);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await supabase.from('reviews').update({
      status: 'completed', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', review.id);
    router.push(`/review-cycles/${cycle.id}`);
  };

  if (sections.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: '#0C0A09', marginBottom: 8 }}>Este ciclo no tiene plantilla de preguntas configurada</p>
          <button onClick={() => router.push(`/review-cycles/${cycle.id}`)}
            style={{ fontSize: 13.5, color: '#4F46E5', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Volver al ciclo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 56, background: '#FFFFFF', borderBottom: '1px solid #F5F5F4',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.push(`/review-cycles/${cycle.id}`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, padding: 0 }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0C0A09'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#A8A29E'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Volver
          </button>
          <span style={{ color: '#E7E5E4' }}>|</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0C0A09' }}>Autoevaluación</span>
          <span style={{ fontSize: 13, color: '#A8A29E' }}>{cycle.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 100, height: 4, background: '#F5F5F4', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', background: '#0C0A09', borderRadius: 4 }}
              />
            </div>
            <span style={{ fontSize: 12, color: '#A8A29E' }}>{completedCount}/{sections.length}</span>
          </div>
          <span style={{ fontSize: 12, color: saveState === 'saving' ? '#F59E0B' : saveState === 'saved' ? '#15803D' : '#D6D3D1' }}>
            {saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? '✓ Guardado' : 'Auto-guardado'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>

        {/* Left nav */}
        <div style={{ width: 240, flexShrink: 0, paddingTop: 40, paddingRight: 40 }}>
          <div style={{ position: 'sticky', top: 76 }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sections.map((s, i) => {
                const isActive = currentSection === i;
                const isDone = isSectionComplete(s, answers);
                return (
                  <motion.button key={s.id}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setCurrentSection(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                      borderRadius: 8, border: 'none',
                      background: isActive ? '#F5F5F4' : 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#FAFAF9'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone ? '#0C0A09' : 'transparent',
                      border: isDone ? 'none' : isActive ? '1.5px solid #0C0A09' : '1.5px solid #D6D3D1',
                    }}>
                      {isDone
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? '#0C0A09' : '#A8A29E' }}>{i + 1}</span>
                      }
                    </div>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#0C0A09' : '#78716C', lineHeight: 1.3 }}>
                      {s.title}
                    </span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, paddingTop: 40, paddingBottom: 80, maxWidth: 660 }}>
          <AnimatePresence mode="wait">
            <motion.div key={currentSection}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Section header */}
              <div style={{ marginBottom: 36 }}>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 500, color: '#A8A29E', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {String(currentSection + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
                </p>
                <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.04em', lineHeight: 1.2 }}>
                  {section.title}
                </h1>
                {section.description && (
                  <p style={{ margin: 0, fontSize: 15, color: '#78716C', lineHeight: 1.65 }}>{section.description}</p>
                )}
              </div>

              {/* Questions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                {section.template_questions.map((q, qi) => {
                  const answer = answers[q.id];
                  return (
                    <motion.div key={q.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: qi * 0.06 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <label style={{ fontSize: 15, fontWeight: 600, color: '#0C0A09', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                          {q.label}
                        </label>
                        {!q.required && <span style={{ fontSize: 11.5, color: '#A8A29E', fontWeight: 400 }}>opcional</span>}
                        {q.is_private && <span style={{ fontSize: 11, color: '#92400E', background: '#FFF7ED', padding: '1px 7px', borderRadius: 5, fontWeight: 500 }}>Privado</span>}
                      </div>
                      {q.hint && <p style={{ margin: '0 0 14px', fontSize: 13, color: '#A8A29E', lineHeight: 1.5 }}>{q.hint}</p>}

                      {q.type === 'textarea' && (
                        <textarea
                          value={answer?.answer_text || ''}
                          onChange={e => handleChange(q.id, 'textarea', e.target.value)}
                          placeholder={q.placeholder || ''}
                          rows={5}
                          style={{
                            width: '100%', padding: '14px 16px', borderRadius: 10,
                            border: `1.5px solid ${q.is_private ? '#FEF3C7' : '#E7E5E4'}`,
                            background: q.is_private ? '#FFFBEB' : '#FFFFFF',
                            fontSize: 14, color: '#0C0A09', resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box',
                          }}
                          onFocus={e => e.target.style.borderColor = q.is_private ? '#F59E0B' : '#0C0A09'}
                          onBlur={e => e.target.style.borderColor = q.is_private ? '#FEF3C7' : '#E7E5E4'}
                        />
                      )}
                      {q.type === 'rating' && (
                        <RatingScale
                          value={answer?.answer_rating || 0}
                          onChange={val => handleChange(q.id, 'rating', val)}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 52, paddingTop: 28, borderTop: '1px solid #F5F5F4' }}>
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                  disabled={currentSection === 0}
                  style={{
                    padding: '10px 20px', borderRadius: 8, border: '1.5px solid #E7E5E4',
                    background: '#FFFFFF', fontSize: 14, fontWeight: 500,
                    cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
                    color: currentSection === 0 ? '#D6D3D1' : '#0C0A09',
                  }}
                >← Anterior</motion.button>

                {currentSection < sections.length - 1 ? (
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => setCurrentSection(currentSection + 1)}
                    style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#0C0A09', color: '#FFFFFF', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#292524'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#0C0A09'}
                  >Siguiente →</motion.button>
                ) : (
                  <motion.button whileTap={{ scale: allComplete ? 0.97 : 1 }}
                    onClick={handleSubmit} disabled={!allComplete || submitting}
                    style={{
                      padding: '10px 24px', borderRadius: 8, border: 'none',
                      background: allComplete && !submitting ? '#0C0A09' : '#E7E5E4',
                      color: allComplete && !submitting ? '#FFFFFF' : '#A8A29E',
                      fontSize: 14, fontWeight: 500, cursor: allComplete && !submitting ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                    onMouseEnter={(e) => { if (allComplete && !submitting) e.currentTarget.style.background = '#292524'; }}
                    onMouseLeave={(e) => { if (allComplete && !submitting) e.currentTarget.style.background = '#0C0A09'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {submitting ? 'Enviando...' : 'Enviar autoevaluación'}
                  </motion.button>
                )}
              </div>

              {!allComplete && currentSection === sections.length - 1 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', fontSize: 12.5, color: '#A8A29E', marginTop: 12 }}
                >
                  Completá todas las preguntas obligatorias para poder enviar
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
