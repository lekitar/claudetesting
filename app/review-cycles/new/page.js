import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NewCycleClient from './NewCycleClient';

export const metadata = { title: 'Nuevo ciclo — Condor Agency Performance Review' };

export default async function NewCyclePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') redirect('/review-cycles');

  const { data: templates } = await supabase
    .from('review_templates')
    .select('id, name, is_default')
    .order('created_at', { ascending: false });

  const { data: employees } = await supabase
    .from('profiles')
    .select('id, full_name, job_title, department')
    .order('full_name', { ascending: true });

  return <NewCycleClient user={user} profile={profile} templates={templates || []} employees={employees || []} />;
}
