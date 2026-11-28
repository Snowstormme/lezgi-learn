"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  Flame,
  Gem,
  LockKeyhole,
  Pin,
  Trophy,
  X,
} from "lucide-react";

import { Link } from "@/lib/i18n/routing";
import { pinProfileMedalAction } from "@/features/profile/actions";
import { AchievementBadge } from "./AchievementBadge";
import { achievements as defaultAchievements, type Achievement, type Category } from "./achievements";

const CATEGORIES: readonly Category[] = ["Все", "Учёба", "Постоянство", "Открытия"];

interface ProfilePreviewProps {
  homeHref?: string;
  profileHref?: string;
  sampleLabel?: string;
  items?: Achievement[];
  initialShowcase?: string | null;
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

  const [category, setCategory] = useState<Category>("Все");
  const [earnedOnly, setEarnedOnly] = useState(false);
  const [selected, setSelected] = useState<Achievement | null>(null);
  const [showcase, setShowcase] = useState<string>(resolvedInitialShowcase);
  const closeRef = useRef<HTMLButtonElement>(null);

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

  function handlePinMedal(medalId: string) {
    setShowcase(medalId);
    setSelected(null);
    void pinProfileMedalAction(medalId);
  }

  return (
    <div className="achievement-page">
      <nav className="profile-nav" aria-label="Основная навигация">
        <Link href={profileHref} className="profile-brand">
          <span className="brand-seal" aria-hidden="true">❖</span> ЛЕЗГИ<span className="brand-divider">/</span>
          <span className="brand-section">ПРОФИЛЬ</span>
        </Link>
        <Link href={homeHref} className="animation-link">
          <Compass aria-hidden="true" />
          Анимации
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </nav>

      <main className="profile-content">
        <div className="profile-heading">
          <span className="section-kicker">ЛИЧНЫЙ ПУТЬ</span>
          {sampleLabel && <span className="sample-label">{sampleLabel}</span>}
        </div>

        <section className="learner-section" aria-label="Профиль ученика">
          <div className="learner-info">
            <div className="learner-avatar" aria-hidden="true">
              <svg viewBox="0 0 80 80">
                <path d="M5 61L27 28L39 45L51 19L75 61Z" fill="var(--profile-jade)" />
                <path d="M37 44L51 19L64 45L54 39L49 44L45 39Z" fill="var(--profile-text)" />
                <path d="M15 63H66" stroke="var(--profile-gold)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="24" cy="18" r="5" fill="var(--profile-gold)" />
              </svg>
            </div>
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
