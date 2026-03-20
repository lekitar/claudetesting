import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TeamDetailClient from './TeamDetailClient';

export default async function TeamDetailPage({ params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();

  const { data: team } = await supabase
    .from('teams')
    .select('id, name, description, team_lead_id, created_at')
    .eq('id', params.id)
    .single();

  if (!team) redirect('/teams');

  const { data: members } = await supabase
    .from('team_members')
    .select('id, role, user_id, profiles(id, full_name, job_title, role)')
    .eq('team_id', params.id);

  // All profiles for adding members
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, job_title, role')
    .eq('is_active', true)
    .order('full_name');

  return <TeamDetailClient user={user} profile={profile} team={team} members={members || []} allProfiles={allProfiles || []} />;
}
