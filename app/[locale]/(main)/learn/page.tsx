import { BookOpen } from 'lucide-react';
import { getPublishedUnitsWithLessons } from '@/features/learning/queries';
import { CoursePathMap } from '@/features/learning/components/course-path-map';
import { LearnTwilightBackdrop } from '@/components/course/LearnTwilightBackdrop';
import { Link } from '@/lib/i18n/routing';
import { buildPageMetadata, getAbsoluteUrl } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Курс лезгинского языка — уроки и модули',
  description:
    'Интерактивная карта уроков лезгинского языка: приветствия, знакомство, местоимения, повседневные диалоги и экзамен раздела.',
  path: '/learn',
  keywords: [
    'курс лезгинского языка',
    'уроки лезгинского языка онлайн',
    'лезгинский язык для начинающих',
  ],
});

export default async function UnitMapPage() {
  const units = await getPublishedUnitsWithLessons();
  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Курс лезгинского языка с нуля',
    description:
      'Пошаговые игровые уроки лезгинского языка для русскоязычных учеников.',
    provider: {
      '@type': 'Organization',
      name: 'Lezgi Learn',
      url: getAbsoluteUrl('/'),
    },
    inLanguage: ['ru', 'lez'],
    url: getAbsoluteUrl('/learn'),
  };

  return (
    <div className="relative -mx-4 -mt-6 -mb-28 min-h-[calc(100dvh-4rem)] overflow-hidden px-4 pt-6 pb-28">
      <LearnTwilightBackdrop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <div className="relative z-10 space-y-8">
        {units.map((unit) => (
          <div key={unit.slug} className="space-y-6">
            {/* Vermillion Unit Header Banner with Cloud White action button */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary px-5 py-4 text-[#F8FAFC]">
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]/90">
                  Модуль {unit.order_index} · {unit.completed_count}/
                  {unit.lessons.length}
                </p>
                <h1 className="text-balance text-base font-extrabold leading-snug text-[#F8FAFC]">
                  {unit.title_ru.replace(/^Юнит \d+\.\s*/, '')}
                </h1>
              </div>

              <Link
                href="/dictionary"
                title="Открыть словарь модуля"
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-3.5 pt-[1px] text-xs font-extrabold uppercase tracking-wider text-[#0B132B] transition-all hover:bg-white active:translate-y-[2px] active:border-b-2"
              >
                <BookOpen className="h-4 w-4 -translate-y-[0.5px] stroke-[2.5]" />
                <span>Слова</span>
              </Link>
            </div>

            <CoursePathMap lessons={unit.lessons} />
          </div>
        ))}
      </div>
    </div>
  );
}
