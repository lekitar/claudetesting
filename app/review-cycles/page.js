import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReviewCyclesClient from './ReviewCyclesClient';

export const metadata = { title: 'Ciclos de evaluación — Condor Agency Performance Review' };

export default async function ReviewCyclesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single();

  const { data: cycles } = await supabase
    .from('review_cycles')
    .select(`
      *,
      cycle_participants ( count )
    `)
    .order('created_at', { ascending: false });

  // Get participant counts separately for accuracy
  const { data: participantCounts } = await supabase
    .from('cycle_participants')
    .select('cycle_id');

  const countMap = {};
  (participantCounts || []).forEach(p => {
    countMap[p.cycle_id] = (countMap[p.cycle_id] || 0) + 1;
  });

  // Get completion stats from reviews
  const { data: reviewStats } = await supabase
    .from('reviews')
    .select('cycle_id, status');

  const statsMap = {};
  (reviewStats || []).forEach(r => {
    if (!statsMap[r.cycle_id]) statsMap[r.cycle_id] = { total: 0, completed: 0 };
    statsMap[r.cycle_id].total++;
    if (r.status === 'completed') statsMap[r.cycle_id].completed++;
  });

  const enrichedCycles = (cycles || []).map(c => ({
    ...c,
    participantCount: countMap[c.id] || 0,
    reviewStats: statsMap[c.id] || { total: 0, completed: 0 },
  }));

  return <ReviewCyclesClient user={user} profile={profile} cycles={enrichedCycles} />;
}
