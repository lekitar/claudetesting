import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TemplateEditorClient from './TemplateEditorClient';

export const metadata = { title: 'Editor de plantilla — Condor Agency Performance Review' };

export default async function TemplateEditorPage({ params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') redirect('/dashboard');

  const { data: template } = await supabase
    .from('review_templates')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!template) redirect('/admin/templates');

  const { data: sections } = await supabase
    .from('template_sections')
    .select('*, template_questions(*)')
    .eq('template_id', params.id)
    .order('order_index', { ascending: true });

  // Sort questions within each section
  const sortedSections = (sections || []).map(s => ({
    ...s,
    template_questions: [...(s.template_questions || [])].sort((a, b) => a.order_index - b.order_index),
  }));

  return <TemplateEditorClient user={user} profile={profile} template={template} sections={sortedSections} />;
}
