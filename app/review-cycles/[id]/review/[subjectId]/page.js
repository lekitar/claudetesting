import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReviewFormClient from './ReviewFormClient';

export const metadata = { title: 'Revisión — PerformIQ' };

export default async function ReviewFormPage({ params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single();

  return <ReviewFormClient user={user} profile={profile} cycleId={params.id} subjectId={params.subjectId} />;
}
