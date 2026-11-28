import { useId } from "react";
import type { BadgeKind, Achievement } from "./achievements";

function Emblem({ kind }: { kind: BadgeKind }) {
  switch (kind) {
    case "flame": return <><path d="M50 27C55 40 70 45 67 60C65 76 36 78 33 61C31 49 40 41 43 36C41 47 47 48 50 27Z" fill="var(--badge-bright)"/><path d="M51 49C55 57 60 60 57 67C53 74 42 70 43 63C44 58 48 55 51 49Z" fill="var(--badge-face)"/></>;
    case "book": return <><path d="M50 42Q38 34 28 38V66Q40 62 50 70Q60 62 72 66V38Q62 34 50 42Z" fill="var(--badge-bright)"/><path d="M50 43V67M33 45L43 47M33 52L43 54M57 47L67 45M57 54L67 52" fill="none" stroke="var(--badge-face)" strokeWidth="2.5" strokeLinecap="round"/><path d="M44 29L50 23L56 29L50 35Z" fill="var(--badge-edge)"/></>;
    case "bridge": return <><path d="M25 49L35 42H65L75 49V65H61C61 46 39 46 39 65H25Z" fill="var(--badge-bright)"/><path d="M27 42V35M73 42V35M26 70Q34 66 42 70T58 70T74 70" stroke="var(--badge-edge)" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M36 44V51M64 44V51" stroke="var(--badge-face)" strokeWidth="2"/></>;
    case "mountain": return <><path d="M22 68L43 34L55 51L64 39L79 68Z" fill="var(--badge-edge)"/><path d="M29 68L51 27L76 68Z" fill="var(--badge-bright)"/><path d="M40 48L51 27L63 49L54 44L49 49L45 44Z" fill="var(--badge-light)"/><path d="M51 49L45 67H67Z" fill="var(--badge-face)" opacity=".3"/></>;
    case "tea": return <><path d="M37 44H63L59 65H41Z" fill="var(--badge-bright)"/><path d="M63 47C78 44 74 60 61 59M33 70H67M44 34Q39 29 45 24M56 34Q51 29 57 24" fill="none" stroke="var(--badge-edge)" strokeWidth="3" strokeLinecap="round"/><path d="M44 50H56M46 57H54" stroke="var(--badge-face)" strokeWidth="2"/><path d="M50 36L54 40H46Z" fill="var(--badge-light)"/></>;
    case "eagle": return <><path d="M50 46C43 32 30 34 21 29C26 45 35 53 44 56L38 69L50 62L62 69L56 56C65 53 74 45 79 29C65 35 56 31 50 46Z" fill="var(--badge-bright)"/><path d="M30 39L43 48M70 39L57 48" stroke="var(--badge-face)" strokeWidth="2.5"/><path d="M48 44L51 39L58 43L52 46" fill="var(--badge-light)"/></>;
  }
}

export function AchievementBadge({ achievement, large = false }: { achievement: Achievement; large?: boolean }) {
  const id = useId().replace(/:/g, "");
  return <svg viewBox="0 0 100 112" className={`achievement-badge tone-${achievement.tone} ${achievement.earned ? "" : "is-locked"} ${large ? "badge-large" : ""}`} aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="var(--badge-light)"/><stop offset=".45" stopColor="var(--badge-edge)"/><stop offset="1" stopColor="var(--badge-shadow)"/></linearGradient>
      <linearGradient id={`${id}-face`} x2=".5" y2="1"><stop stopColor="var(--badge-face)"/><stop offset="1" stopColor="var(--badge-deep)"/></linearGradient>
    </defs>
    <path d="M25 73L21 105L37 98L48 108L52 77M53 77L62 108L73 98L89 103L78 72" fill="var(--badge-ribbon)"/>
    <path d="M29 77L27 96M73 77L79 96" stroke="var(--badge-edge)" opacity=".4" strokeWidth="2"/>
    <path d="M50 5L77 16L93 41L90 70L71 90L44 96L20 82L8 58L12 30L30 12Z" fill={`url(#${id}-metal)`}/>
    <path d="M50 12L73 22L85 43L82 66L66 83L45 88L26 77L15 56L19 34L34 19Z" fill={`url(#${id}-face)`} stroke="var(--badge-light)" strokeOpacity=".4"/>
    <path d="M32 25L50 19L68 26M24 61L32 74L45 80M73 62L66 74" fill="none" stroke="var(--badge-edge)" strokeWidth="1" opacity=".65"/>
    <Emblem kind={achievement.kind}/>
    <path d="M50 77L54 81L50 85L46 81Z" fill="var(--badge-edge)"/>
    {achievement.earned && <path d="M16 25H26M21 20V30" stroke="var(--badge-light)" strokeWidth="1.5" strokeLinecap="round"/>}
  </svg>;
}
