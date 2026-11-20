import { z } from 'zod';
import { normalizeLezgiOrthography } from '@/lib/lezgi-utils';

export const contentStatusSchema = z.enum([
  'draft',
  'pending_review',
  'published',
  'rejected',
  'archived',
]);

export const slugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be kebab-case (lowercase letters, digits, hyphens)'
  );

const lezgiTextSchema = z
  .string()
  .min(1, 'Lezgi text cannot be empty')
  .transform((val) => normalizeLezgiOrthography(val));

export const wordExampleSeedSchema = z.object({
  slug: slugSchema,
  sentence_lez: lezgiTextSchema,
  translation_ru: z.string().min(1),
  audio_path: z.string().nullable().optional(),
  status: contentStatusSchema.default('draft'),
});

export const wordSeedSchema = z.object({
  slug: slugSchema,
  lemma_lez: lezgiTextSchema,
  translation_ru: z.string().min(1),
  translation_az: z.string().nullable().optional(),
  transcription_ru: z.string().nullable().optional(),
  part_of_speech: z
    .enum([
      'noun',
      'verb',
      'adjective',
      'pronoun',
      'adverb',
      'particle',
      'phrase',
      'numeral',
    ])
    .nullable()
    .optional(),
  grammar_notes_ru: z.string().nullable().optional(),
  audio_path: z.string().nullable().optional(),
  audio_status: contentStatusSchema.default('draft'),
  status: contentStatusSchema.default('draft'),
  examples: z.array(wordExampleSeedSchema).default([]),
});

export const dictionaryFileSchema = z.array(wordSeedSchema).min(1);

export const multipleChoicePayloadSchema = z
  .object({
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(6),
    correct_index: z.number().int().nonnegative(),
  })
  .refine((data) => data.correct_index < data.options.length, {
    message: 'correct_index must point to a valid index in options array',
    path: ['correct_index'],
  });

export const matchingPayloadSchema = z.object({
  pairs: z
    .array(
      z.object({
        left: lezgiTextSchema,
        right: z.string().min(1),
      })
    )
    .min(2)
    .max(6),
});

export const wordInputPayloadSchema = z.object({
  accepted_answers: z.array(lezgiTextSchema).min(1),
  hint_lez: z.string().optional(),
});

const baseExerciseFields = {
  slug: slugSchema,
  order_index: z.number().int().positive(),
  word_slug: slugSchema.nullable().optional(),
  prompt_ru: z.string().min(1),
  status: contentStatusSchema.default('draft'),
};

export const exerciseSeedSchema = z.discriminatedUnion('type', [
  z.object({
    ...baseExerciseFields,
    type: z.literal('multiple_choice'),
    payload: multipleChoicePayloadSchema,
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('matching'),
    payload: matchingPayloadSchema,
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('word_input'),
    payload: wordInputPayloadSchema,
  }),
]);

export const unitSeedSchema = z.object({
  slug: slugSchema,
  order_index: z.number().int().positive(),
  title_ru: z.string().min(1),
  description_ru: z.string().nullable().optional(),
  status: contentStatusSchema.default('draft'),
});

export const lessonSeedSchema = z.object({
  slug: slugSchema,
  unit_slug: slugSchema,
  order_index: z.number().int().positive(),
  title_ru: z.string().min(1),
  grammar_tip_ru: z.string().nullable().optional(),
  status: contentStatusSchema.default('draft'),
  exercises: z.array(exerciseSeedSchema).min(1),
});

export type WordSeed = z.infer<typeof wordSeedSchema>;
export type WordExampleSeed = z.infer<typeof wordExampleSeedSchema>;
export type UnitSeed = z.infer<typeof unitSeedSchema>;
export type LessonSeed = z.infer<typeof lessonSeedSchema>;
export type ExerciseSeed = z.infer<typeof exerciseSeedSchema>;

export interface ContentBundle {
  words: WordSeed[];
  units: UnitSeed[];
  lessons: LessonSeed[];
}

/**
 * Validates referential integrity across all dictionary words, units, and lessons.
 * Throws a descriptive error if duplicate slugs or dangling references exist.
 */
export function validateContentBundleIntegrity(bundle: ContentBundle): void {
  const wordSlugs = new Set<string>();
  const exampleSlugs = new Set<string>();
  const unitSlugs = new Set<string>();
  const lessonSlugs = new Set<string>();
  const exerciseSlugs = new Set<string>();

  for (const word of bundle.words) {
    if (wordSlugs.has(word.slug)) {
      throw new Error(`Duplicate word slug found: "${word.slug}"`);
    }
    wordSlugs.add(word.slug);

    for (const ex of word.examples) {
      if (exampleSlugs.has(ex.slug)) {
        throw new Error(`Duplicate word_example slug found: "${ex.slug}"`);
      }
      exampleSlugs.add(ex.slug);
    }
  }

  for (const unit of bundle.units) {
    if (unitSlugs.has(unit.slug)) {
      throw new Error(`Duplicate unit slug found: "${unit.slug}"`);
    }
    unitSlugs.add(unit.slug);
  }

  for (const lesson of bundle.lessons) {
    if (lessonSlugs.has(lesson.slug)) {
      throw new Error(`Duplicate lesson slug found: "${lesson.slug}"`);
    }
    lessonSlugs.add(lesson.slug);

    if (!unitSlugs.has(lesson.unit_slug)) {
      throw new Error(
        `Lesson "${lesson.slug}" references unknown unit_slug "${lesson.unit_slug}"`
      );
    }

    const orderIndexes = new Set<number>();
    for (const exercise of lesson.exercises) {
      if (exerciseSlugs.has(exercise.slug)) {
        throw new Error(`Duplicate exercise slug found: "${exercise.slug}"`);
      }
      exerciseSlugs.add(exercise.slug);

      if (orderIndexes.has(exercise.order_index)) {
        throw new Error(
          `Duplicate exercise order_index ${exercise.order_index} in lesson "${lesson.slug}"`
        );
      }
      orderIndexes.add(exercise.order_index);

      if (exercise.word_slug && !wordSlugs.has(exercise.word_slug)) {
        throw new Error(
          `Exercise "${exercise.slug}" in lesson "${lesson.slug}" references unknown word_slug "${exercise.word_slug}"`
        );
      }
    }
  }
}
