import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Job } from '../types/database';

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

const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

const getAvatarColor = (name: string): string => {
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

const JobCard: React.FC<Props> = ({ job, isPro, onAccept, onPress, index = 0 }) => {
    const categoryConfig = CATEGORY_CONFIG[job.category] || { icon: '📋', color: '#6B7280', bgColor: '#F3F4F6' };
    const timeAgo = getTimeAgo(job.created_at);
    const avatarColor = getAvatarColor(job.profile?.full_name || 'U');
    const initials = job.profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    const handlePress = () => {
        if (onPress) {
            onPress(job);
        }
    };

    return (
        <TouchableOpacity 
            style={styles.card} 
            onPress={handlePress}
            activeOpacity={0.95}
        >
            {/* Card Header - User Info */}
            <View style={styles.cardHeader}>
                <View style={styles.userSection}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.userName}>{job.profile?.full_name || 'Anonymous'}</Text>
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedIcon}>✓</Text>
                            </View>
                        </View>
                        <Text style={styles.timeAgo}>{timeAgo}</Text>
                    </View>
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.bgColor }]}>
                    <Text style={styles.categoryIcon}>{categoryConfig.icon}</Text>
                    <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                        {job.category}
                    </Text>
                </View>
            </View>

            {/* Card Body - Job Content */}
            <View style={styles.cardBody}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                
                {/* Price Tag - Hero Element */}
                <View style={styles.priceSection}>
                    <View style={styles.priceTag}>
                        <Text style={styles.priceCurrency}>$</Text>
                        <Text style={styles.priceAmount}>{job.price_offer}</Text>
                    </View>
                    {job.allow_counter_offers && (
                        <View style={styles.negotiableBadge}>
                            <Text style={styles.negotiableText}>💬 Negotiable</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.description} numberOfLines={3}>
                    {job.description}
                </Text>

                {/* Schedule Info */}
                {job.schedule_description && (
                    <View style={styles.scheduleBox}>
                        <Text style={styles.scheduleIcon}>📅</Text>
                        <Text style={styles.scheduleText}>{job.schedule_description}</Text>
                    </View>
                )}
            </View>

            {/* Card Footer - Actions */}
            <View style={styles.cardFooter}>
                <View style={styles.statsRow}>
                    <View style={styles.actionButton}>
                        <Text style={styles.actionIcon}>💬</Text>
                        <Text style={styles.actionText}>Message</Text>
                    </View>
                    <View style={styles.actionButton}>
                        <Text style={styles.actionIcon}>📌</Text>
                        <Text style={styles.actionText}>Save</Text>
                    </View>
                    <View style={styles.actionButton}>
                        <Text style={styles.actionIcon}>↗️</Text>
                        <Text style={styles.actionText}>Share</Text>
                    </View>
                </View>

                {isPro && (
                    <View style={styles.viewDetailsButton}>
                        <Text style={styles.viewDetailsIcon}>👀</Text>
                        <Text style={styles.viewDetailsText}>Tap to view & bid</Text>
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 0,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
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
