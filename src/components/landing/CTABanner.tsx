import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../theme';
import { useTranslation } from '../../i18n';
import { ArrowRightIcon } from '../icons/Icons';

interface CTABannerProps {
    onGetStarted: () => void;
    isRTL?: boolean;
}

/**
 * CTABanner - Bottom call-to-action section with gradient background
 * Features: Compelling headline, gradient background, prominent button
 */
const CTABanner: React.FC<CTABannerProps> = ({ onGetStarted, isRTL = false }) => {
    const { t } = useTranslation();

    return (
        <LinearGradient
            colors={['#8B5CF6', '#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* Decorative circles */}
            <View style={[styles.decorCircle, styles.decorCircle1]} />
            <View style={[styles.decorCircle, styles.decorCircle2]} />

            <View style={styles.content}>
                <Text style={[styles.ctaTitle, isRTL && styles.textRTL]}>
                    {t.landing.ctaTitle}
                </Text>
                <Text style={[styles.ctaSubtitle, isRTL && styles.textRTL]}>
                    {t.landing.ctaSubtitle}
                </Text>

                <TouchableOpacity
                    style={[styles.ctaButton, isRTL && styles.ctaButtonRTL]}
                    onPress={onGetStarted}
                    activeOpacity={0.9}
                >
                    <Text style={styles.ctaButtonText}>{t.landing.postJobNow}</Text>
                    <ArrowRightIcon size={20} color="#8B5CF6" />
                </TouchableOpacity>

                <Text style={[styles.ctaNote, isRTL && styles.textRTL]}>
                    {t.landing.ctaNote}
                </Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 80,
        paddingHorizontal: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorCircle1: {
        width: 400,
        height: 400,
        top: -200,
        right: -100,
    },
    decorCircle2: {
        width: 300,
        height: 300,
        bottom: -150,
        left: -100,
    },
    content: {
        maxWidth: 600,
        alignSelf: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    ctaTitle: {
        fontSize: 36,
        fontFamily: FONTS.heading.bold,
        color: 'white',
        textAlign: 'center',
        marginBottom: 16,
        ...Platform.select({
            web: {
                fontSize: 42,
            },
        }),
    },
    ctaSubtitle: {
        fontSize: 18,
        fontFamily: FONTS.body.regular,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 32,
    },
    textRTL: {
        textAlign: 'right',
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 32,
        paddingVertical: 18,
        borderRadius: 14,
        gap: 10,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            } as any,
        }),
    },
    ctaButtonRTL: {
        flexDirection: 'row-reverse',
    },
    ctaButtonText: {
        fontSize: 18,
        fontFamily: FONTS.body.bold,
        color: '#8B5CF6',
    },
    ctaNote: {
        marginTop: 20,
        fontSize: 14,
        fontFamily: FONTS.body.regular,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
});

export default CTABanner;
