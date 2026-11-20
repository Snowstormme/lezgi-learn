import { notFound } from 'next/navigation';
import { getPublishedLessonDetail } from '@/features/learning/queries';
import { LessonRunner } from '@/features/learning/components/lesson-runner';

export default async function LessonScreenPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getPublishedLessonDetail(slug);

  if (!lesson) {
    notFound();
  }

  return <LessonRunner lesson={lesson} />;
}
