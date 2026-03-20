import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReviewCyclesClient from './ReviewCyclesClient';

export const metadata = {
  title: 'Ciclos de evaluación — PerformIQ',
};

export default async function ReviewCyclesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  return <ReviewCyclesClient user={user} profile={profile} />;
}
