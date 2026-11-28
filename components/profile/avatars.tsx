import type { ReactNode } from "react";

export const AVATAR_PRESET_IDS = [
  "peaks",
  "eagle",
  "tower",
  "flame",
  "sumag",
  "samovar",
  "bridge",
  "crescent",
] as const;

export type AvatarPresetId = (typeof AVATAR_PRESET_IDS)[number];

export interface AvatarPreset {
  id: AvatarPresetId;
  name: string;
  subtitle: string;
}

export const AVATAR_PRESETS: readonly AvatarPreset[] = [
  {
    id: "peaks",
    name: "Горные вершины",
    subtitle: "Изумрудные хребты и солнце",
  },
  {
    id: "eagle",
    name: "Горный орёл",
    subtitle: "Свободный полёт над ущельем",
  },
  {
    id: "tower",
    name: "Башня аула",
    subtitle: "Древний камень и звёздное небо",
  },
  {
    id: "flame",
    name: "Огонь очага",
    subtitle: "Тепло родного дома",
  },
  {
    id: "sumag",
    name: "Узор сумаха",
    subtitle: "Ковровая звезда Лезгистана",
  },
  {
    id: "samovar",
    name: "Дорогой гость",
    subtitle: "Горячий чай и беседа",
  },
  {
    id: "bridge",
    name: "Каменный мост",
    subtitle: "Дорога через горную реку",
  },
  {
    id: "crescent",
    name: "Ночной Шалбуздаг",
    subtitle: "Полумесяц над снежной вершиной",
  },
] as const;

export const DEFAULT_AVATAR_ID: AvatarPresetId = "peaks";
export const CUSTOM_AVATAR_STORAGE_KEY = "lezgi_profile_avatar_custom";

export function isAvatarPresetId(value: string | null | undefined): value is AvatarPresetId {
  return Boolean(
    value && (AVATAR_PRESET_IDS as readonly string[]).includes(value),
  );
}

