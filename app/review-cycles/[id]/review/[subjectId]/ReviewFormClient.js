'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUBJECTS = {
  1: { name: 'Ana García', role: 'Senior Developer', avatar: 'AG', tenure: '3 años en la empresa', team: 'Engineering' },
  2: { name: 'Carlos López', role: 'Product Manager', avatar: 'CL', tenure: '2 años en la empresa', team: 'Product' },
  3: { name: 'María Rodríguez', role: 'UX Designer', avatar: 'MR', tenure: '1.5 años en la empresa', team: 'Design' },
  4: { name: 'Juan Pérez', role: 'Data Analyst', avatar: 'JP', tenure: '8 meses en la empresa', team: 'Data' },
  5: { name: 'Laura Martínez', role: 'Backend Developer', avatar: 'LM', tenure: '4 años en la empresa', team: 'Engineering' },
  6: { name: 'Diego Fernández', role: 'Frontend Developer', avatar: 'DF', tenure: '1 año en la empresa', team: 'Engineering' },
  7: { name: 'Valentina Gómez', role: 'QA Engineer', avatar: 'VG', tenure: '2.5 años en la empresa', team: 'Engineering' },
  8: { name: 'Martín Torres', role: 'DevOps Engineer', avatar: 'MT', tenure: '3 años en la empresa', team: 'Infrastructure' },
};

