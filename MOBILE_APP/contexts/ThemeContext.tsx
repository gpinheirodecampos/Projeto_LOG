import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export interface Theme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    disabled: string;
    shadow: string;
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    // Palette aligned to portal index.css (OKLCH approximations)
    primary: '#4f46e5', // Indigo 600 ~ oklch(0.5461 0.2152 262.88)
    background: '#ffffff',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#1f1f1f', // ~ oklch(0.3211 0 0)
    textSecondary: '#6b7280', // slate-500 ~ muted-foreground
    border: '#e5e7eb', // gray-200 ~ oklch(0.9276 ...)
    success: '#16a34a', // green-600
    warning: '#f59e0b', // amber-500/600
    error: '#ef4444',   // red-500
    info: '#4f46e5',    // match primary
    disabled: '#d1d5db', // gray-300
    shadow: '#000000',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#8b8cf7', // lighter indigo for dark contrast
    background: '#0f1115', // ~ oklch(0.2046 0 0)
    surface: '#12151c',
    card: '#171923', // ~ oklch(0.2686 0 0)
    text: '#e5e7eb', // ~ oklch(0.9219 0 0)
    textSecondary: '#9ca3af', // ~ oklch(0.7155 0 0)
    border: '#2d3240', // ~ oklch(0.3715 0 0)
    success: '#22c55e', // green-500 (slightly brighter on dark)
    warning: '#fbbf24', // amber-400/500
    error: '#f87171',   // red-400/500
    info: '#8b8cf7',
    disabled: '#4b5563',
    shadow: '#000000',
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Use system preference as default
        const systemTheme = Appearance.getColorScheme();
        setIsDarkMode(systemTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    saveThemePreference(newMode);
  };

  const setDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
    saveThemePreference(enabled);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};