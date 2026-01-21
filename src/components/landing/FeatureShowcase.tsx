import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Platform,
    Dimensions,
} from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../../theme';
import { LightningIcon, ShieldIcon, UsersIcon } from '../icons/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeatureShowcaseProps {
    isRTL?: boolean;
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    accentColor: string;
    isRTL?: boolean;
}

/**
 * FeatureCard - Individual feature card with hover effects
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
    icon,
    title,
    description,
    accentColor,
    isRTL = false
}) => (
    <View style={[styles.featureCard, isRTL && styles.featureCardRTL]}>
        <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
            {icon}
        </View>
        <Text style={[styles.featureTitle, isRTL && styles.textRTL]}>{title}</Text>
        <Text style={[styles.featureDescription, isRTL && styles.textRTL]}>{description}</Text>
    </View>
);

/**
 * FeatureShowcase - 3-column feature cards section
 * Features: Hover lift animations, consistent icon styling, benefit-focused copy
 */
const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ isRTL = false }) => {
    const features = [
        {
            icon: <LightningIcon size={28} color="#8B5CF6" />,
            title: 'Lightning Fast',
            description: 'Post a job and receive bids from qualified pros within hours, not days.',
            accentColor: '#8B5CF6',
        },
        {
            icon: <ShieldIcon size={28} color="#10B981" />,
            title: 'Verified Professionals',
            description: 'Every pro is background-checked and verified for your peace of mind.',
            accentColor: '#10B981',
        },
        {
            icon: <UsersIcon size={28} color="#0369A1" />,
            title: 'Local Community',
            description: 'Support local professionals in your area and build lasting relationships.',
            accentColor: '#0369A1',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>WHY CHOOSE FIKS</Text>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                    Built for Speed, Trust & Quality
                </Text>
                <Text style={[styles.sectionSubtitle, isRTL && styles.textRTL]}>
                    We've made it simple to find the right professional for every job
                </Text>
            </View>

            <View style={[styles.featuresGrid, isRTL && styles.featuresGridRTL]}>
                {features.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        accentColor={feature.accentColor}
                        isRTL={isRTL}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 80,
        paddingHorizontal: 24,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        maxWidth: 600,
        alignSelf: 'center',
        marginBottom: 48,
    },
    sectionLabel: {
        fontSize: 13,
        fontFamily: FONTS.body.bold,
        color: '#8B5CF6',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 36,
        fontFamily: FONTS.heading.bold,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 16,
        ...Platform.select({
            web: {
                fontSize: 42,
            },
        }),
    },
    sectionSubtitle: {
        fontSize: 18,
        fontFamily: FONTS.body.regular,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 28,
    },
    textRTL: {
        textAlign: 'right',
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 24,
        maxWidth: 1100,
        alignSelf: 'center',
        width: '100%',
    },
    featuresGridRTL: {
        flexDirection: 'row-reverse',
    },
    featureCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 32,
        width: SCREEN_WIDTH > 900 ? 320 : SCREEN_WIDTH > 600 ? '45%' : '100%',
        minWidth: 280,
        maxWidth: 360,
        ...SHADOWS.card,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'all 0.3s ease',
            } as any,
        }),
    },
    featureCardRTL: {
        alignItems: 'flex-end',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    featureTitle: {
        fontSize: 20,
        fontFamily: FONTS.heading.bold,
        color: COLORS.text,
        marginBottom: 12,
    },
    featureDescription: {
        fontSize: 15,
        fontFamily: FONTS.body.regular,
        color: COLORS.textLight,
        lineHeight: 24,
    },
});

export default FeatureShowcase;
