import fs from 'node:fs';
import path from 'node:path';
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

const CONTENT_ROOT = path.join(process.cwd(), 'content');

function readJsonFile(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function loadAndValidateContentBundle(): ContentBundle {
  const dictionaryDir = path.join(CONTENT_ROOT, 'dictionary');
  const coursesDir = path.join(CONTENT_ROOT, 'courses', 'ru-lez');

  const words: WordSeed[] = [];
  if (fs.existsSync(dictionaryDir)) {
    const dictFiles = fs
      .readdirSync(dictionaryDir)
      .filter((f) => f.endsWith('.json'))
      .sort();

    for (const file of dictFiles) {
      const fullPath = path.join(dictionaryDir, file);
      const parsed = dictionaryFileSchema.parse(readJsonFile(fullPath));
      words.push(...parsed);
    }
  }

  const units: UnitSeed[] = [];
  const lessons: LessonSeed[] = [];

  if (fs.existsSync(coursesDir)) {
    const unitDirs = fs
      .readdirSync(coursesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    for (const unitDir of unitDirs) {
      const unitFile = path.join(coursesDir, unitDir, 'unit.json');
      if (fs.existsSync(unitFile)) {
        const parsedUnit = unitSeedSchema.parse(readJsonFile(unitFile));
        units.push(parsedUnit);
      }

      const lessonsDir = path.join(coursesDir, unitDir, 'lessons');
      if (fs.existsSync(lessonsDir)) {
        const lessonFiles = fs
          .readdirSync(lessonsDir)
          .filter((f) => f.endsWith('.json'))
          .sort();

        for (const lessonFile of lessonFiles) {
          const fullLessonPath = path.join(lessonsDir, lessonFile);
          const parsedLesson = lessonSeedSchema.parse(
            readJsonFile(fullLessonPath)
          );
          lessons.push(parsedLesson);
        }
      }
    }
  }

  const bundle: ContentBundle = { words, units, lessons };
  validateContentBundleIntegrity(bundle);

  return bundle;
}
