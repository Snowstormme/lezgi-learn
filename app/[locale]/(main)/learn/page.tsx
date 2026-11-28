import { getPublishedUnitsWithLessons } from '@/features/learning/queries';
import { CoursePathMap } from '@/features/learning/components/course-path-map';
import { UnitHeaderBanner } from '@/features/learning/components/unit-header-banner';
import { LearnTwilightBackdrop } from '@/components/course/LearnTwilightBackdrop';
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
            <UnitHeaderBanner unit={unit} allUnits={units} />

            <CoursePathMap lessons={unit.lessons} />
          </div>
        ))}
      </div>
    </div>
  );
}
