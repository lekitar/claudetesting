import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MyReviewsClient from './MyReviewsClient';

export const metadata = { title: 'Mis revisiones — Condor Agency Performance Review' };

export default async function MyReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single();

  // Fetch all reviews where I'm the reviewer, with cycle and reviewee info
  const { data: allReviews } = await supabase
    .from('reviews')
    .select(`
      id, type, status, submitted_at, created_at, updated_at,
      cycle_id, reviewee_id,
      review_cycles(id, name, end_date),
      profiles!reviews_reviewee_id_fkey(id, full_name, job_title)
    `)
    .eq('reviewer_id', user.id)
    .order('updated_at', { ascending: false });

  const reviews = allReviews || [];

  const pending = reviews.filter(r => r.status === 'pending' || r.status === 'in_progress');
  const completed = reviews.filter(r => r.status === 'completed');

  return (
    <MyReviewsClient
      user={user}
      profile={profile}
      pendingReviews={pending}
      completedReviews={completed}
    />
  );
}
