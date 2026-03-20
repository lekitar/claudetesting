import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PeopleClient from './PeopleClient';

export const metadata = { title: 'Personas — Condor Agency Performance Review' };

export default async function PeoplePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || !['super_admin', 'hr_admin'].includes(profile.role)) {
    redirect('/dashboard');
  }

  const { data: people } = await supabase
    .from('profiles')
    .select('id, full_name, email, job_title, department, role, is_active, hire_date, manager_id, team_id')
    .order('full_name');

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .order('name');

  return (
    <PeopleClient
      user={user}
      profile={profile}
      people={people || []}
      teams={teams || []}
    />
  );
}
