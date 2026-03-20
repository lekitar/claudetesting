'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/app/components/Sidebar';

export default function TemplatesClient({ user, profile, templates: initialTemplates }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('review_templates')
      .insert({ name: 'Nueva plantilla', description: '', is_default: false })
      .select().single();
    if (data) router.push(`/admin/templates/${data.id}`);
    setCreating(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F4', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Sidebar user={user} profile={profile} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 40px' }}>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}
          >
            <div>
              <button
                onClick={() => router.push('/admin')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#A8A29E', padding: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0C0A09'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#A8A29E'}
              >
                ← Administración
              </button>
              <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 600, color: '#0C0A09', letterSpacing: '-0.03em' }}>
                Plantillas de evaluación
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: '#78716C' }}>
                Diseñá las preguntas y secciones para cada tipo de evaluación
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCreate} disabled={creating}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                borderRadius: 8, border: 'none', background: '#0C0A09', color: '#FFFFFF',
                fontSize: 13.5, fontWeight: 500, cursor: creating ? 'wait' : 'pointer', flexShrink: 0,
              }}
              onMouseEnter={(e) => { if (!creating) e.currentTarget.style.background = '#292524'; }}
              onMouseLeave={(e) => { if (!creating) e.currentTarget.style.background = '#0C0A09'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {creating ? 'Creando...' : 'Nueva plantilla'}
            </motion.button>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {templates.map((t, i) => {
              const sectionCount = t.template_sections?.length || 0;
              const questionCount = t.template_sections?.reduce((sum, s) => sum + (s.template_questions?.length || 0), 0) || 0;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => router.push(`/admin/templates/${t.id}`)}
                  style={{
                    background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12,
                    padding: '20px 24px', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0C0A09'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E7E5E4'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0C0A09' }}>{t.name}</h3>
                        {t.is_default && (
                          <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: '#F0FDF4', color: '#15803D' }}>
                            Por defecto
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#78716C', lineHeight: 1.5 }}>{t.description}</p>
                      )}
                      <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ fontSize: 12.5, color: '#A8A29E' }}>{sectionCount} sección{sectionCount !== 1 ? 'es' : ''}</span>
                        <span style={{ fontSize: 12.5, color: '#A8A29E' }}>{questionCount} pregunta{questionCount !== 1 ? 's' : ''}</span>
                        <span style={{ fontSize: 12.5, color: '#A8A29E' }}>
                          Creada {new Date(t.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, color: '#A8A29E' }}>Editar →</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {templates.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ padding: '60px 24px', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 12 }}
              >
                <p style={{ margin: 0, fontSize: 14, color: '#A8A29E' }}>No hay plantillas creadas todavía</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
