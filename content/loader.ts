import dict01GreetingsPeople from './dictionary/01-greetings-people.json';
import dict02WellbeingPronouns from './dictionary/02-wellbeing-pronouns.json';
import dict03AcquaintanceOrigin from './dictionary/03-acquaintance-origin.json';
import dict04LanguagePoliteness from './dictionary/04-language-politeness.json';
import dict05HospitalityFarewell from './dictionary/05-hospitality-farewell.json';

import unit01Json from './courses/ru-lez/unit-01-greetings/unit.json';
import lesson01HelloJson from './courses/ru-lez/unit-01-greetings/lessons/01-hello.json';
import lesson02TimeGreetingsJson from './courses/ru-lez/unit-01-greetings/lessons/02-time-greetings.json';
import lesson03HowAreYouJson from './courses/ru-lez/unit-01-greetings/lessons/03-how-are-you.json';
import lesson04PronounsJson from './courses/ru-lez/unit-01-greetings/lessons/04-pronouns.json';
import lesson05AcquaintanceJson from './courses/ru-lez/unit-01-greetings/lessons/05-acquaintance.json';
import lesson06OriginJson from './courses/ru-lez/unit-01-greetings/lessons/06-origin.json';
import lesson07LanguagesJson from './courses/ru-lez/unit-01-greetings/lessons/07-languages.json';
import lesson08PolitenessJson from './courses/ru-lez/unit-01-greetings/lessons/08-politeness.json';
import lesson09HospitalityJson from './courses/ru-lez/unit-01-greetings/lessons/09-hospitality.json';
import lesson10FarewellJson from './courses/ru-lez/unit-01-greetings/lessons/10-farewell.json';

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

const RAW_DICTIONARY_FILES: unknown[] = [
  dict01GreetingsPeople,
  dict02WellbeingPronouns,
  dict03AcquaintanceOrigin,
  dict04LanguagePoliteness,
  dict05HospitalityFarewell,
];

const RAW_UNIT_FILES: unknown[] = [unit01Json];

const RAW_LESSON_FILES: unknown[] = [
  lesson01HelloJson,
  lesson02TimeGreetingsJson,
  lesson03HowAreYouJson,
  lesson04PronounsJson,
  lesson05AcquaintanceJson,
  lesson06OriginJson,
  lesson07LanguagesJson,
  lesson08PolitenessJson,
  lesson09HospitalityJson,
  lesson10FarewellJson,
];

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
