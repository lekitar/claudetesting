import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SelfAssessmentClient from './SelfAssessmentClient';

export const metadata = { title: 'Autoevaluación — PerformIQ' };

export default async function SelfAssessmentPage({ params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single();

  return <SelfAssessmentClient user={user} profile={profile} cycleId={params.id} />;
}
