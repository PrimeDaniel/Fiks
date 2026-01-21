import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { useTranslation, getCategoryTranslation } from '../i18n';
import { JobCategory } from '../types/database';
import { LAYOUT } from '../utils/responsive';

interface WebSidebarProps {
    totalJobs: number;
    activeBids?: number;
    selectedCategory: JobCategory | 'All';
    onCategorySelect: (category: JobCategory | 'All') => void;
    onBecomeProPress?: () => void;
    isRTL?: boolean;
}

type CategoryItem = {
    name: JobCategory | 'All';
    icon: string;
    color: string;
};

const CATEGORIES: CategoryItem[] = [
    { name: 'All', icon: '🏠', color: '#6366F1' },
    { name: 'Electricity', icon: '⚡', color: '#F59E0B' },
    { name: 'Plumbing', icon: '🔧', color: '#3B82F6' },
    { name: 'Assembly', icon: '🔨', color: '#F97316' },
    { name: 'Moving', icon: '📦', color: '#10B981' },
    { name: 'Painting', icon: '🎨', color: '#EC4899' },
];

const WebSidebar: React.FC<WebSidebarProps> = ({
    totalJobs,
    activeBids = 0,
    selectedCategory,
    onCategorySelect,
    onBecomeProPress,
    isRTL = false,
}) => {
    const { t } = useTranslation();

    // Only render on web
    if (Platform.OS !== 'web') {
        return null;
    }

    return (
        <View style={[styles.container, isRTL && styles.containerRTL]}>
            {/* Quick Stats Card */}
            <View style={styles.card}>
                <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                    📊 {t.sidebar.quickStats}
                </Text>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{totalJobs}</Text>
                        <Text style={[styles.statLabel, isRTL && styles.textRTL]}>
                            {t.sidebar.totalJobs}
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{activeBids}</Text>
                        <Text style={[styles.statLabel, isRTL && styles.textRTL]}>
                            {t.sidebar.activeBids}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Categories */}
            <View style={styles.card}>
                <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                    📂 {t.sidebar.categories}
                </Text>
                <View style={styles.categoriesList}>
                    {CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category.name}
                            style={[
                                styles.categoryItem,
                                selectedCategory === category.name && styles.categoryItemActive,
                                isRTL && styles.rowRTL,
                            ]}
                            onPress={() => onCategorySelect(category.name)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === category.name && styles.categoryTextActive,
                            ]}>
                                {getCategoryTranslation(t, category.name)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Become a Pro CTA */}
            <View style={styles.proCard}>
                <Text style={styles.proIcon}>⭐</Text>
                <Text style={[styles.proTitle, isRTL && styles.textRTL]}>
                    {t.sidebar.becomePro}
                </Text>
                <Text style={[styles.proDesc, isRTL && styles.textRTL]}>
                    {t.sidebar.becomeProDesc}
                </Text>
                <TouchableOpacity
                    style={styles.proButton}
                    onPress={onBecomeProPress}
                    activeOpacity={0.8}
                >
                    <Text style={styles.proButtonText}>
                        {t.sidebar.getStarted}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: LAYOUT.sidebarWidth,
        paddingRight: 24,
        paddingTop: 16,
    },
    containerRTL: {
        paddingRight: 0,
        paddingLeft: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        ...Platform.select({
            web: {
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.06)',
            } as any,
        }),
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    textRTL: {
        textAlign: 'right',
    },
    rowRTL: {
        flexDirection: 'row-reverse',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '800',
        color: '#6366F1',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E2E8F0',
    },
    categoriesList: {
        gap: 4,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
            } as any,
        }),
    },
    categoryItemActive: {
        backgroundColor: '#EEF2FF',
    },
    categoryIcon: {
        fontSize: 16,
        marginRight: 10,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
    },
    categoryTextActive: {
        color: '#6366F1',
        fontWeight: '600',
    },
    proCard: {
        backgroundColor: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' as any,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        ...Platform.select({
            web: {
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            } as any,
        }),
    },
    proIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    proTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    proDesc: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 16,
    },
    proButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        ...Platform.select({
            web: {
                cursor: 'pointer',
            } as any,
        }),
    },
    proButtonText: {
        color: '#6366F1',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default WebSidebar;
