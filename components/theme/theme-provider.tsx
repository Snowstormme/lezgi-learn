'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SiteTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'lezgi-theme';

interface ThemeContextValue {
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

function applyThemeToDom(theme: SiteTheme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0B132B' : '#F5F7FA');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SiteTheme>('light');

  useEffect(() => {
    let initial: SiteTheme = 'light';
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        initial = saved;
      } else if (document.documentElement.classList.contains('dark')) {
        initial = 'dark';
      }
    } catch {
      // Ignore storage errors (private mode / blocked storage)
    }
    setThemeState(initial);
    applyThemeToDom(initial);
  }, []);

  const setTheme = useCallback((next: SiteTheme) => {
    setThemeState(next);
    applyThemeToDom(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: SiteTheme = current === 'dark' ? 'light' : 'dark';
      applyThemeToDom(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Включить светлую тему' : 'Включить тёмную тему';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'duo-card-3d flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-b-[3px] border-border bg-card text-foreground transition-colors hover:border-primary/60',
        className
      )}
    >
      {isDark ? (
        <Sun className="h-[17px] w-[17px] text-[#FFC800]" aria-hidden="true" />
      ) : (
        <Moon className="h-[17px] w-[17px] text-foreground" aria-hidden="true" />
      )}
    </button>
  );
}
