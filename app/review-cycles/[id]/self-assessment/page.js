import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SelfAssessmentClient from './SelfAssessmentClient';

export const metadata = { title: 'Autoevaluación — Condor Agency Performance Review' };

export default async function SelfAssessmentPage({ params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: cycle } = await supabase
    .from('review_cycles').select('*').eq('id', params.id).single();
  if (!cycle) redirect('/review-cycles');

  // Find or create self-assessment review
  let { data: review } = await supabase
    .from('reviews')
    .select('*')
    .eq('cycle_id', params.id)
    .eq('reviewer_id', user.id)
    .eq('type', 'self')
    .maybeSingle();

  if (!review) {
    const { data: newReview } = await supabase
      .from('reviews')
      .insert({ cycle_id: params.id, reviewer_id: user.id, reviewee_id: user.id, type: 'self', status: 'pending' })
      .select().single();
    review = newReview;
  }

  if (!review) redirect(`/review-cycles/${params.id}`);

  // Get template (cycle's template or default)
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

  // Get existing answers
  const { data: answers } = await supabase
    .from('review_answers')
    .select('*')
    .eq('review_id', review.id);

  const answersMap = {};
  (answers || []).forEach(a => { answersMap[a.question_id] = a; });

  return (
    <SelfAssessmentClient
      user={user} cycle={cycle} review={review}
      sections={sections} answersMap={answersMap}
    />
  );
}
