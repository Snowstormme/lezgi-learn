/**
 * Feature Module: phrasebook
 * Stage 1 scaffold. Full phrasebook categories and verified dialogues are added in Stage 4.
 */
export interface PhrasebookCategoryPlaceholder {
  slug: string;
  title_ru: string;
}

export const PHRASEBOOK_PLANNED_CATEGORIES: PhrasebookCategoryPlaceholder[] = [
  { slug: 'greetings', title_ru: 'Приветствия и вежливость' },
  { slug: 'family', title_ru: 'Семья и старшие' },
  { slug: 'guest', title_ru: 'В гостях и за столом' },
  { slug: 'road', title_ru: 'В дороге и в селе' },
];
