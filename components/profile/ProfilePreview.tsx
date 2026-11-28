"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  Flame,
  Gem,
  ImagePlus,
  LockKeyhole,
  Pin,
  Trophy,
  X,
} from "lucide-react";

import { Link } from "@/lib/i18n/routing";
import {
  pinProfileMedalAction,
  updateProfileAvatarAction,
} from "@/features/profile/actions";
import { AchievementBadge } from "./AchievementBadge";
import {
  AVATAR_PRESETS,
  CUSTOM_AVATAR_STORAGE_KEY,
  DEFAULT_AVATAR_ID,
  isAvatarPresetId,
  ProfileAvatarGraphic,
  resizeImageFileToDataUrl,
} from "./avatars";
import {
  achievements as defaultAchievements,
  type Achievement,
  type Category,
} from "./achievements";

const CATEGORIES: readonly Category[] = ["Все", "Учёба", "Постоянство", "Открытия"];

interface ProfilePreviewProps {
  homeHref?: string;
  profileHref?: string;
  sampleLabel?: string;
  items?: Achievement[];
  initialShowcase?: string | null;
  initialAvatarId?: string | null;
  learnerName?: string;
  level?: number;
  subtitle?: string;
  streakLabel?: string;
  joinedLabel?: string;
  wordsLearned?: number;
  xp?: number;
}

