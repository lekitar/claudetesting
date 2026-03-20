'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SECTIONS = [
  {
    id: 'achievements',
    title: 'Logros y resultados',
    description: 'Reflexioná sobre tus principales contribuciones durante este período.',
    questions: [
      {
        id: 'main_achievements',
        type: 'textarea',
        label: '¿Cuáles fueron tus logros más significativos este período?',
        hint: 'Incluí proyectos completados, métricas alcanzadas y contribuciones concretas al equipo.',
        placeholder: 'Ej: Lideré la migración de la base de datos que redujo el tiempo de respuesta en un 40%...',
      },
      {
        id: 'impact',
        type: 'textarea',
        label: '¿Cuál fue el impacto de tu trabajo en el equipo o la empresa?',
        hint: 'Sé específico con ejemplos y resultados medibles cuando sea posible.',
        placeholder: 'Ej: El nuevo sistema de caché redujo los costos de infraestructura en $2k/mes...',
      },
    ],
  },
  {
    id: 'competencies',
    title: 'Competencias',
    description: 'Evaluá tu desempeño en las áreas clave del rol. Sé honesto — esta autoevaluación es el punto de partida para tu conversación con tu manager.',
    questions: [
      { id: 'communication', type: 'rating', label: 'Comunicación', hint: 'Claridad, escucha activa, comunicación escrita y verbal.' },
      { id: 'collaboration', type: 'rating', label: 'Colaboración', hint: 'Trabajo en equipo, apoyo a colegas, manejo de conflictos.' },
      { id: 'technical', type: 'rating', label: 'Habilidades técnicas', hint: 'Dominio de herramientas, calidad del trabajo, resolución de problemas.' },
      { id: 'initiative', type: 'rating', label: 'Iniciativa e impacto', hint: 'Proactividad, propuesta de mejoras, ownership de resultados.' },
      { id: 'growth', type: 'rating', label: 'Crecimiento y aprendizaje', hint: 'Disposición a aprender, adaptabilidad, nuevas habilidades.' },
    ],
  },
  {
    id: 'goals',
    title: 'Objetivos del período',
    description: 'Revisá el progreso en los objetivos que te propusiste al inicio del ciclo.',
    questions: [
      {
        id: 'goals_reflection',
        type: 'textarea',
        label: '¿Cómo evaluás tu progreso en los objetivos establecidos?',
        hint: 'Mencioná qué lograste, qué quedó pendiente y el contexto de cada caso.',
        placeholder: 'Ej: Cumplí con los objetivos de performance pero no terminé la documentación por...',
      },
      { id: 'goals_rating', type: 'rating', label: 'Cumplimiento general de objetivos', hint: 'Una valoración global de tu desempeño frente a los objetivos acordados.' },
    ],
  },
  {
    id: 'development',
    title: 'Crecimiento y desarrollo',
    description: '¿Hacia dónde querés crecer? Esta sección ayuda a diseñar tu plan de desarrollo.',
    questions: [
      {
        id: 'strengths',
        type: 'textarea',
        label: '¿Cuáles son tus principales fortalezas?',
        hint: 'Áreas donde destacás y que podrías seguir profundizando.',
        placeholder: 'Ej: Tengo facilidad para comunicar conceptos técnicos a audiencias no técnicas...',
      },
      {
        id: 'areas_improve',
        type: 'textarea',
        label: '¿En qué áreas querés crecer en el próximo período?',
        hint: 'Sé específico. Esta información es la base de tu plan de desarrollo.',
        placeholder: 'Ej: Quiero mejorar mi capacidad de priorización y gestión del tiempo en proyectos complejos...',
      },
      {
        id: 'support',
        type: 'textarea',
        label: '¿Qué apoyo o recursos necesitás?',
        hint: 'Capacitaciones, mentoría, herramientas, cambios en el rol, etc.',
        placeholder: 'Ej: Un curso de liderazgo técnico y más exposición a decisiones de arquitectura...',
      },
    ],
  },
  {
    id: 'overall',
    title: 'Valoración general',
    description: 'Una vista de conjunto de tu desempeño en este período.',
    questions: [
      { id: 'overall_rating', type: 'rating', label: 'Autovaloración general', hint: 'Considerando todo el período, ¿cómo evaluás tu desempeño global?' },
      {
        id: 'overall_comment',
        type: 'textarea',
        label: '¿Hay algo más que quieras compartir con tu manager?',
        hint: 'Contexto adicional, logros no mencionados, situaciones especiales, inquietudes.',
        placeholder: 'Espacio libre para cualquier cosa que sientas importante compartir...',
      },
    ],
  },
];

const RATING_LABELS = ['Necesita desarrollo', 'En desarrollo', 'Cumple expectativas', 'Supera expectativas', 'Excepcional'];

