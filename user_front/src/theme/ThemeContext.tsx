import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ThemeColors } from './colors';

type ThemeMode = 'system' | 'light' | 'dark';
const THEME_STORAGE_KEY = 'travelsettle.themeMode';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const changed = useRef(false);
  const writes = useRef(Promise.resolve());
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then(saved => {
        if (active && !changed.current && (saved === 'system' || saved === 'light' || saved === 'dark')) setMode(saved);
      })
      .catch(error => console.warn('[theme] 저장된 테마 조회 실패', error));
    return () => { active = false; };
  }, []);

  const saveMode = (next: ThemeMode) => {
    changed.current = true;
    setMode(next);
    writes.current = writes.current.then(() => AsyncStorage.setItem(THEME_STORAGE_KEY, next))
      .catch(error => console.warn('[theme] 테마 저장 실패', error));
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const value = useMemo(() => ({ colors, isDark, mode, setMode: saveMode }), [colors, isDark, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
