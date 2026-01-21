import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useTranslation } from '../i18n';

interface LanguageToggleProps {
    compact?: boolean;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ compact = false }) => {
    const { language, toggleLanguage, isRTL } = useTranslation();

    if (compact) {
        return (
            <TouchableOpacity
                style={styles.compactButton}
                onPress={toggleLanguage}
                activeOpacity={0.7}
            >
                <Text style={styles.compactText}>
                    {language === 'en' ? '🇮🇱' : '🇺🇸'}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={[styles.container, isRTL && styles.containerRTL]}>
            <TouchableOpacity
                style={[
                    styles.option,
                    language === 'en' && styles.optionActive,
                ]}
                onPress={() => language !== 'en' && toggleLanguage()}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.optionText,
                    language === 'en' && styles.optionTextActive,
                ]}>
                    EN
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.option,
                    language === 'he' && styles.optionActive,
                ]}
                onPress={() => language !== 'he' && toggleLanguage()}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.optionText,
                    language === 'he' && styles.optionTextActive,
                ]}>
                    עב
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        padding: 2,
        ...Platform.select({
            web: {
                cursor: 'pointer' as any,
            },
        }),
    },
    containerRTL: {
        flexDirection: 'row-reverse',
    },
    option: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    optionActive: {
        backgroundColor: '#6366F1',
    },
    optionText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    optionTextActive: {
        color: '#FFFFFF',
    },
    compactButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            web: {
                cursor: 'pointer' as any,
            },
        }),
    },
    compactText: {
        fontSize: 18,
    },
});

export default LanguageToggle;
