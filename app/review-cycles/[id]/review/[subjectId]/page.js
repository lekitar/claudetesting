import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReviewFormClient from './ReviewFormClient';

export const metadata = { title: 'Revisión de desempeño — Condor Agency Performance Review' };

export default async function ReviewFormPage({ params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (!['super_admin', 'hr_admin', 'manager'].includes(profile?.role)) redirect('/dashboard');

  const { data: cycle } = await supabase
    .from('review_cycles').select('*').eq('id', params.cycleId).single();
  if (!cycle) redirect('/review-cycles');

  const { data: subject } = await supabase
    .from('profiles')
    .select('id, full_name, job_title, department')
    .eq('id', params.subjectId)
    .single();
  if (!subject) redirect(`/review-cycles/${params.cycleId}`);

  // Find or create manager review
  let { data: review } = await supabase
    .from('reviews')
    .select('*')
    .eq('cycle_id', params.cycleId)
    .eq('reviewer_id', user.id)
    .eq('reviewee_id', params.subjectId)
    .eq('type', 'manager')
    .maybeSingle();

  if (!review) {
    const { data: newReview } = await supabase
      .from('reviews')
      .insert({ cycle_id: params.cycleId, reviewer_id: user.id, reviewee_id: params.subjectId, type: 'manager', status: 'pending' })
      .select().single();
    review = newReview;
  }

  if (!review) redirect(`/review-cycles/${params.cycleId}`);

  // Get subject's self-assessment answers for reference
  const { data: selfReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('cycle_id', params.cycleId)
    .eq('reviewer_id', params.subjectId)
    .eq('type', 'self')
    .maybeSingle();

  let selfAnswers = [];
  if (selfReview) {
    const { data: sa } = await supabase
      .from('review_answers')
      .select('*, template_questions(label, type)')
      .eq('review_id', selfReview.id);
    selfAnswers = sa || [];
  }

  // Get template
  let templateId = cycle.template_id;
  if (!templateId) {
    const { data: def } = await supabase.from('review_templates').select('id').eq('is_default', true).single();
    templateId = def?.id;
  }

  let sections = [];
  if (templateId) {
    const { data: rawSections } = await supabase
      .from('template_sections')
      .select('*, template_questions(*)')
      .eq('template_id', templateId)
      .order('order_index', { ascending: true });

    sections = (rawSections || []).map(s => ({
      ...s,
      template_questions: [...(s.template_questions || [])].sort((a, b) => a.order_index - b.order_index),
    }));
  }

  const { data: answers } = await supabase
    .from('review_answers').select('*').eq('review_id', review.id);

  const answersMap = {};
  (answers || []).forEach(a => { answersMap[a.question_id] = a; });

  return (
    <ReviewFormClient
      user={user} cycle={cycle} review={review}
      subject={subject} sections={sections}
      answersMap={answersMap} selfAnswers={selfAnswers}
    />
  );
}
