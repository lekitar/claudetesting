import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CycleDetailClient from './CycleDetailClient';

export const metadata = { title: 'Detalle del ciclo — Condor Agency Performance Review' };

export default async function CycleDetailPage({ params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name, job_title').eq('id', user.id).single();

  const { data: cycle } = await supabase
    .from('review_cycles').select('*').eq('id', params.id).single();

  if (!cycle) redirect('/review-cycles');

  // Get participants with their profiles
  const { data: participantRows } = await supabase
    .from('cycle_participants')
    .select('user_id, profiles(id, full_name, job_title, department)')
    .eq('cycle_id', params.id);

  // Get reviews for this cycle
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, reviewer_id, reviewee_id, type, status, updated_at')
    .eq('cycle_id', params.id);

  // Build participant list with review statuses
  const participants = (participantRows || []).map(row => {
    const p = row.profiles;
    const selfReview = reviews?.find(r => r.reviewee_id === p.id && r.reviewer_id === p.id && r.type === 'self');
    const managerReview = reviews?.find(r => r.reviewee_id === p.id && r.type === 'manager');
    return {
      ...p,
      selfStatus: selfReview?.status || 'pending',
      managerStatus: managerReview?.status || 'pending',
      selfReviewId: selfReview?.id,
      managerReviewId: managerReview?.id,
      updatedAt: selfReview?.updated_at || managerReview?.updated_at || null,
    };
  });

  // Check if current user has a self-assessment
  const myReview = reviews?.find(r => r.reviewer_id === user.id && r.type === 'self');

  return (
    <CycleDetailClient
      user={user} profile={profile} cycle={cycle}
      participants={participants} myReview={myReview || null}
    />
  );
}