const SECTIONS = [
  {
    id: 'performance',
    title: 'Desempeño y resultados',
    description: (name) => `Evaluá el desempeño de ${name} durante este período. Basate en observaciones directas y resultados concretos.`,
    questions: [
      {
        id: 'results',
        type: 'textarea',
        label: (name) => `¿Cuáles fueron los principales logros de ${name} en este período?`,
        hint: 'Descripción de resultados concretos, proyectos completados y contribuciones al equipo.',
        placeholder: 'Ej: Lideró la migración de sistemas con mínimo impacto en producción...',
      },
      {
        id: 'quality',
        type: 'rating',
        label: () => 'Calidad del trabajo',
        hint: 'Consistencia, precisión y estándares en los entregables.',
      },
      {
        id: 'delivery',
        type: 'rating',
        label: () => 'Cumplimiento de compromisos',
        hint: 'Capacidad de entregar en tiempo y forma lo acordado.',
      },
    ],
  },
  {
    id: 'competencies',
    title: 'Competencias',
    description: (name) => `Evaluá las competencias clave de ${name} en base a lo que pudiste observar directamente.`,
    questions: [
      { id: 'communication', type: 'rating', label: () => 'Comunicación', hint: 'Claridad, escucha activa, comunicación en reuniones y asincrónica.' },
      { id: 'collaboration', type: 'rating', label: () => 'Colaboración y trabajo en equipo', hint: 'Disposición a ayudar, manejo de conflictos, contribución al clima del equipo.' },
      { id: 'technical', type: 'rating', label: () => 'Habilidades técnicas', hint: 'Dominio del área, toma de decisiones técnicas, resolución de problemas.' },
      { id: 'initiative', type: 'rating', label: () => 'Iniciativa e impacto', hint: 'Proactividad, propuesta de soluciones, ownership sin que te lo pidan.' },
    ],
  },
  {
    id: 'growth',
    title: 'Crecimiento y desarrollo',
    description: (name) => `¿En qué áreas ves más potencial de crecimiento para ${name}? ¿Qué necesita para dar el siguiente paso?`,
    questions: [
      {
        id: 'strengths',
        type: 'textarea',
        label: (name) => `¿Cuáles son las principales fortalezas de ${name}?`,
        hint: 'Competencias en las que destaca y sobre las que puede construir.',
        placeholder: 'Ej: Tiene una capacidad excepcional para simplificar problemas complejos...',
      },
      {
        id: 'develop',
        type: 'textarea',
        label: (name) => `¿En qué áreas debería enfocarse ${name} para crecer?`,
        hint: 'Áreas de desarrollo que beneficiarían su carrera y al equipo.',
        placeholder: 'Ej: Podría mejorar la comunicación proactiva con stakeholders no técnicos...',
      },
    ],
  },
  {
    id: 'overall',
    title: 'Evaluación final',
    description: (name) => `Valoración de conjunto del desempeño de ${name} en este ciclo.`,
    questions: [
      { id: 'overall_rating', type: 'rating', label: (name) => `Valoración general de ${name}`, hint: 'Considerando todos los aspectos, ¿cómo evaluás su desempeño global?' },
      {
        id: 'summary',
        type: 'textarea',
        label: () => 'Comentario para compartir con la persona',
        hint: 'Este mensaje puede ser compartido con la persona evaluada. Sé específico y constructivo.',
        placeholder: 'Ej: Ha sido un período de gran crecimiento. Destacaría especialmente...',
      },
      {
        id: 'private_notes',
        type: 'textarea',
        label: () => 'Notas privadas (solo para calibración)',
        hint: 'Solo visible para el equipo de calibración. No será compartido con la persona.',
        placeholder: 'Contexto adicional, comparación con pares, consideraciones para la calibración...',
        private: true,
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
              }}
              onMouseEnter={(e) => {
                if (!selected) { e.currentTarget.style.borderColor = '#0C0A09'; e.currentTarget.style.color = '#0C0A09'; }
              }}
              onMouseLeave={(e) => {
                if (!selected) { e.currentTarget.style.borderColor = '#E7E5E4'; e.currentTarget.style.color = '#78716C'; }
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

function isSectionComplete(section, answers, subject) {
  return section.questions.every(q => {
    const val = answers[q.id];
    if (q.private) return true;
    if (q.type === 'textarea') return val && val.trim().length > 10;
    if (q.type === 'rating') return val && val > 0;
    return false;
  });
}

export default function ReviewFormClient({ user, profile, cycleId, subjectId }) {
  const router = useRouter();
  const subject = SUBJECTS[subjectId] || SUBJECTS[1];
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState(false);

  const section = SECTIONS[currentSection];
  const completedCount = SECTIONS.filter(s => isSectionComplete(s, answers, subject)).length;
  const pct = Math.round((completedCount / SECTIONS.length) * 100);
  const allComplete = SECTIONS.every(s => isSectionComplete(s, answers, subject));

  const setAnswer = (id, val) => { setAnswers(prev => ({ ...prev, [id]: val })); setSaved(false); };

  const handleSubmit = () => router.push(`/review-cycles/${cycleId}`);

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
          <span style={{ fontSize: 13.5, fontWeight: 500, color: '#0C0A09' }}>Revisión de desempeño</span>
          <span style={{ fontSize: 13, color: '#A8A29E' }}>Q1 Performance Review 2026</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 120, height: 4, background: '#F5F5F4', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#0C0A09', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 12, color: '#A8A29E' }}>{completedCount}/{SECTIONS.length}</span>
          </div>
          <button
            onClick={() => setSaved(true)}
            style={{ fontSize: 12.5, color: saved ? '#15803D' : '#78716C', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {saved ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Guardado</> : 'Guardar borrador'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>

        {/* Left nav */}
        <div style={{ width: 240, flexShrink: 0, paddingTop: 40, paddingRight: 40 }}>
          <div style={{ position: 'sticky', top: 80 }}>

            {/* Subject card */}
            <div style={{ background: '#FAFAF9', border: '1px solid #E7E5E4', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#1C1917',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, color: '#78716C', flexShrink: 0,
                }}>{subject.avatar}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#0C0A09' }}>{subject.name}</p>
                  <p style={{ margin: '1px 0 0', fontSize: 12, color: '#A8A29E' }}>{subject.role}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: '#A8A29E', background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 6, padding: '2px 7px' }}>{subject.team}</span>
                <span style={{ fontSize: 11, color: '#A8A29E', background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 6, padding: '2px 7px' }}>{subject.tenure}</span>
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SECTIONS.map((s, i) => {
                const isActive = currentSection === i;
                const isDone = isSectionComplete(s, answers, subject);
                return (
                  <button key={s.id} onClick={() => setCurrentSection(i)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: 'none',
                    background: isActive ? '#F5F5F4' : 'transparent', cursor: 'pointer', textAlign: 'left',
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
                      {isDone ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? '#0C0A09' : '#A8A29E' }}>{i + 1}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#0C0A09' : '#78716C', lineHeight: 1.3 }}>{s.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, paddingTop: 40, paddingBottom: 80, maxWidth: 660 }}>
          <div style={{ marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#A8A29E', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {String(currentSection + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
            </span>
            <h1 style={{ margin: '10px 0 10px', fontSize: 28, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.04em', lineHeight: 1.2 }}>
              {section.title}
            </h1>
            <p style={{ margin: 0, fontSize: 15, color: '#78716C', lineHeight: 1.65 }}>
              {section.description(subject.name.split(' ')[0])}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {section.questions.map((q) => (
              <div key={q.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <label style={{ fontSize: 15, fontWeight: 600, color: '#0C0A09', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                    {q.label(subject.name.split(' ')[0])}
                  </label>
                  {q.private && (
                    <span style={{ fontSize: 11, color: '#A8A29E', background: '#F5F5F4', border: '1px solid #E7E5E4', borderRadius: 6, padding: '1px 7px' }}>
                      Privado
                    </span>
                  )}
                </div>
                {q.hint && <p style={{ margin: '0 0 14px', fontSize: 13, color: '#A8A29E', lineHeight: 1.5 }}>{q.hint}</p>}

                {q.type === 'textarea' && (
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    rows={5}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 10,
                      border: `1.5px solid ${q.private ? '#FEF3C7' : '#E7E5E4'}`,
                      background: q.private ? '#FFFBEB' : '#FFFFFF',
                      fontSize: 14, color: '#0C0A09', resize: 'vertical', outline: 'none', lineHeight: 1.6,
                    }}
                    onFocus={(e) => e.target.style.borderColor = q.private ? '#F59E0B' : '#0C0A09'}
                    onBlur={(e) => e.target.style.borderColor = q.private ? '#FEF3C7' : '#E7E5E4'}
                  />
                )}
                {q.type === 'rating' && (
                  <RatingScale value={answers[q.id] || 0} onChange={(val) => setAnswer(q.id, val)} />
                )}
              </div>
            ))}
          </div>

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 52, paddingTop: 28, borderTop: '1px solid #F5F5F4' }}>
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              style={{
                padding: '10px 20px', borderRadius: 8, border: '1.5px solid #E7E5E4', background: '#FFFFFF',
                fontSize: 14, fontWeight: 500, cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
                color: currentSection === 0 ? '#D6D3D1' : '#0C0A09',
              }}
            >
              ← Anterior
            </button>

            {currentSection < SECTIONS.length - 1 ? (
              <button
                onClick={() => setCurrentSection(currentSection + 1)}
                style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#0C0A09', color: '#FFFFFF', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
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
                  fontSize: 14, fontWeight: 500, cursor: allComplete ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={(e) => { if (allComplete) e.currentTarget.style.background = '#292524'; }}
                onMouseLeave={(e) => { if (allComplete) e.currentTarget.style.background = '#0C0A09'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Enviar revisión
              </button>
            )}
          </div>

          {!allComplete && currentSection === SECTIONS.length - 1 && (
            <p style={{ textAlign: 'center', fontSize: 12.5, color: '#A8A29E', marginTop: 12 }}>
              Completá todas las secciones requeridas para enviar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
