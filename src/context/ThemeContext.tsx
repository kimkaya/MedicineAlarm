import React, {createContext, useContext, useState, useEffect} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../theme/colors';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  colors: typeof Colors.light;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(savedMode => {
      if (savedMode) {
        setThemeModeState(savedMode as ThemeMode);
      }
    });
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const isDark =
    themeMode === 'auto'
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';

  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{isDark, themeMode, colors, setThemeMode}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
