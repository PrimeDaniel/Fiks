import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme color definitions
export const lightTheme = {
    mode: 'light' as const,
    background: '#F8FAFC',
    card: 'rgba(255, 255, 255, 0.95)',
    text: '#0F172A',
    textLight: '#475569',
    textMuted: '#64748B',
    primary: '#8B5CF6',
    secondary: '#EC4899',
    border: '#E2E8F0',
    navBg: 'rgba(255,255,255,0.95)',
    navShadow: '0 4px 20px rgba(0,0,0,0.1)',
    footerBg: '#0F172A',
};

export const darkTheme = {
    mode: 'dark' as const,
    background: '#0F172A',
    card: 'rgba(30, 41, 59, 0.95)',
    text: '#F1F5F9',
    textLight: '#94A3B8',
    textMuted: '#64748B',
    primary: '#A78BFA',
    secondary: '#F472B6',
    border: '#334155',
    navBg: 'rgba(15, 23, 42, 0.95)',
    navShadow: '0 4px 20px rgba(0,0,0,0.4)',
    footerBg: '#020617',
};

export type ThemeMode = 'light' | 'dark' | 'system';
export type Theme = typeof lightTheme | typeof darkTheme;

interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    isDark: boolean;
    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@fiks_theme_mode';

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved theme preference
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
                    setThemeModeState(savedTheme as ThemeMode);
                }
            } catch (error) {
                console.warn('Failed to load theme preference:', error);
            }
            setIsLoaded(true);
        };
        loadTheme();
    }, []);

    // Determine if dark mode should be active
    const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
    const theme = isDark ? darkTheme : lightTheme;

    // Save and set theme mode
    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    };

    // Toggle between light and dark
    const toggleTheme = () => {
        const newMode = isDark ? 'light' : 'dark';
        setThemeMode(newMode);
    };

    // Don't render until we've loaded the preference
    if (!isLoaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, themeMode, isDark, setThemeMode, toggleTheme }}>
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
