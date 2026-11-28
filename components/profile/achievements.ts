export type BadgeKind = "flame" | "book" | "bridge" | "mountain" | "tea" | "eagle";
export type Category = "Все" | "Учёба" | "Постоянство" | "Открытия";

export interface Achievement {
  id: string;
  name: string;
  subtitle: string;
  category: Exclude<Category, "Все">;
  kind: BadgeKind;
  tone: "gold" | "jade" | "coral" | "ice";
  current: number;
  target: number;
  unit: string;
  earned: boolean;
  description: string;
  date?: string;
}

export const ACHIEVEMENT_IDS = [
  "first",
  "fire",
  "bridge",
  "tea",
  "words",
  "eagle",
  "peak",
  "month",
  "roots",
  "library",
  "journey",
  "summit",
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

export interface LearnerAchievementProgressInput {
  completedLessonsCount: number;
  completedUnitsCount: number;
  unit1Completed: boolean;
  hospitalityCompleted: boolean;
  cultureThemesCompleted: number;
  perfectExamCount: number;
  wordsLearned: number;
  streakDays: number;
  earnedDateLabel?: string;
}

export function buildLearnerAchievements(
  input: LearnerAchievementProgressInput,
): Achievement[] {
  const date = input.earnedDateLabel;

  const firstCurrent = Math.min(1, input.completedLessonsCount);
  const fireCurrent = Math.min(7, input.streakDays);
  const bridgeCurrent = input.unit1Completed ? 1 : 0;
  const teaCurrent = input.hospitalityCompleted ? 1 : 0;
  const wordsCurrent = Math.min(100, input.wordsLearned);
  const eagleCurrent = Math.min(1, input.perfectExamCount);
  const peakCurrent = Math.min(3, input.completedUnitsCount);
  const monthCurrent = Math.min(30, input.streakDays);
  const rootsCurrent = Math.min(5, input.cultureThemesCompleted);
  const libraryCurrent = Math.min(500, input.wordsLearned);
  const journeyCurrent = Math.min(100, input.streakDays);
  const summitCurrent = Math.min(11, input.completedUnitsCount);

  return [
    {
      id: "first",
      name: "Первое слово",
      subtitle: "У каждого пути есть начало",
      category: "Учёба",
      kind: "book",
      tone: "coral",
      current: firstCurrent,
      target: 1,
      unit: "урок",
      earned: firstCurrent >= 1,
      description: "Пройти первый урок лезгинского языка.",
      date: firstCurrent >= 1 ? date : undefined,
    },
    {
      id: "fire",
      name: "Хранитель огня",
      subtitle: "Маленький шаг. Каждый день.",
      category: "Постоянство",
      kind: "flame",
      tone: "gold",
      current: fireCurrent,
      target: 7,
      unit: "дней подряд",
      earned: fireCurrent >= 7,
      description: "Заниматься семь дней подряд и не дать огню погаснуть.",
      date: fireCurrent >= 7 ? date : undefined,
    },
    {
      id: "bridge",
      name: "Мост к общению",
      subtitle: "От слов — к разговору",
      category: "Учёба",
      kind: "bridge",
      tone: "ice",
      current: bridgeCurrent,
      target: 1,
      unit: "модуль",
      earned: bridgeCurrent >= 1,
      description: "Завершить модуль «Приветствия и знакомство».",
      date: bridgeCurrent >= 1 ? date : undefined,
    },
    {
      id: "tea",
      name: "Дорогой гость",
      subtitle: "Язык, который сближает",
      category: "Открытия",
      kind: "tea",
      tone: "jade",
      current: teaCurrent,
      target: 1,
      unit: "тема",
      earned: teaCurrent >= 1,
      description: "Пройти тему о гостеприимстве и семье.",
      date: teaCurrent >= 1 ? date : undefined,
    },
    {
      id: "words",
      name: "Собиратель слов",
      subtitle: "Твоя маленькая сокровищница",
      category: "Учёба",
      kind: "book",
      tone: "gold",
      current: wordsCurrent,
      target: 100,
      unit: "слов",
      earned: wordsCurrent >= 100,
      description: "Выучить первые сто слов.",
      date: wordsCurrent >= 100 ? date : undefined,
    },
    {
      id: "eagle",
      name: "Точный полёт",
      subtitle: "Ни одной ошибки",
      category: "Учёба",
      kind: "eagle",
      tone: "coral",
      current: eagleCurrent,
      target: 1,
      unit: "экзамен",
      earned: eagleCurrent >= 1,
      description: "Сдать экзамен модуля без ошибок.",
      date: eagleCurrent >= 1 ? date : undefined,
    },
    {
      id: "peak",
      name: "Новая вершина",
      subtitle: "Выше, чем вчера",
      category: "Учёба",
      kind: "mountain",
      tone: "ice",
      current: peakCurrent,
      target: 3,
      unit: "модуля",
      earned: peakCurrent >= 3,
      description: "Завершить три учебных модуля.",
      date: peakCurrent >= 3 ? date : undefined,
    },
    {
      id: "month",
      name: "Неугасимый",
      subtitle: "Привычка сильнее вдохновения",
      category: "Постоянство",
      kind: "flame",
      tone: "coral",
      current: monthCurrent,
      target: 30,
      unit: "дней подряд",
      earned: monthCurrent >= 30,
      description: "Поддерживать серию занятий тридцать дней.",
      date: monthCurrent >= 30 ? date : undefined,
    },
    {
      id: "roots",
      name: "Свои корни",
      subtitle: "Ближе к языку и культуре",
      category: "Открытия",
      kind: "tea",
      tone: "gold",
      current: rootsCurrent,
      target: 5,
      unit: "тем",
      earned: rootsCurrent >= 5,
      description: "Пройти пять тем о культуре, семье и традициях.",
      date: rootsCurrent >= 5 ? date : undefined,
    },
    {
      id: "library",
      name: "Живая библиотека",
      subtitle: "Слова становятся историями",
      category: "Учёба",
      kind: "book",
      tone: "jade",
      current: libraryCurrent,
      target: 500,
      unit: "слов",
      earned: libraryCurrent >= 500,
      description: "Пополнить словарный запас до пятисот слов.",
      date: libraryCurrent >= 500 ? date : undefined,
    },
    {
      id: "journey",
      name: "Дальний путь",
      subtitle: "Каждый день — новая встреча",
      category: "Постоянство",
      kind: "bridge",
      tone: "gold",
      current: journeyCurrent,
      target: 100,
      unit: "дней подряд",
      earned: journeyCurrent >= 100,
      description: "Заниматься сто дней подряд.",
      date: journeyCurrent >= 100 ? date : undefined,
    },
    {
      id: "summit",
      name: "Голос гор",
      subtitle: "Целый мир на родном языке",
      category: "Открытия",
      kind: "mountain",
      tone: "jade",
      current: summitCurrent,
      target: 11,
      unit: "модулей",
      earned: summitCurrent >= 11,
      description: "Завершить все одиннадцать модулей курса.",
      date: summitCurrent >= 11 ? date : undefined,
    },
  ];
}

// Default zero-state list when no learner progress is passed.
export const achievements: Achievement[] = buildLearnerAchievements({
  completedLessonsCount: 0,
  completedUnitsCount: 0,
  unit1Completed: false,
  hospitalityCompleted: false,
  cultureThemesCompleted: 0,
  perfectExamCount: 0,
  wordsLearned: 0,
  streakDays: 0,
});