function renderPresetSvg(id: AvatarPresetId): ReactNode {
  switch (id) {
    case "peaks":
      return (
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <rect width="80" height="80" fill="oklch(0.22 0.045 245)" />
          <path d="M5 61L27 28L39 45L51 19L75 61Z" fill="var(--profile-jade)" />
          <path
            d="M37 44L51 19L64 45L54 39L49 44L45 39Z"
            fill="var(--profile-text)"
          />
          <path
            d="M15 63H66"
            stroke="var(--profile-gold)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="24" cy="18" r="5" fill="var(--profile-gold)" />
        </svg>
      );

    case "eagle":
      return (
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <rect width="80" height="80" fill="oklch(0.21 0.05 42)" />
          <circle cx="40" cy="24" r="14" fill="oklch(0.82 0.13 78 / 0.22)" />
          <path
            d="M40 38C34 26 22 28 12 22C17 38 26 45 34 48L29 61L40 54L51 61L46 48C54 45 63 38 68 22C58 28 46 26 40 38Z"
            fill="var(--profile-gold)"
          />
          <path
            d="M22 32L34 40M58 32L46 40"
            stroke="oklch(0.24 0.05 38)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path d="M38 36L40 31L45 35L41 38Z" fill="var(--profile-text)" />
        </svg>
      );

    case "tower":
      return (
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <rect width="80" height="80" fill="oklch(0.19 0.04 255)" />
          <circle cx="20" cy="18" r="2" fill="var(--profile-gold)" />
          <circle cx="61" cy="22" r="1.8" fill="var(--profile-text)" />
          <circle cx="54" cy="13" r="1.5" fill="var(--profile-gold)" />
          <path d="M8 66L28 46L44 58L62 41L74 66Z" fill="oklch(0.29 0.045 240)" />
          <path
            d="M29 22H51L55 64H25Z"
            fill="oklch(0.75 0.06 75)"
            stroke="var(--profile-gold)"
            strokeWidth="2"
          />
          <path
            d="M27 22V17H33V22M37 22V17H43V22M47 22V17H53V22"
            fill="var(--profile-gold)"
          />
          <rect
            x="36"
            y="31"
            width="8"
            height="12"
            rx="4"
            fill="oklch(0.2 0.04 248)"
          />
          <rect
            x="35"
            y="50"
            width="10"
            height="14"
            rx="5"
            fill="var(--profile-coral)"
          />
        </svg>
      );

    case "flame":
      return (
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <rect width="80" height="80" fill="oklch(0.2 0.055 28)" />
          <circle cx="40" cy="44" r="24" fill="oklch(0.67 0.17 34 / 0.18)" />
          <path
            d="M41 14C46 28 62 34 59 50C57 66 26 68 23 51C21 38 30 30 33 24C31 35 38 36 41 14Z"
            fill="var(--profile-coral)"
          />
          <path
            d="M42 35C46 43 52 47 49 56C45 64 32 60 33 51C34 45 39 42 42 35Z"
            fill="var(--profile-gold)"
          />
          <path
            d="M22 66H58"
            stroke="var(--profile-text)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>
      );

    case "sumag":
      return (
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <rect width="80" height="80" fill="oklch(0.21 0.05 18)" />
          <path
            d="M40 11L49 27L66 24L57 40L66 56L49 53L40 69L31 53L14 56L23 40L14 24L31 27Z"
            fill="var(--profile-coral)"
            stroke="var(--profile-gold)"
            strokeWidth="2"
          />
          <path
            d="M40 23L57 40L40 57L23 40Z"
            fill="var(--profile-Jade, oklch(0.68 0.1 172))"
            stroke="var(--profile-text)"
            strokeWidth="2"
          />
          <circle cx="40" cy="40" r="6" fill="var(--profile-gold)" />
        </svg>
      );

    case "samovar":
      return (
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <rect width="80" height="80" fill="oklch(0.2 0.045 182)" />
          <path
            d="M33 22Q28 17 34 12M45 22Q40 17 46 12"
            fill="none"
            stroke="var(--profile-gold)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path d="M25 32H53L49 56H29Z" fill="var(--profile-gold)" />
          <path
            d="M53 36C67 33 63 50 50 49M20 62H58"
            fill="none"
            stroke="var(--profile-jade)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M32 40H46M34 47H44"
            stroke="oklch(0.22 0.04 245)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path d="M39 24L44 29H34Z" fill="var(--profile-text)" />
        </svg>
      );

    case "bridge":
      return (
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <rect width="80" height="80" fill="oklch(0.2 0.045 232)" />
          <circle cx="58" cy="19" r="5" fill="var(--profile-gold)" />
          <path
            d="M12 39L24 31H56L68 39V56H53C53 36 27 36 27 56H12Z"
            fill="oklch(0.84 0.04 225)"
          />
          <path
            d="M14 63Q24 58 34 63T54 63T70 63"
            fill="none"
            stroke="var(--profile-jade)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M25 33V41M55 33V41"
            stroke="oklch(0.24 0.04 245)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "crescent":
      return (
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <rect width="80" height="80" fill="oklch(0.16 0.045 258)" />
          <path
            d="M52 16A11 11 0 1 0 62 31A9 9 0 1 1 52 16Z"
            fill="var(--profile-gold)"
          />
          <circle cx="22" cy="20" r="1.8" fill="var(--profile-text)" />
          <circle cx="35" cy="14" r="1.4" fill="var(--profile-gold)" />
          <path d="M6 64L29 31L42 47L56 24L74 64Z" fill="oklch(0.36 0.06 240)" />
          <path
            d="M21 43L29 31L37 43L31 39L27 43ZM47 39L56 24L65 41L58 36L53 40Z"
            fill="var(--profile-text)"
          />
          <path
            d="M14 64H66"
            stroke="var(--profile-jade)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function ProfileAvatarGraphic({
  avatarId,
  customDataUrl,
}: {
  avatarId?: string | null;
  customDataUrl?: string | null;
}) {
  if (avatarId === "custom" && customDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={customDataUrl}
        alt="Фото профиля"
        className="learner-avatar-img"
      />
    );
  }

  if (avatarId && avatarId.startsWith("data:image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarId}
        alt="Фото профиля"
        className="learner-avatar-img"
      />
    );
  }

  const presetId: AvatarPresetId = isAvatarPresetId(avatarId)
    ? avatarId
    : DEFAULT_AVATAR_ID;

  return renderPresetSvg(presetId);
}

/**
 * Resizes and center-crops an uploaded image file to a compact 160x160 JPEG data URL.
 */
export function resizeImageFileToDataUrl(file: File, size = 160): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Некорректный формат изображения"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas недоступен"));
          return;
        }
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
