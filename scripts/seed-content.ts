import { config as loadDotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { loadAndValidateContentBundle } from '../content/loader';
import type { Database } from '../lib/supabase/database.types';

loadDotenv({ path: '.env.local' });
loadDotenv({ path: '.env' });

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('🔍 Validating Lezgi Learn content bundle (JSON + Zod + Lezgi palochka normalization)...');
  const bundle = loadAndValidateContentBundle();

  const totalExamples = bundle.words.reduce((acc, w) => acc + w.examples.length, 0);
  const totalExercises = bundle.lessons.reduce((acc, l) => acc + l.exercises.length, 0);

  console.log(
    `✅ Content bundle is valid:\n` +
      `   - Words: ${bundle.words.length} (${totalExamples} usage examples)\n` +
      `   - Units: ${bundle.units.length}\n` +
      `   - Lessons: ${bundle.lessons.length} (${totalExercises} exercises)`
  );

  if (isDryRun) {
    console.log('✨ Dry-run complete. No database queries executed.');
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    supabaseUrl.includes('your-project-ref.supabase.co') ||
    serviceRoleKey === 'your-secret-service-role-key'
  ) {
    console.error(
      '❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.\n' +
        '   Copy .env.example to .env.local and fill in your cloud Supabase credentials first.'
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('🚀 Upserting dictionary words...');
  const wordRows = bundle.words.map((w) => ({
    slug: w.slug,
    lemma_lez: w.lemma_lez,
    translation_ru: w.translation_ru,
    translation_az: w.translation_az ?? null,
    transcription_ru: w.transcription_ru ?? null,
    part_of_speech: w.part_of_speech ?? null,
    grammar_notes_ru: w.grammar_notes_ru ?? null,
    audio_path: w.audio_path ?? null,
    audio_status: w.audio_status,
    status: w.status,
  }));

  const { data: upsertedWords, error: wordsError } = await supabase
    .from('words')
    .upsert(wordRows, { onConflict: 'slug' })
    .select('id, slug');

  if (wordsError || !upsertedWords) {
    throw new Error(`Failed to upsert words: ${wordsError?.message}`);
  }

  const wordIdBySlug = new Map<string, string>(
    upsertedWords.map((w) => [w.slug, w.id])
  );

  console.log('🚀 Upserting word examples...');
  const exampleRows = bundle.words.flatMap((w) => {
    const wordId = wordIdBySlug.get(w.slug);
    if (!wordId) throw new Error(`Missing word ID for slug ${w.slug}`);
    return w.examples.map((ex) => ({
      slug: ex.slug,
      word_id: wordId,
      sentence_lez: ex.sentence_lez,
      translation_ru: ex.translation_ru,
      audio_path: ex.audio_path ?? null,
      status: ex.status,
    }));
  });

  if (exampleRows.length > 0) {
    const { error: exError } = await supabase
      .from('word_examples')
      .upsert(exampleRows, { onConflict: 'slug' });
    if (exError) {
      throw new Error(`Failed to upsert word_examples: ${exError.message}`);
    }
  }

  console.log('🚀 Upserting units...');
  const unitRows = bundle.units.map((u) => ({
    slug: u.slug,
    order_index: u.order_index,
    title_ru: u.title_ru,
    description_ru: u.description_ru ?? null,
    status: u.status,
  }));

  const { data: upsertedUnits, error: unitsError } = await supabase
    .from('units')
    .upsert(unitRows, { onConflict: 'slug' })
    .select('id, slug');

  if (unitsError || !upsertedUnits) {
    throw new Error(`Failed to upsert units: ${unitsError?.message}`);
  }

  const unitIdBySlug = new Map<string, string>(
    upsertedUnits.map((u) => [u.slug, u.id])
  );

  console.log('🚀 Upserting lessons...');
  const lessonRows = bundle.lessons.map((l) => {
    const unitId = unitIdBySlug.get(l.unit_slug);
    if (!unitId) throw new Error(`Missing unit ID for slug ${l.unit_slug}`);
    return {
      slug: l.slug,
      unit_id: unitId,
      order_index: l.order_index,
      title_ru: l.title_ru,
      grammar_tip_ru: l.grammar_tip_ru ?? null,
      status: l.status,
    };
  });

  const { data: upsertedLessons, error: lessonsError } = await supabase
    .from('lessons')
    .upsert(lessonRows, { onConflict: 'slug' })
    .select('id, slug');

  if (lessonsError || !upsertedLessons) {
    throw new Error(`Failed to upsert lessons: ${lessonsError?.message}`);
  }

  const lessonIdBySlug = new Map<string, string>(
    upsertedLessons.map((l) => [l.slug, l.id])
  );

  console.log('🚀 Upserting exercises...');
  const exerciseRows = bundle.lessons.flatMap((l) => {
    const lessonId = lessonIdBySlug.get(l.slug);
    if (!lessonId) throw new Error(`Missing lesson ID for slug ${l.slug}`);
    return l.exercises.map((ex) => ({
      slug: ex.slug,
      lesson_id: lessonId,
      order_index: ex.order_index,
      type: ex.type,
      word_id: ex.word_slug ? (wordIdBySlug.get(ex.word_slug) ?? null) : null,
      prompt_ru: ex.prompt_ru,
      payload: ex.payload,
      status: ex.status,
    }));
  });

  if (exerciseRows.length > 0) {
    const { error: exercisesError } = await supabase
      .from('exercises')
      .upsert(exerciseRows, { onConflict: 'slug' });
    if (exercisesError) {
      throw new Error(`Failed to upsert exercises: ${exercisesError.message}`);
    }
  }

  console.log('🎉 Database seed completed successfully!');
}

main().catch((err) => {
  console.error('❌ Seed script failed:', err);
  process.exit(1);
});
