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
    primary: 'hsl(25.71, 64.71%, 60.78%)', // Same as portal web primary
    background: 'hsl(95.10, 47.37%, 98.04%)', // Same as portal web background  
    surface: 'hsl(95.10, 47.37%, 98.04%)',
    card: 'hsl(95.10, 47.37%, 98.04%)', // Same as portal web card
    text: 'hsl(95.72, 28.57%, 34.31%)', // Same as portal web foreground
    textSecondary: 'hsl(97.42, 7.69%, 60.59%)', // Same as portal web muted-foreground
    border: 'hsl(97.36, 27.27%, 88.43%)', // Same as portal web border
    success: 'hsl(120, 45%, 55%)',
    warning: 'hsl(39, 95%, 60%)', 
    error: 'hsl(0, 72%, 60%)',
    info: 'hsl(25.71, 64.71%, 60.78%)',
    disabled: 'hsl(0, 0%, 74%)',
    shadow: 'hsl(0, 0%, 0%)',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: 'hsl(38.76, 63.16%, 67.25%)', // Same as portal web dark primary
    background: 'hsl(106.64, 36.36%, 26.67%)', // Same as portal web dark background
    surface: 'hsl(106.64, 36.36%, 26.67%)',
    card: 'hsl(106.64, 36.36%, 26.67%)', // Same as portal web dark card
    text: 'hsl(93.01, 70.59%, 80.59%)', // Same as portal web dark foreground
    textSecondary: 'hsl(99.07, 52.63%, 77.06%)', // Same as portal web dark muted-foreground
    border: 'hsl(106.89, 60.61%, 36.08%)', // Same as portal web dark border
    success: 'hsl(120, 45%, 65%)',
    warning: 'hsl(39, 85%, 70%)',
    error: 'hsl(0, 72%, 70%)',
    info: 'hsl(38.76, 63.16%, 67.25%)',
    disabled: 'hsl(0, 0%, 38%)',
    shadow: 'hsl(0, 0%, 0%)',
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