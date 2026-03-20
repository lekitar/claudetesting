import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TeamsClient from './TeamsClient';

export const metadata = { title: 'Equipos — Condor Agency Performance Review' };

export default async function TeamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();

  // Fetch teams with their lead profile and member count
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, description, team_lead_id, created_at, profiles!teams_team_lead_id_fkey(full_name, job_title)')
    .order('name');

  // Fetch member counts per team
  const { data: memberCounts } = await supabase
    .from('team_members')
    .select('team_id');

  const countMap = {};
  (memberCounts || []).forEach(m => { countMap[m.team_id] = (countMap[m.team_id] || 0) + 1; });

  const teamsWithCount = (teams || []).map(t => ({ ...t, member_count: countMap[t.id] || 0 }));

  return <TeamsClient user={user} profile={profile} teams={teamsWithCount} />;
}
