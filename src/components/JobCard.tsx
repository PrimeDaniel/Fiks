import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated } from 'react-native';
import { Job } from '../types/database';
import { useTranslation, getTimeAgoTranslation, getCategoryTranslation } from '../i18n';
import { useResponsive, LAYOUT as RESPONSIVE_LAYOUT } from '../utils/responsive';
import { COLORS, FONTS, SHADOWS, LAYOUT as THEME_LAYOUT } from '../theme';

type Props = {
    job: Job;
    isPro: boolean;
    onAccept?: (jobId: string) => void;
    onPress?: (job: Job) => void;
    index?: number;
};

const CATEGORY_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
    'Electricity': { icon: '⚡', color: '#F59E0B', bgColor: '#FFFBEB' },
    'Plumbing': { icon: '🔧', color: '#3B82F6', bgColor: '#EFF6FF' },
    'Assembly': { icon: '🔨', color: '#F97316', bgColor: '#FFF7ED' },
    'Moving': { icon: '📦', color: '#10B981', bgColor: '#ECFDF5' },
    'Painting': { icon: '🎨', color: '#EC4899', bgColor: '#FDF2F8' },
};

const getAvatarColor = (name: string): string => {
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

const JobCard: React.FC<Props> = ({ job, isPro, onAccept, onPress, index = 0 }) => {
    const { t, isRTL } = useTranslation();
    const responsive = useResponsive();
    const [isHovered, setIsHovered] = useState(false);

    // Animations
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 100, // Staggered effect
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay: index * 100,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

    const categoryConfig = CATEGORY_CONFIG[job.category] || { icon: '📋', color: '#6B7280', bgColor: '#F3F4F6' };
    const timeAgo = getTimeAgoTranslation(t, job.created_at);
    const avatarColor = getAvatarColor(job.profile?.full_name || 'U');
    const initials = job.profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    // Engagement stats
    const viewsCount = job.views_count || Math.floor(Math.random() * 50) + 10;
    const bidsCount = job.bids?.length || 0;
    const savesCount = job.saves_count || Math.floor(Math.random() * 10);

    const handlePress = () => {
        if (onPress) {
            onPress(job);
        }
    };

    const webHoverProps = Platform.OS === 'web' ? {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
    } : {};

    return (
        <AnimatedTouchableOpacity
            style={[
                styles.card,
                responsive.isWeb && styles.cardWeb,
                isHovered && styles.cardHovered,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }
            ]}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            {...webHoverProps}
        >
            {/* Card Header - User Info */}
            <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
                <View style={[styles.userSection, isRTL && styles.rowRTL]}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <View style={[styles.nameRow, isRTL && styles.rowRTL]}>
                            <Text style={[styles.userName, isRTL && styles.textRTL]}>
                                {job.profile?.full_name || 'Anonymous'}
                            </Text>
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedIcon}>✓</Text>
                            </View>
                        </View>
                        <Text style={[styles.timeAgo, isRTL && styles.textRTL]}>{timeAgo}</Text>
                    </View>
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.bgColor }]}>
                    <Text style={styles.categoryIcon}>{categoryConfig.icon}</Text>
                    <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                        {getCategoryTranslation(t, job.category)}
                    </Text>
                </View>
            </View>

            {/* Card Body - Job Content */}
            <View style={styles.cardBody}>
                <Text style={[styles.jobTitle, isRTL && styles.textRTL]}>{job.title}</Text>

                {/* Price Tag - Hero Element */}
                <View style={[styles.priceSection, isRTL && styles.rowRTL]}>
                    <View style={styles.priceTag}>
                        <Text style={styles.priceCurrency}>$</Text>
                        <Text style={styles.priceAmount}>{job.price_offer}</Text>
                    </View>
                    {job.allow_counter_offers && (
                        <View style={styles.negotiableBadge}>
                            <Text style={styles.negotiableText}>{t.jobCard.negotiable}</Text>
                        </View>
                    )}
                </View>

                <Text style={[styles.description, isRTL && styles.textRTL]} numberOfLines={3}>
                    {job.description}
                </Text>

                {/* Schedule Info */}
                {job.schedule_description && (
                    <View style={[styles.scheduleBox, isRTL && styles.rowRTL]}>
                        <Text style={[styles.scheduleIcon, isRTL && styles.iconRTL]}>📅</Text>
                        <Text style={[styles.scheduleText, isRTL && styles.textRTL]}>
                            {job.schedule_description}
                        </Text>
                    </View>
                )}
            </View>

            {/* Card Footer - Engagement Stats & Actions */}
            <View style={[styles.cardFooter, isRTL && styles.cardFooterRTL]}>
                {/* Engagement Stats */}
                <View style={[styles.engagementRow, isRTL && styles.rowRTL]}>
                    <View style={[styles.statItem, isRTL && styles.rowRTL]}>
                        <Text style={styles.statIcon}>👁</Text>
                        <Text style={styles.statText}>{viewsCount} {t.jobCard.views}</Text>
                    </View>
                    <View style={[styles.statItem, isRTL && styles.rowRTL]}>
                        <Text style={styles.statIcon}>📝</Text>
                        <Text style={styles.statText}>{bidsCount} {t.jobCard.bids}</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={[styles.actionsRow, isRTL && styles.rowRTL]}>
                    <TouchableOpacity
                        style={[styles.actionButton, isHovered && styles.actionButtonHovered]}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.actionIcon}>💬</Text>
                        <Text style={styles.actionText}>{t.jobCard.message}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, isHovered && styles.actionButtonHovered]}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.actionIcon}>📌</Text>
                        <Text style={styles.actionText}>{t.jobCard.save}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, isHovered && styles.actionButtonHovered]}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.actionIcon}>↗️</Text>
                        <Text style={styles.actionText}>{t.jobCard.share}</Text>
                    </TouchableOpacity>
                </View>

                {isPro && (
                    <View style={[styles.viewDetailsButton, isHovered && styles.viewDetailsButtonHovered]}>
                        <Text style={styles.viewDetailsIcon}>👀</Text>
                        <Text style={styles.viewDetailsText}>{t.jobCard.tapToView}</Text>
                    </View>
                )}
            </View>
        </AnimatedTouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card, // Glass opacity
        borderRadius: THEME_LAYOUT.borderRadius.xl, // 28
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.white,
        ...SHADOWS.card,
        overflow: 'visible', // Allow shadows to spill out
    },
    cardWeb: {
        maxWidth: RESPONSIVE_LAYOUT.feedMaxWidth - 32,
        ...Platform.select({
            web: {
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
            } as any,
        }),
    },
    cardHovered: {
        ...Platform.select({
            web: {
                transform: [{ scale: 1.01 }],
                shadowOpacity: 0.12,
            } as any,
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(241, 245, 249, 0.5)', // Transparent border
    },
    cardHeaderRTL: {
        flexDirection: 'row-reverse',
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rowRTL: {
        flexDirection: 'row-reverse',
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontFamily: FONTS.heading.bold,
        color: COLORS.white,
    },
    userInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontFamily: FONTS.heading.bold,
        color: COLORS.text,
        marginRight: 6,
    },
    textRTL: {
        textAlign: 'right',
    },
    verifiedBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedIcon: {
        fontSize: 10,
        color: COLORS.white,
        fontFamily: FONTS.body.bold,
    },
    timeAgo: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '500',
        marginTop: 2,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    categoryIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
    },
    cardBody: {
        padding: 16,
        paddingTop: 14,
    },
    jobTitle: {
        fontSize: 20,
        fontFamily: FONTS.heading.bold,
        color: COLORS.text,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    priceTag: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    priceCurrency: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10B981',
        marginTop: 2,
    },
    priceAmount: {
        fontSize: 28,
        fontFamily: FONTS.heading.bold,
        color: COLORS.success,
        letterSpacing: -1,
    },
    negotiableBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    negotiableText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#D97706',
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: FONTS.body.regular,
        color: COLORS.gray[600],
        marginBottom: 14,
    },
    scheduleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    scheduleIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    iconRTL: {
        marginRight: 0,
        marginLeft: 8,
    },
    scheduleText: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
        flex: 1,
    },
    cardFooter: {
        padding: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(241, 245, 249, 0.5)',
    },
    cardFooterRTL: {
        // Footer layout adjustments for RTL
    },
    engagementRow: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    statText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748B',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 0,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
            } as any,
        }),
    },
    actionButtonHovered: {
        backgroundColor: '#F1F5F9',
    },
    actionIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF2FF',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 12,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
            } as any,
        }),
    },
    viewDetailsButtonHovered: {
        backgroundColor: '#E0E7FF',
    },
    viewDetailsIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366F1',
    },
});

export default JobCard;
