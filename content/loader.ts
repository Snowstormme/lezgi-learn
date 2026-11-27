import dict01GreetingsPeople from './dictionary/01-greetings-people.json';
import dict02WellbeingPronouns from './dictionary/02-wellbeing-pronouns.json';
import dict03AcquaintanceOrigin from './dictionary/03-acquaintance-origin.json';
import dict04LanguagePoliteness from './dictionary/04-language-politeness.json';
import dict05HospitalityFarewell from './dictionary/05-hospitality-farewell.json';
import dict06Numbers from './dictionary/06-numbers.json';
import dict07Particles from './dictionary/07-particles.json';
import dict08Adjectives from './dictionary/08-adjectives.json';
import corePhrasesJson from './phrasebook/core-phrases.json';

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
import lesson11UnitExamJson from './courses/ru-lez/unit-01-greetings/lessons/11-unit-exam.json';

import {
  type ContentBundle,
  dictionaryFileSchema,
  lessonSeedSchema,
  phrasebookFileSchema,
  unitSeedSchema,
  validateContentBundleIntegrity,
  type LessonSeed,
  type UnitSeed,
  type VerifiedPhraseSeed,
  type WordSeed,
} from './schema';

const RAW_DICTIONARY_FILES: unknown[] = [
  dict01GreetingsPeople,
  dict02WellbeingPronouns,
  dict03AcquaintanceOrigin,
  dict04LanguagePoliteness,
  dict05HospitalityFarewell,
  dict06Numbers,
  dict07Particles,
  dict08Adjectives,
];

const RAW_PHRASEBOOK_FILES: unknown[] = [corePhrasesJson];

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
  lesson11UnitExamJson,
];

let cachedContentBundle: ContentBundle | null = null;

/**
 * Loads, validates, and caches the Lezgi Learn content bundle in memory.
 * Runs Zod parsing once per isolate so subsequent reads take 0ms of CPU.
 */
export function loadAndValidateContentBundle(): ContentBundle {
  if (cachedContentBundle) {
    return cachedContentBundle;
  }

  const words: WordSeed[] = [];
  for (const rawDict of RAW_DICTIONARY_FILES) {
    const parsed = dictionaryFileSchema.parse(rawDict);
    words.push(...parsed);
  }

  const phrases: VerifiedPhraseSeed[] = [];
  for (const rawPhrases of RAW_PHRASEBOOK_FILES) {
    const parsed = phrasebookFileSchema.parse(rawPhrases);
    phrases.push(...parsed);
  }

  const units: UnitSeed[] = [];
  for (const rawUnit of RAW_UNIT_FILES) {
    units.push(unitSeedSchema.parse(rawUnit));
  }

  const lessons: LessonSeed[] = [];
  for (const rawLesson of RAW_LESSON_FILES) {
    lessons.push(lessonSeedSchema.parse(rawLesson));
  }

  const bundle: ContentBundle = { words, units, lessons, phrases };
  validateContentBundleIntegrity(bundle);

  cachedContentBundle = bundle;
  return bundle;
}
