import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MyReviewsClient from './MyReviewsClient';

export const metadata = { title: 'Mis revisiones — PerformIQ' };

export default async function MyReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single();

  return <MyReviewsClient user={user} profile={profile} />;
}
