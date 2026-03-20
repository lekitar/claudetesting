import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TemplatesClient from './TemplatesClient';

export const metadata = { title: 'Plantillas — Condor Agency Performance Review' };

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') redirect('/dashboard');

  const { data: templates } = await supabase
    .from('review_templates')
    .select(`
      *,
      template_sections (
        id,
        template_questions ( id )
      )
    `)
    .order('created_at', { ascending: false });

  return <TemplatesClient user={user} profile={profile} templates={templates || []} />;
}
