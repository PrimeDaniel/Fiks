import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../theme';
import { BriefcaseIcon, UsersIcon, StarIcon, MapPinIcon } from '../icons/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StatsSectionProps {
    isRTL?: boolean;
}

interface StatItemProps {
    icon: React.ReactNode;
    value: number;
    suffix?: string;
    label: string;
    delay: number;
    isRTL?: boolean;
}

/**
 * AnimatedCounter - Counts up from 0 to target value
 */
const AnimatedCounter: React.FC<{ value: number; suffix?: string; delay: number }> = ({
    value,
    suffix = '',
    delay
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timeout = setTimeout(() => {
            Animated.timing(animatedValue, {
                toValue: value,
                duration: 2000,
                useNativeDriver: false,
            }).start();

            animatedValue.addListener(({ value: animValue }) => {
                setDisplayValue(Math.floor(animValue));
            });
        }, delay);

        return () => {
            clearTimeout(timeout);
            animatedValue.removeAllListeners();
        };
    }, [value, delay]);

    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
        }
        return num.toString();
    };

    return (
        <Text style={styles.statValue}>
            {formatNumber(displayValue)}{suffix}
        </Text>
    );
};

/**
 * StatItem - Individual stat with icon and animated counter
 */
const StatItem: React.FC<StatItemProps> = ({
    icon,
    value,
    suffix = '',
    label,
    delay,
    isRTL = false
}) => (
    <View style={[styles.statItem, isRTL && styles.statItemRTL]}>
        <View style={styles.statIconContainer}>
            {icon}
        </View>
        <AnimatedCounter value={value} suffix={suffix} delay={delay} />
        <Text style={[styles.statLabel, isRTL && styles.textRTL]}>{label}</Text>
    </View>
);

/**
 * StatsSection - Animated counter section with key metrics
 * Features: Count-up animation, gradient background, responsive grid
 */
const StatsSection: React.FC<StatsSectionProps> = ({ isRTL = false }) => {
    const stats = [
        {
            icon: <BriefcaseIcon size={28} color="white" />,
            value: 50000,
            suffix: '+',
            label: 'Jobs Completed',
        },
        {
            icon: <UsersIcon size={28} color="white" />,
            value: 10000,
            suffix: '+',
            label: 'Happy Customers',
        },
        {
            icon: <StarIcon size={28} color="white" />,
            value: 2500,
            suffix: '+',
            label: 'Verified Pros',
        },
        {
            icon: <MapPinIcon size={28} color="white" />,
            value: 150,
            suffix: '+',
            label: 'Cities Served',
        },
    ];

    return (
        <LinearGradient
            colors={['#0F172A', '#1E293B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* Decorative elements */}
            <View style={[styles.decorCircle, styles.decorCircle1]} />
            <View style={[styles.decorCircle, styles.decorCircle2]} />

            <View style={styles.content}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>BY THE NUMBERS</Text>
                    <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                        Trusted by Thousands
                    </Text>
                </View>

                <View style={[styles.statsGrid, isRTL && styles.statsGridRTL]}>
                    {stats.map((stat, index) => (
                        <StatItem
                            key={index}
                            icon={stat.icon}
                            value={stat.value}
                            suffix={stat.suffix}
                            label={stat.label}
                            delay={index * 200}
                            isRTL={isRTL}
                        />
                    ))}
                </View>
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
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
    },
    decorCircle1: {
        width: 300,
        height: 300,
        top: -100,
        left: -100,
    },
    decorCircle2: {
        width: 200,
        height: 200,
        bottom: -50,
        right: -50,
    },
    content: {
        maxWidth: 1100,
        alignSelf: 'center',
        width: '100%',
        zIndex: 1,
    },
    headerContainer: {
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
        color: 'white',
        textAlign: 'center',
        ...Platform.select({
            web: {
                fontSize: 42,
            },
        }),
    },
    textRTL: {
        textAlign: 'right',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 32,
    },
    statsGridRTL: {
        flexDirection: 'row-reverse',
    },
    statItem: {
        alignItems: 'center',
        minWidth: 140,
        padding: 16,
    },
    statItemRTL: {
        alignItems: 'flex-end',
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    statValue: {
        fontSize: 40,
        fontFamily: FONTS.heading.bold,
        color: 'white',
        marginBottom: 8,
        ...Platform.select({
            web: {
                fontSize: 48,
            },
        }),
    },
    statLabel: {
        fontSize: 14,
        fontFamily: FONTS.body.regular,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
});

export default StatsSection;
