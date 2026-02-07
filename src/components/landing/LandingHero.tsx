import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, LAYOUT, SHADOWS } from '../../theme';
import { useTranslation } from '../../i18n';
import { ToolIcon, ShieldIcon, StarIcon, ArrowRightIcon } from '../icons/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LandingHeroProps {
    onFindPro: () => void;
    onBecomePro: () => void;
    isRTL?: boolean;
}

/**
 * LandingHero - Premium animated hero section with floating elements
 * Features: Gradient background, animated floating icons, trust badges, dual CTAs
 */
const LandingHero: React.FC<LandingHeroProps> = ({ onFindPro, onBecomePro, isRTL = false }) => {
    const { t } = useTranslation();

    // Floating animation values
    const float1 = useRef(new Animated.Value(0)).current;
    const float2 = useRef(new Animated.Value(0)).current;
    const float3 = useRef(new Animated.Value(0)).current;
    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeIn, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideUp, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous floating animations
        const createFloatAnimation = (animValue: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 2000 + delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0,
                        duration: 2000 + delay,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        createFloatAnimation(float1, 0).start();
        createFloatAnimation(float2, 300).start();
        createFloatAnimation(float3, 600).start();
    }, []);

    const getFloatStyle = (animValue: Animated.Value, offsetY: number) => ({
        transform: [
            {
                translateY: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, offsetY],
                }),
            },
        ],
    });

    return (
        <LinearGradient
            colors={['#8B5CF6', '#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroContainer}
        >
            {/* Decorative floating elements */}
            <Animated.View style={[styles.floatingIcon, styles.float1, getFloatStyle(float1, -15)]}>
                <View style={styles.floatingIconBg}>
                    <ToolIcon size={24} color="#8B5CF6" />
                </View>
            </Animated.View>
            <Animated.View style={[styles.floatingIcon, styles.float2, getFloatStyle(float2, -20)]}>
                <View style={styles.floatingIconBg}>
                    <ShieldIcon size={24} color="#10B981" />
                </View>
            </Animated.View>
            <Animated.View style={[styles.floatingIcon, styles.float3, getFloatStyle(float3, -12)]}>
                <View style={styles.floatingIconBg}>
                    <StarIcon size={24} color="#F59E0B" />
                </View>
            </Animated.View>

            {/* Dot pattern overlay */}
            <View style={styles.dotPattern} />

            {/* Hero content */}
            <Animated.View
                style={[
                    styles.heroContent,
                    {
                        opacity: fadeIn,
                        transform: [{ translateY: slideUp }],
                    },
                ]}
            >
                {/* Badge */}
                <View style={[styles.badge, isRTL && styles.badgeRTL]}>
                    <Text style={styles.badgeText}>✨ {t.landing.heroTrustedBy}</Text>
                </View>

                {/* Main headline */}
                <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
                    {t.landing.heroTitle}
                </Text>
                <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
                    {t.landing.heroSubtitle}
                </Text>

                {/* CTA Buttons */}
                <View style={[styles.ctaContainer, isRTL && styles.ctaContainerRTL]}>
                    <TouchableOpacity
                        style={[styles.primaryCta, isRTL && styles.primaryCtaRTL]}
                        onPress={onFindPro}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.primaryCtaText}>{t.landing.findAPro}</Text>
                        <ArrowRightIcon size={20} color="#8B5CF6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryCta}
                        onPress={onBecomePro}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryCtaText}>{t.landing.becomeAPro}</Text>
                    </TouchableOpacity>
                </View>

                {/* Trust indicators */}
                <View style={[styles.trustContainer, isRTL && styles.trustContainerRTL]}>
                    <View style={[styles.trustItem, isRTL && styles.trustItemRTL]}>
                        <ShieldIcon size={16} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.trustText}>{t.landing.verifiedPros}</Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={[styles.trustItem, isRTL && styles.trustItemRTL]}>
                        <StarIcon size={16} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.trustText}>{t.landing.avgRating}</Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={[styles.trustItem, isRTL && styles.trustItemRTL]}>
                        <ToolIcon size={16} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.trustText}>{t.landing.responseTime}</Text>
                    </View>
                </View>
            </Animated.View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    heroContainer: {
        minHeight: 520,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 60,
        position: 'relative',
        overflow: 'hidden',
    },
    dotPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        // Simulated dot pattern using background
        backgroundColor: 'transparent',
    },
    floatingIcon: {
        position: 'absolute',
        zIndex: 1,
    },
    floatingIconBg: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 12,
        ...SHADOWS.card,
    },
    float1: {
        top: '15%',
        right: '10%',
    },
    float2: {
        top: '35%',
        left: '5%',
    },
    float3: {
        bottom: '25%',
        right: '15%',
    },
    heroContent: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        zIndex: 2,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
        alignSelf: 'flex-start',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    badgeRTL: {
        alignSelf: 'flex-end',
    },
    badgeText: {
        color: 'white',
        fontSize: 14,
        fontFamily: FONTS.body.semiBold,
    },
    heroTitle: {
        fontSize: 48,
        fontFamily: FONTS.heading.bold,
        color: 'white',
        lineHeight: 56,
        marginBottom: 16,
        ...Platform.select({
            web: {
                fontSize: 56,
                lineHeight: 64,
            },
        }),
    },
    heroSubtitle: {
        fontSize: 18,
        fontFamily: FONTS.body.regular,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 28,
        marginBottom: 32,
    },
    textRTL: {
        textAlign: 'right',
    },
    ctaContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
        flexWrap: 'wrap',
    },
    ctaContainerRTL: {
        flexDirection: 'row-reverse',
    },
    primaryCta: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            } as any,
        }),
    },
    primaryCtaText: {
        fontSize: 16,
        fontFamily: FONTS.body.bold,
        color: '#8B5CF6',
    },
    secondaryCta: {
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            } as any,
        }),
    },
    secondaryCtaText: {
        fontSize: 16,
        fontFamily: FONTS.body.semiBold,
        color: 'white',
    },
    trustContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    trustContainerRTL: {
        flexDirection: 'row-reverse',
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        fontSize: 14,
        fontFamily: FONTS.body.regular,
        color: 'rgba(255,255,255,0.9)',
    },
    trustDivider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 8,
    },
    primaryCtaRTL: {
        flexDirection: 'row-reverse',
    },
    trustItemRTL: {
        flexDirection: 'row-reverse',
    },
});

export default LandingHero;
