import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CycleDetailClient from './CycleDetailClient';

export const metadata = { title: 'Detalle del ciclo — PerformIQ' };

export default async function CycleDetailPage({ params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single();

  return <CycleDetailClient user={user} profile={profile} cycleId={params.id} />;
}