function RatingScale({ value, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              style={{
                width: 44, height: 44, borderRadius: 10,
                border: selected ? '2px solid #0C0A09' : '1.5px solid #E7E5E4',
                background: selected ? '#0C0A09' : '#FFFFFF',
                color: selected ? '#FFFFFF' : '#78716C',
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.12s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = '#0C0A09';
                  e.currentTarget.style.color = '#0C0A09';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = '#E7E5E4';
                  e.currentTarget.style.color = '#78716C';
                }
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', marginTop: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} style={{ width: 52, fontSize: 10.5, color: value === n ? '#0C0A09' : '#D6D3D1', fontWeight: value === n ? 500 : 400, lineHeight: 1.3, paddingRight: 8 }}>
            {n === 1 || n === 5 || value === n ? RATING_LABELS[n - 1] : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

function isSectionComplete(section, answers) {
  return section.questions.every(q => {
    const val = answers[q.id];
    if (q.type === 'textarea') return val && val.trim().length > 10;
    if (q.type === 'rating') return val && val > 0;
    return false;
  });
}

export default function SelfAssessmentClient({ user, profile, cycleId }) {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState(false);

  const section = SECTIONS[currentSection];
  const userName = user?.email?.split('@')[0] || 'Usuario';
  const completedCount = SECTIONS.filter(s => isSectionComplete(s, answers)).length;
  const pct = Math.round((completedCount / SECTIONS.length) * 100);

  const setAnswer = (id, val) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSubmit = () => {
    router.push(`/review-cycles/${cycleId}`);
  };

  const allComplete = SECTIONS.every(s => isSectionComplete(s, answers));

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 56,
        background: '#FFFFFF', borderBottom: '1px solid #F5F5F4',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.push(`/review-cycles/${cycleId}`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, padding: 0 }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0C0A09'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#A8A29E'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver
          </button>
          <span style={{ color: '#E7E5E4', fontSize: 16 }}>|</span>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: '#0C0A09' }}>Autoevaluación</span>
          <span style={{ fontSize: 13, color: '#A8A29E' }}>Q1 Performance Review 2026</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 120, height: 4, background: '#F5F5F4', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#0C0A09', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 12, color: '#A8A29E' }}>{completedCount}/{SECTIONS.length}</span>
          </div>

          <button
            onClick={handleSave}
            style={{
              fontSize: 12.5, color: saved ? '#15803D' : '#78716C', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {saved ? (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Guardado</>
            ) : 'Guardar borrador'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>

        {/* Left nav */}
        <div style={{ width: 240, flexShrink: 0, paddingTop: 40, paddingRight: 40 }}>
          <div style={{ position: 'sticky', top: 80 }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SECTIONS.map((s, i) => {
                const isActive = currentSection === i;
                const isDone = isSectionComplete(s, answers);
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSection(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 8, border: 'none',
                      background: isActive ? '#F5F5F4' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#FAFAF9'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone ? '#0C0A09' : isActive ? '#F5F5F4' : 'transparent',
                      border: isDone ? 'none' : isActive ? '1.5px solid #0C0A09' : '1.5px solid #D6D3D1',
                    }}>
                      {isDone ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? '#0C0A09' : '#A8A29E' }}>{i + 1}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#0C0A09' : '#78716C', lineHeight: 1.3 }}>
                      {s.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, paddingTop: 40, paddingBottom: 80, maxWidth: 660 }}>

          {/* Section header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#A8A29E', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {String(currentSection + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
              </span>
            </div>
            <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.04em', lineHeight: 1.2 }}>
              {section.title}
            </h1>
            <p style={{ margin: 0, fontSize: 15, color: '#78716C', lineHeight: 1.65 }}>
              {section.description}
            </p>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {section.questions.map((q) => (
              <div key={q.id}>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#0C0A09', marginBottom: 6, lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                  {q.label}
                </label>
                {q.hint && (
                  <p style={{ margin: '0 0 14px', fontSize: 13, color: '#A8A29E', lineHeight: 1.5 }}>{q.hint}</p>
                )}

                {q.type === 'textarea' && (
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    rows={5}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 10,
                      border: '1.5px solid #E7E5E4', fontSize: 14, color: '#0C0A09',
                      background: '#FFFFFF', resize: 'vertical', outline: 'none',
                      lineHeight: 1.6, transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0C0A09'}
                    onBlur={(e) => e.target.style.borderColor = '#E7E5E4'}
                  />
                )}

                {q.type === 'rating' && (
                  <RatingScale
                    value={answers[q.id] || 0}
                    onChange={(val) => setAnswer(q.id, val)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 52, paddingTop: 28, borderTop: '1px solid #F5F5F4' }}>
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              style={{
                padding: '10px 20px', borderRadius: 8,
                border: '1.5px solid #E7E5E4', background: '#FFFFFF',
                fontSize: 14, fontWeight: 500, cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
                color: currentSection === 0 ? '#D6D3D1' : '#0C0A09',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              ← Anterior
            </button>

            {currentSection < SECTIONS.length - 1 ? (
              <button
                onClick={() => setCurrentSection(currentSection + 1)}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: '#0C0A09', color: '#FFFFFF',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#292524'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#0C0A09'}
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allComplete}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: allComplete ? '#0C0A09' : '#E7E5E4',
                  color: allComplete ? '#FFFFFF' : '#A8A29E',
                  fontSize: 14, fontWeight: 500,
                  cursor: allComplete ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={(e) => { if (allComplete) e.currentTarget.style.background = '#292524'; }}
                onMouseLeave={(e) => { if (allComplete) e.currentTarget.style.background = '#0C0A09'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Enviar autoevaluación
              </button>
            )}
          </div>

          {!allComplete && currentSection === SECTIONS.length - 1 && (
            <p style={{ textAlign: 'center', fontSize: 12.5, color: '#A8A29E', marginTop: 12 }}>
              Completá todas las secciones para poder enviar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