export function ProfilePreview({
  homeHref = "/learn",
  profileHref = "/profile",
  sampleLabel,
  items = defaultAchievements,
  initialShowcase,
  initialAvatarId,
  learnerName = "Ученик",
  level = 1,
  subtitle = "Исследователь лезгинского языка",
  streakLabel = "0 дней подряд",
  joinedLabel = "В пути с ноября 2026",
  wordsLearned = 0,
  xp = 0,
}: ProfilePreviewProps) {
  const earned = items.filter((item) => item.earned);
  const resolvedInitialShowcase =
    (initialShowcase && earned.some((item) => item.id === initialShowcase)
      ? initialShowcase
      : earned[0]?.id) ?? "";

  const resolvedInitialAvatarId =
    initialAvatarId === "custom" || isAvatarPresetId(initialAvatarId)
      ? initialAvatarId
      : DEFAULT_AVATAR_ID;

  const [category, setCategory] = useState<Category>("Все");
  const [earnedOnly, setEarnedOnly] = useState(false);
  const [selected, setSelected] = useState<Achievement | null>(null);
  const [showcase, setShowcase] = useState<string>(resolvedInitialShowcase);

  const [avatarId, setAvatarId] = useState<string>(resolvedInitialAvatarId);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const closeRef = useRef<HTMLButtonElement>(null);
  const avatarCloseRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate saved custom photo data URL from localStorage if user previously uploaded one
  useEffect(() => {
    try {
      const savedCustom = window.localStorage.getItem(CUSTOM_AVATAR_STORAGE_KEY);
      if (savedCustom && savedCustom.startsWith("data:image/")) {
        setCustomAvatarUrl(savedCustom);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const featured =
    items.find((item) => item.id === showcase && item.earned) ?? earned[0];
  const filtered = items.filter(
    (item) =>
      (category === "Все" || item.category === category) &&
      (!earnedOnly || item.earned),
  );
  const progressPercent =
    items.length > 0 ? Math.round((earned.length / items.length) * 100) : 0;

  // The achievement window: focus the close button, close on Escape, keep the page still behind it.
  useEffect(() => {
    if (!selected) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  // The avatar picker window: focus close button, close on Escape, lock body scroll.
  useEffect(() => {
    if (!avatarDialogOpen) return;
    avatarCloseRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAvatarDialogOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [avatarDialogOpen]);

  function handlePinMedal(medalId: string) {
    setShowcase(medalId);
    setSelected(null);
    void pinProfileMedalAction(medalId);
  }

  function handleSelectAvatarPreset(nextId: string) {
    setUploadError(null);
    setAvatarId(nextId);
    void updateProfileAvatarAction(nextId);
  }

  async function handleCustomFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Выберите изображение (PNG, JPG или WebP).");
      return;
    }

    try {
      setUploadError(null);
      const resizedDataUrl = await resizeImageFileToDataUrl(file, 160);
      try {
        window.localStorage.setItem(CUSTOM_AVATAR_STORAGE_KEY, resizedDataUrl);
      } catch {
        // Ignore quota errors
      }
      setCustomAvatarUrl(resizedDataUrl);
      setAvatarId("custom");
      void updateProfileAvatarAction("custom");
    } catch {
      setUploadError("Не удалось обработать фото. Попробуйте другой файл.");
    }
  }

  const activePreset = AVATAR_PRESETS.find((preset) => preset.id === avatarId);

  return (
    <div className="achievement-page">
      <nav className="profile-nav" aria-label="Основная навигация">
        <Link
          href={homeHref}
          className="profile-brand"
          aria-label="Вернуться на главную"
          title="Вернуться на главную"
        >
          <ArrowLeft className="brand-back-icon" aria-hidden="true" />
          <span className="brand-seal" aria-hidden="true">❖</span> ЛЕЗГИ<span className="brand-divider">/</span>
          <span className="brand-section">ПРОФИЛЬ</span>
        </Link>
      </nav>

      <main className="profile-content">
        <div className="profile-heading">
          <span className="section-kicker">ЛИЧНЫЙ ПУТЬ</span>
          {sampleLabel && <span className="sample-label">{sampleLabel}</span>}
        </div>

        <section className="learner-section" aria-label="Профиль ученика">
          <div className="learner-info">
            <button
              type="button"
              className="learner-avatar"
              onClick={() => {
                setUploadError(null);
                setAvatarDialogOpen(true);
              }}
              aria-label="Изменить фото профиля"
              title="Изменить фото профиля"
            >
              <ProfileAvatarGraphic
                avatarId={avatarId}
                customDataUrl={customAvatarUrl}
              />
              <span className="learner-avatar-edit-badge" aria-hidden="true">
                <Camera />
              </span>
            </button>
            <div>
              <div className="learner-name-line">
                <h1>{learnerName}</h1>
                <span className="level-chip">УРОВЕНЬ {level}</span>
              </div>
              <p className="learner-subtitle">{subtitle}</p>
              <div className="learner-meta">
                <span>
                  <Flame aria-hidden="true" />
                  {streakLabel}
                </span>
                <span>{joinedLabel}</span>
              </div>
            </div>
          </div>

          {featured && (
            <div className="profile-showcase">
              <AchievementBadge achievement={featured} />
              <div>
                <span className="section-kicker">ЗНАК В ПРОФИЛЕ</span>
                <strong>{featured.name}</strong>
                <span className="showcase-caption">{featured.subtitle}</span>
              </div>
              <Pin size={14} aria-hidden="true" />
            </div>
          )}
        </section>

        <div className="profile-stats">
          <div>
            <BookOpen aria-hidden="true" />
            <strong>{wordsLearned.toLocaleString("ru-RU")}</strong>
            <span>слов выучено</span>
          </div>
          <div>
            <Gem aria-hidden="true" />
            <strong>{xp.toLocaleString("ru-RU")}</strong>
            <span>очков опыта</span>
          </div>
          <div>
            <Trophy aria-hidden="true" />
            <strong>
              {earned.length}
              <span className="stat-total"> / {items.length}</span>
            </strong>
            <span>наград открыто</span>
          </div>
        </div>

        <section className="collection-section">
          <div className="collection-heading">
            <div>
              <span className="section-kicker">ТВОЯ КОЛЛЕКЦИЯ</span>
              <h2>
                Каждый шаг — достижение<span className="title-dot">.</span>
              </h2>
            </div>
            <div className="collection-count">
              <span>{earned.length}</span> / {items.length}
              <span className="collection-caption">открыто</span>
            </div>
          </div>

          <div
            className="collection-track"
            role="progressbar"
            aria-label="Открытые достижения"
            aria-valuenow={earned.length}
            aria-valuemin={0}
            aria-valuemax={items.length}
          >
            <span style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="collection-tools">
            <div className="category-tabs" role="group" aria-label="Категория достижений">
              {CATEGORIES.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`btn category-tab ${category === tab ? "category-active" : ""}`}
                  aria-pressed={category === tab}
                  onClick={() => setCategory(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`btn earned-filter ${earnedOnly ? "filter-active" : ""}`}
              aria-pressed={earnedOnly}
              onClick={() => setEarnedOnly((current) => !current)}
            >
              <Check aria-hidden="true" />
              Только открытые
            </button>
          </div>

          <div className="achievement-grid">
            {filtered.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`btn achievement-card ${item.earned ? "earned-card" : "locked-card"}`}
                onClick={() => setSelected(item)}
                aria-label={`Открыть достижение «${item.name}»`}
              >
                <span className="card-topline">
                  <span>{item.category}</span>
                  {featured?.id === item.id ? (
                    <Pin aria-label="Выбрано для профиля" />
                  ) : item.earned ? (
                    <Check aria-label="Получено" />
                  ) : (
                    <LockKeyhole aria-label="Не открыто" />
                  )}
                </span>
                <AchievementBadge achievement={item} />
                <strong className="achievement-name">{item.name}</strong>
                <span className="achievement-subtitle">{item.subtitle}</span>
                <span className="card-bottom">
                  {item.earned ? (
                    <span className="earned-label">
                      <span />
                      Получено
                    </span>
                  ) : (
                    <>
                      <span
                        className="badge-progress"
                        role="progressbar"
                        aria-label={`Прогресс: ${item.name}`}
                        aria-valuenow={item.current}
                        aria-valuemin={0}
                        aria-valuemax={item.target}
                      >
                        <progress max={item.target} value={item.current} />
                      </span>
                      <span className="progress-caption">
                        {item.current} / {item.target} {item.unit}
                      </span>
                    </>
                  )}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="collection-empty">
              <LockKeyhole aria-hidden="true" />
              <h3>Эти открытия ещё впереди</h3>
              <button type="button" className="btn outline-button" onClick={() => setEarnedOnly(false)}>
                Показать будущие награды
              </button>
            </div>
          )}
        </section>

        <footer className="profile-footer">
          <span>Не скорость, а твой собственный путь.</span>
          <span className="footer-symbol" aria-hidden="true">✧</span>
          <span>ЛЕЗГИ · РАСТИ С КАЖДЫМ СЛОВОМ</span>
        </footer>
      </main>

      {avatarDialogOpen && (
        <>
          <div
            className="achievement-dialog-overlay"
            onClick={() => setAvatarDialogOpen(false)}
          />
          <div
            className="achievement-dialog avatar-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-dialog-title"
            aria-describedby="avatar-dialog-description"
          >
            <button
              type="button"
              ref={avatarCloseRef}
              className="btn dialog-close"
              aria-label="Закрыть"
              onClick={() => setAvatarDialogOpen(false)}
            >
              <X aria-hidden="true" />
            </button>
            <span className="section-kicker">ОБЛИК УЧЕНИКА</span>
            <div className="avatar-preview-hero">
              <ProfileAvatarGraphic
                avatarId={avatarId}
                customDataUrl={customAvatarUrl}
              />
            </div>
            <h2 id="avatar-dialog-title" className="dialog-title">
              Фото профиля
            </h2>
            <p id="avatar-dialog-description" className="dialog-description">
              {avatarId === "custom" && customAvatarUrl
                ? "Загружено ваше собственное фото"
                : `${activePreset?.name ?? "Горные вершины"} — ${activePreset?.subtitle ?? "Изумрудные хребты и солнце"}`}
            </p>

            <div
              className="avatar-preset-grid"
              role="group"
              aria-label="Готовые варианты аватара"
            >
              {AVATAR_PRESETS.map((preset) => {
                const isActive = avatarId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`btn avatar-preset-option ${isActive ? "is-active" : ""}`}
                    aria-pressed={isActive}
                    onClick={() => handleSelectAvatarPreset(preset.id)}
                  >
                    <span className="avatar-preset-thumb">
                      <ProfileAvatarGraphic avatarId={preset.id} />
                    </span>
                    <span className="avatar-preset-label">{preset.name}</span>
                    {isActive && (
                      <span className="avatar-preset-check" aria-hidden="true">
                        <Check />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="avatar-upload-row">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleCustomFileChange}
              />
              <button
                type="button"
                className="btn avatar-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus aria-hidden="true" />
                {customAvatarUrl ? "Загрузить другое фото с устройства" : "Загрузить своё фото с устройства"}
              </button>
              {uploadError && (
                <span className="avatar-upload-error">{uploadError}</span>
              )}
            </div>

            <button
              type="button"
              className="btn pin-button"
              onClick={() => setAvatarDialogOpen(false)}
            >
              <Check aria-hidden="true" />
              Готово
            </button>
          </div>
        </>
      )}

      {selected && (
        <>
          <div className="achievement-dialog-overlay" onClick={() => setSelected(null)} />
          <div
            className="achievement-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievement-dialog-title"
            aria-describedby="achievement-dialog-description"
          >
            <button
              type="button"
              ref={closeRef}
              className="btn dialog-close"
              aria-label="Закрыть"
              onClick={() => setSelected(null)}
            >
              <X aria-hidden="true" />
            </button>
            <span className="section-kicker">
              {selected.category} · {selected.earned ? "НАГРАДА ПОЛУЧЕНА" : "ВПЕРЕДИ"}
            </span>
            <AchievementBadge achievement={selected} large />
            <h2 id="achievement-dialog-title" className="dialog-title">
              {selected.name}
            </h2>
            <p id="achievement-dialog-description" className="dialog-description">
              {selected.description}
            </p>
            {selected.earned ? (
              <>
                <p className="dialog-date">
                  <Check aria-hidden="true" />
                  Получено{selected.date ? ` ${selected.date}` : ""}
                </p>
                <button
                  type="button"
                  className="btn pin-button"
                  disabled={featured?.id === selected.id}
                  onClick={() => handlePinMedal(selected.id)}
                >
                  <Pin aria-hidden="true" />
                  {featured?.id === selected.id ? "Уже в профиле" : "Поставить в профиль"}
                </button>
              </>
            ) : (
              <>
                <div className="dialog-progress">
                  <span>
                    {selected.current} / {selected.target} {selected.unit}
                  </span>
                  <progress max={selected.target} value={selected.current} />
                </div>
                <button type="button" className="btn outline-button" onClick={() => setSelected(null)}>
                  <ArrowLeft aria-hidden="true" />
                  К коллекции
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
