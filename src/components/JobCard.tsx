import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Job } from '../types/database';
import { useTranslation, getTimeAgoTranslation, getCategoryTranslation } from '../i18n';
import { useResponsive, LAYOUT } from '../utils/responsive';

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
        <TouchableOpacity 
            style={[
                styles.card,
                responsive.isWeb && styles.cardWeb,
                isHovered && styles.cardHovered,
            ]} 
            onPress={handlePress}
            activeOpacity={0.95}
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
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
        overflow: 'hidden',
    },
    cardWeb: {
        maxWidth: LAYOUT.feedMaxWidth - 32,
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
        padding: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
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
        fontWeight: '700',
        color: '#FFFFFF',
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
        fontWeight: '700',
        color: '#1E293B',
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
        color: '#FFFFFF',
        fontWeight: '700',
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
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 12,
    },
    priceTag: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    priceCurrency: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10B981',
        marginTop: 2,
    },
    priceAmount: {
        fontSize: 28,
        fontWeight: '800',
        color: '#10B981',
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
        color: '#475569',
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
        padding: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
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
