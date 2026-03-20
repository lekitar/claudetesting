import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GoalsClient from './GoalsClient';

export const metadata = { title: 'Objetivos — Condor Agency Performance Review' };

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  // My objectives + objectives I can see
  const { data: objectives } = await supabase
    .from('objectives')
    .select(
      'id, title, description, status, progress, due_date, created_at, owner_id, team_id, profiles!objectives_owner_id_fkey(full_name, job_title), teams(name), key_results(id, title, current_value, target_value, unit)'
    )
    .order('created_at', { ascending: false });

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .order('name');

  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, job_title')
    .eq('is_active', true)
    .order('full_name');

  return (
    <GoalsClient
      user={user}
      profile={profile}
      objectives={objectives || []}
      teams={teams || []}
      allProfiles={allProfiles || []}
    />
  );
}
