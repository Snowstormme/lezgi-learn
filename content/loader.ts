import coreWordsJson from './dictionary/core-words.json';
import unit01Json from './courses/ru-lez/unit-01-greetings/unit.json';
import lesson01HelloJson from './courses/ru-lez/unit-01-greetings/lessons/01-hello.json';
import lesson02HowAreYouJson from './courses/ru-lez/unit-01-greetings/lessons/02-how-are-you.json';
import {
  type ContentBundle,
  dictionaryFileSchema,
  lessonSeedSchema,
  unitSeedSchema,
  validateContentBundleIntegrity,
  type LessonSeed,
  type UnitSeed,
  type WordSeed,
} from './schema';

const RAW_DICTIONARY_FILES: unknown[] = [coreWordsJson];
const RAW_UNIT_FILES: unknown[] = [unit01Json];
const RAW_LESSON_FILES: unknown[] = [lesson01HelloJson, lesson02HowAreYouJson];

/**
 * Loads and validates the entire Lezgi Learn content bundle.
 * Uses static JSON imports so it works seamlessly across Node.js (seed scripts, Vitest),
 * Next.js Server Components, and Cloudflare Workers runtime.
 */
export function loadAndValidateContentBundle(): ContentBundle {
  const words: WordSeed[] = [];
  for (const rawDict of RAW_DICTIONARY_FILES) {
    const parsed = dictionaryFileSchema.parse(rawDict);
    words.push(...parsed);
  }

  const units: UnitSeed[] = [];
  for (const rawUnit of RAW_UNIT_FILES) {
    units.push(unitSeedSchema.parse(rawUnit));
  }

  const lessons: LessonSeed[] = [];
  for (const rawLesson of RAW_LESSON_FILES) {
    lessons.push(lessonSeedSchema.parse(rawLesson));
  }

  const bundle: ContentBundle = { words, units, lessons };
  validateContentBundleIntegrity(bundle);

  return bundle;
}
