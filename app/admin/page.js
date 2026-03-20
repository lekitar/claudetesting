import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') redirect('/dashboard');

  const { data: users, error } = await supabase.rpc('admin_get_all_users');

  return <AdminClient currentUser={user} users={users || []} />;
}
