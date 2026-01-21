import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../services/supabase';
import { Profile, JobCategory } from '../types/database';
import { useTranslation, getCategoryTranslation } from '../i18n';
import { useResponsive, LAYOUT } from '../utils/responsive';

type ProProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProProfile'>;
type ProProfileScreenRouteProp = RouteProp<RootStackParamList, 'ProProfile'>;

type Props = {
    navigation: ProProfileScreenNavigationProp;
    route: ProProfileScreenRouteProp;
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

const ProProfileScreen: React.FC<Props> = ({ navigation, route }) => {
    const { t, isRTL } = useTranslation();
    const responsive = useResponsive();
    
    const { proId } = route.params;
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Mock data for demonstration
    const mockProfile: Profile = {
        id: proId,
        full_name: 'Alex Professional',
        role: 'pro',
        avatar_url: undefined,
        created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        specializations: ['Electricity', 'Plumbing'],
        completed_jobs_count: 47,
        average_rating: 4.8,
        bio: 'Professional handyman with 10+ years of experience in electrical and plumbing work.',
    };

    useEffect(() => {
        fetchProfile();
    }, [proId]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', proId)
                .single();

            if (error) {
                console.warn('Using mock profile:', error.message);
                setProfile(mockProfile);
            } else {
                setProfile({
                    ...data,
                    // Add mock stats if not available
                    specializations: data.specializations || ['Electricity', 'Plumbing'],
                    completed_jobs_count: data.completed_jobs_count || 47,
                    average_rating: data.average_rating || 4.8,
                    bio: data.bio || 'Professional service provider ready to help!',
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(mockProfile);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Profile not found</Text>
            </View>
        );
    }

    const avatarColor = getAvatarColor(profile.full_name);
    const initials = profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    const memberSince = new Date(profile.created_at).toLocaleDateString();

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            
            <ScrollView 
                contentContainerStyle={[
                    styles.scrollContent,
                    responsive.isWeb && !responsive.isMobile && styles.scrollContentWeb,
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={[styles.verifiedBadge, isRTL && styles.verifiedBadgeRTL]}>
                        <Text style={styles.verifiedText}>⭐ {t.myJobs.pro}</Text>
                    </View>
                    <Text style={[styles.profileName, isRTL && styles.textRTL]}>{profile.full_name}</Text>
                    <Text style={[styles.memberSince, isRTL && styles.textRTL]}>
                        Member since {memberSince}
                    </Text>
                </View>

                {/* Stats Row */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{profile.completed_jobs_count || 0}</Text>
                        <Text style={[styles.statLabel, isRTL && styles.textRTL]}>Jobs Done</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {profile.average_rating?.toFixed(1) || 'N/A'}
                        </Text>
                        <Text style={[styles.statLabel, isRTL && styles.textRTL]}>Rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {profile.specializations?.length || 0}
                        </Text>
                        <Text style={[styles.statLabel, isRTL && styles.textRTL]}>Skills</Text>
                    </View>
                </View>

                {/* Bio Section */}
                {profile.bio && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>📝 About</Text>
                        <View style={styles.bioCard}>
                            <Text style={[styles.bioText, isRTL && styles.textRTL]}>{profile.bio}</Text>
                        </View>
                    </View>
                )}

                {/* Specializations */}
                {profile.specializations && profile.specializations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>🛠 Specializations</Text>
                        <View style={[styles.specializationsContainer, isRTL && styles.rowRTL]}>
                            {profile.specializations.map((spec) => {
                                const config = CATEGORY_CONFIG[spec] || { icon: '📋', color: '#6B7280', bgColor: '#F3F4F6' };
                                return (
                                    <View 
                                        key={spec} 
                                        style={[styles.specializationBadge, { backgroundColor: config.bgColor }]}
                                    >
                                        <Text style={styles.specializationIcon}>{config.icon}</Text>
                                        <Text style={[styles.specializationText, { color: config.color }]}>
                                            {getCategoryTranslation(t, spec)}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Rating Breakdown (Mock) */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>⭐ Rating Breakdown</Text>
                    <View style={styles.ratingCard}>
                        {[5, 4, 3, 2, 1].map((stars) => {
                            // Mock percentages
                            const percentages: Record<number, number> = { 5: 78, 4: 15, 3: 5, 2: 1, 1: 1 };
                            return (
                                <View key={stars} style={[styles.ratingRow, isRTL && styles.rowRTL]}>
                                    <Text style={styles.ratingStars}>{'⭐'.repeat(stars)}</Text>
                                    <View style={styles.ratingBarContainer}>
                                        <View style={[styles.ratingBar, { width: `${percentages[stars]}%` }]} />
                                    </View>
                                    <Text style={styles.ratingPercent}>{percentages[stars]}%</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Contact Button */}
                <TouchableOpacity style={styles.contactButton}>
                    <Text style={styles.contactButtonIcon}>💬</Text>
                    <Text style={styles.contactButtonText}>{t.jobCard.message}</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        padding: 20,
    },
    scrollContentWeb: {
        maxWidth: LAYOUT.feedMaxWidth,
        alignSelf: 'center',
        width: '100%',
    },
    // RTL helpers
    rowRTL: {
        flexDirection: 'row-reverse',
    },
    textRTL: {
        textAlign: 'right',
    },
    // Profile Header
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    verifiedBadge: {
        position: 'absolute',
        top: 80,
        right: '35%',
        backgroundColor: '#6366F1',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    verifiedBadgeRTL: {
        right: undefined,
        left: '35%',
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    profileName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginTop: 8,
    },
    memberSince: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    // Stats Card
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
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
        backgroundColor: '#E2E8F0',
    },
    // Sections
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 12,
    },
    bioCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    bioText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#475569',
    },
    // Specializations
    specializationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    specializationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    specializationIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    specializationText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Rating
    ratingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingStars: {
        width: 80,
        fontSize: 12,
    },
    ratingBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginHorizontal: 8,
    },
    ratingBar: {
        height: '100%',
        backgroundColor: '#6366F1',
        borderRadius: 4,
    },
    ratingPercent: {
        width: 40,
        fontSize: 12,
        color: '#64748B',
        textAlign: 'right',
    },
    // Contact Button
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 14,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    contactButtonIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    contactButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ProProfileScreen;
