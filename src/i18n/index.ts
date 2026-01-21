import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { I18nManager, Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, Translations } from './types';
import { en } from './locales/en';
import { he } from './locales/he';

const LANGUAGE_STORAGE_KEY = '@fiks_language';

const translations: Record<Language, Translations> = {
    en,
    he,
};

// Get device language
const getDeviceLanguage = (): Language => {
    let deviceLanguage = 'en';
    
    if (Platform.OS === 'web') {
        deviceLanguage = navigator.language?.split('-')[0] || 'en';
    } else if (Platform.OS === 'ios') {
        deviceLanguage = NativeModules.SettingsManager?.settings?.AppleLocale?.split('_')[0] ||
            NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]?.split('-')[0] || 'en';
    } else if (Platform.OS === 'android') {
        deviceLanguage = NativeModules.I18nManager?.localeIdentifier?.split('_')[0] || 'en';
    }
    
    return deviceLanguage === 'he' ? 'he' : 'en';
};

interface I18nContextType {
    language: Language;
    t: Translations;
    setLanguage: (lang: Language) => Promise<void>;
    isRTL: boolean;
    toggleLanguage: () => Promise<void>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
    children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [isInitialized, setIsInitialized] = useState(false);

    // Load saved language preference on mount
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
                if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'he')) {
                    setLanguageState(savedLanguage);
                    updateRTL(savedLanguage);
                } else {
                    // Use device language as default
                    const deviceLang = getDeviceLanguage();
                    setLanguageState(deviceLang);
                    updateRTL(deviceLang);
                }
            } catch (error) {
                console.error('Error loading language preference:', error);
            } finally {
                setIsInitialized(true);
            }
        };
        loadLanguage();
    }, []);

    const updateRTL = (lang: Language) => {
        const shouldBeRTL = lang === 'he';
        if (I18nManager.isRTL !== shouldBeRTL) {
            I18nManager.allowRTL(shouldBeRTL);
            I18nManager.forceRTL(shouldBeRTL);
            // Note: On native, app may need to reload for RTL changes to take effect
        }
    };

    const setLanguage = useCallback(async (lang: Language) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
            setLanguageState(lang);
            updateRTL(lang);
        } catch (error) {
            console.error('Error saving language preference:', error);
        }
    }, []);

    const toggleLanguage = useCallback(async () => {
        const newLang = language === 'en' ? 'he' : 'en';
        await setLanguage(newLang);
    }, [language, setLanguage]);

    const isRTL = language === 'he';
    const t = translations[language];

    const value: I18nContextType = {
        language,
        t,
        setLanguage,
        isRTL,
        toggleLanguage,
    };

    // Don't render children until language is loaded
    if (!isInitialized) {
        return null;
    }

    return React.createElement(I18nContext.Provider, { value }, children);
};

// Hook to access translations
export const useTranslation = (): I18nContextType => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
};

// Helper to get category name translation
export const getCategoryTranslation = (t: Translations, category: string): string => {
    const categoryMap: Record<string, keyof Translations['categories']> = {
        'All': 'all',
        'Electricity': 'electricity',
        'Plumbing': 'plumbing',
        'Assembly': 'assembly',
        'Moving': 'moving',
        'Painting': 'painting',
    };
    const key = categoryMap[category];
    return key ? t.categories[key] : category;
};

// Helper to get status translation
export const getStatusTranslation = (t: Translations, status: string): string => {
    const statusMap: Record<string, keyof Translations['status']> = {
        'Open': 'open',
        'In Progress': 'inProgress',
        'Completed': 'completed',
        'Pending': 'pending',
        'Accepted': 'accepted',
        'Rejected': 'rejected',
        'Approved': 'approved',
    };
    const key = statusMap[status];
    return key ? t.status[key] : status;
};

// Helper for time ago with translations
export const getTimeAgoTranslation = (
    t: Translations, 
    dateString: string
): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t.jobCard.justNow;
    if (diffMins < 60) return `${diffMins}${t.jobCard.minutesAgo}`;
    if (diffHours < 24) return `${diffHours}${t.jobCard.hoursAgo}`;
    if (diffDays < 7) return `${diffDays}${t.jobCard.daysAgo}`;
    return date.toLocaleDateString();
};

export { Language, Translations };
