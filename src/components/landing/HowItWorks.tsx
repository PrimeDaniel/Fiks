import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Platform,
    Dimensions,
} from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../../theme';
import { BriefcaseIcon, UsersIcon, CheckCircleIcon, ArrowRightIcon } from '../icons/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HowItWorksProps {
    isRTL?: boolean;
}

interface StepCardProps {
    stepNumber: number;
    icon: React.ReactNode;
    title: string;
    description: string;
    isLast?: boolean;
    isRTL?: boolean;
}

/**
 * StepCard - Individual step in the process
 */
const StepCard: React.FC<StepCardProps> = ({
    stepNumber,
    icon,
    title,
    description,
    isLast = false,
    isRTL = false
}) => (
    <View style={[styles.stepContainer, isRTL && styles.stepContainerRTL]}>
        <View style={styles.stepCard}>
            {/* Step number badge */}
            <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{stepNumber}</Text>
            </View>

            {/* Icon */}
            <View style={styles.stepIconContainer}>
                {icon}
            </View>

            {/* Content */}
            <Text style={[styles.stepTitle, isRTL && styles.textRTL]}>{title}</Text>
            <Text style={[styles.stepDescription, isRTL && styles.textRTL]}>{description}</Text>
        </View>

        {/* Connector arrow (not on last item) */}
        {!isLast && SCREEN_WIDTH > 768 && (
            <View style={[styles.connector, isRTL && styles.connectorRTL]}>
                <ArrowRightIcon size={24} color={COLORS.gray[300]} />
            </View>
        )}
    </View>
);

/**
 * HowItWorks - Visual 3-step process section
 * Shows the journey: Post → Get Bids → Complete
 */
const HowItWorks: React.FC<HowItWorksProps> = ({ isRTL = false }) => {
    const steps = [
        {
            icon: <BriefcaseIcon size={32} color="#8B5CF6" />,
            title: 'Post Your Job',
            description: 'Describe what you need done, set your budget, and upload photos if needed.',
        },
        {
            icon: <UsersIcon size={32} color="#EC4899" />,
            title: 'Get Bids from Pros',
            description: 'Receive competitive bids from verified local professionals in your area.',
        },
        {
            icon: <CheckCircleIcon size={32} color="#10B981" />,
            title: 'Choose & Complete',
            description: 'Compare reviews, pick your favorite pro, and get the job done right.',
        },
    ];

    return (
        <View style={styles.container}>
            {/* Background decoration */}
            <View style={styles.bgDecoration} />

            <View style={styles.headerContainer}>
                <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>HOW IT WORKS</Text>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                    Three Simple Steps
                </Text>
                <Text style={[styles.sectionSubtitle, isRTL && styles.textRTL]}>
                    From posting to completion, we make it effortless
                </Text>
            </View>

            <View style={[styles.stepsContainer, isRTL && styles.stepsContainerRTL]}>
                {steps.map((step, index) => (
                    <StepCard
                        key={index}
                        stepNumber={index + 1}
                        icon={step.icon}
                        title={step.title}
                        description={step.description}
                        isLast={index === steps.length - 1}
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
        backgroundColor: 'white',
        position: 'relative',
        overflow: 'hidden',
    },
    bgDecoration: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#8B5CF610',
    },
    headerContainer: {
        maxWidth: 600,
        alignSelf: 'center',
        marginBottom: 56,
        zIndex: 1,
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
    stepsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
        maxWidth: 1100,
        alignSelf: 'center',
        width: '100%',
        zIndex: 1,
    },
    stepsContainerRTL: {
        flexDirection: 'row-reverse',
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    stepContainerRTL: {
        flexDirection: 'row-reverse',
    },
    stepCard: {
        backgroundColor: COLORS.background,
        borderRadius: 24,
        padding: 32,
        width: SCREEN_WIDTH > 900 ? 300 : SCREEN_WIDTH > 600 ? 280 : '100%',
        minWidth: 260,
        maxWidth: 320,
        alignItems: 'center',
        position: 'relative',
        ...SHADOWS.card,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    stepBadge: {
        position: 'absolute',
        top: -12,
        left: '50%',
        marginLeft: -16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.card,
    },
    stepBadgeText: {
        fontSize: 14,
        fontFamily: FONTS.body.bold,
        color: 'white',
    },
    stepIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 8,
        ...SHADOWS.card,
    },
    stepTitle: {
        fontSize: 20,
        fontFamily: FONTS.heading.bold,
        color: COLORS.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    stepDescription: {
        fontSize: 15,
        fontFamily: FONTS.body.regular,
        color: COLORS.textLight,
        lineHeight: 24,
        textAlign: 'center',
    },
    connector: {
        marginHorizontal: 16,
        opacity: 0.5,
    },
    connectorRTL: {
        transform: [{ scaleX: -1 }],
    },
});

export default HowItWorks;
