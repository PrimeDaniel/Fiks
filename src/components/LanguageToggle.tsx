import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform, Animated } from 'react-native';
import { useTranslation } from '../i18n';

interface LanguageToggleProps {
    compact?: boolean;
}

/**
 * LanguageToggle - Animated language switcher with sliding indicator
 * Features smooth transitions when switching between EN and Hebrew
 */
const LanguageToggle: React.FC<LanguageToggleProps> = ({ compact = false }) => {
    const { language, toggleLanguage, isRTL } = useTranslation();
    const slideAnim = useRef(new Animated.Value(language === 'en' ? 0 : 1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animate the sliding indicator
        Animated.spring(slideAnim, {
            toValue: language === 'en' ? 0 : 1,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
        }).start();
    }, [language]);

    const handlePress = () => {
        // Bounce animation on press
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 200,
                friction: 10,
            }),
        ]).start();

        toggleLanguage();
    };

    if (compact) {
        return (
            <TouchableOpacity
                style={styles.compactButton}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Animated.Text style={[styles.compactText, { transform: [{ scale: scaleAnim }] }]}>
                    {language === 'en' ? 'עב' : 'EN'}
                </Animated.Text>
            </TouchableOpacity>
        );
    }

    // Calculate indicator width (each option is ~40px)
    const optionWidth = 40;

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            {/* Sliding indicator background */}
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        width: optionWidth,
                        transform: [
                            {
                                translateX: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: isRTL ? [optionWidth, 0] : [0, optionWidth],
                                }),
                            },
                        ],
                    },
                ]}
            />

            {/* Language options */}
            <TouchableOpacity
                style={styles.option}
                onPress={() => language !== 'en' && handlePress()}
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
                style={styles.option}
                onPress={() => language !== 'he' && handlePress()}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.optionText,
                    language === 'he' && styles.optionTextActive,
                ]}>
                    עב
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        position: 'relative',
        ...Platform.select({
            web: {
                cursor: 'pointer' as any,
            },
        }),
    },
    indicator: {
        position: 'absolute',
        top: 4,
        left: 4,
        bottom: 4,
        backgroundColor: '#8B5CF6',
        borderRadius: 8,
        zIndex: 0,
    },
    option: {
        width: 40,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    optionText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    optionTextActive: {
        color: '#FFFFFF',
    },
    compactButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
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
        fontSize: 14,
        fontWeight: '700',
        color: '#8B5CF6',
    },
});

export default LanguageToggle;
