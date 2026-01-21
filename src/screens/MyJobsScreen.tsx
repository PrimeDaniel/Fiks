import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../services/supabase';
import { Job, Bid, Profile } from '../types/database';

type MyJobsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyJobs'>;

type Props = {
    navigation: MyJobsScreenNavigationProp;
};

type JobWithBids = Job & {
    bids: (Bid & { profile?: Profile })[];
};

const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
    'Electricity': { icon: '⚡', color: '#F59E0B' },
    'Plumbing': { icon: '🔧', color: '#3B82F6' },
    'Assembly': { icon: '🔨', color: '#F97316' },
    'Moving': { icon: '📦', color: '#10B981' },
    'Painting': { icon: '🎨', color: '#EC4899' },
};

const getAvatarColor = (name: string): string => {
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
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
    return `${diffDays}d ago`;
};

// Mock data for testing without Supabase
const MOCK_MY_JOBS: JobWithBids[] = [
    {
        id: 'my-job-1',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'current-user',
        title: 'Fix Leaking Sink',
        description: 'Kitchen sink is dripping constantly.',
        category: 'Plumbing',
        photos: [],
        price_offer: 80,
        schedule_description: 'Weekdays after 5 PM',
        allow_counter_offers: true,
        status: 'Open',
        bids: [
            {
                id: 'bid-1',
                created_at: new Date(Date.now() - 3600000).toISOString(),
                updated_at: new Date().toISOString(),
                job_id: 'my-job-1',
                pro_id: 'pro-1',
                price: 75,
                status: 'Pending',
                message: 'I can do this job for less!',
                profile: {
                    id: 'pro-1',
                    full_name: 'Alex Pro',
                    role: 'pro',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
            },
            {
                id: 'bid-2',
                created_at: new Date(Date.now() - 7200000).toISOString(),
                updated_at: new Date().toISOString(),
                job_id: 'my-job-1',
                pro_id: 'pro-2',
                price: 80,
                status: 'Pending',
                message: 'Experienced plumber here. I can help!',
                profile: {
                    id: 'pro-2',
                    full_name: 'Maria Expert',
                    role: 'pro',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
            },
        ]
    },
    {
        id: 'my-job-2',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'current-user',
        title: 'Install Ceiling Fan',
        description: 'Need to replace light fixture with a fan.',
        category: 'Electricity',
        photos: [],
        price_offer: 150,
        schedule_description: 'This weekend',
        allow_counter_offers: false,
        status: 'Open',
        bids: []
    }
];

const MyJobsScreen: React.FC<Props> = ({ navigation }) => {
    const [jobs, setJobs] = useState<JobWithBids[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingBid, setProcessingBid] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    const fetchMyJobs = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (!user) {
                setJobs([]);
                setLoading(false);
                return;
            }

            // Fetch user's jobs with bids
            const { data, error } = await supabase
                .from('jobs')
                .select(`
                    *,
                    bids (
                        *,
                        profiles (*)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Using mock data:', error.message);
                setJobs(MOCK_MY_JOBS);
            } else {
                // Transform data to match our type
                const transformedJobs = (data || []).map(job => ({
                    ...job,
                    bids: (job.bids || []).map((bid: any) => ({
                        ...bid,
                        profile: bid.profiles
                    }))
                }));
                setJobs(transformedJobs as JobWithBids[]);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setJobs(MOCK_MY_JOBS);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMyJobs();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMyJobs();
    };

    const handleApproveBid = async (bid: Bid, job: JobWithBids) => {
        Alert.alert(
            '✅ Approve Bid',
            `Approve ${bid.profile?.full_name}'s offer of $${bid.price}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    style: 'default',
                    onPress: async () => {
                        setProcessingBid(bid.id);
                        try {
                            // Update the approved bid
                            const { error: bidError } = await supabase
                                .from('bids')
                                .update({ status: 'Accepted' })
                                .eq('id', bid.id);

                            if (bidError) throw bidError;

                            // Reject other bids for this job
                            await supabase
                                .from('bids')
                                .update({ status: 'Rejected' })
                                .eq('job_id', job.id)
                                .neq('id', bid.id);

                            // Update job status
                            await supabase
                                .from('jobs')
                                .update({ status: 'In Progress' })
                                .eq('id', job.id);

                            Alert.alert(
                                '🎉 Success!',
                                `You've approved ${bid.profile?.full_name}'s bid. They'll be notified shortly.`
                            );
                            
                            fetchMyJobs();
                        } catch (error: any) {
                            console.error('Error approving bid:', error);
                            Alert.alert('Error', 'Failed to approve bid. Please try again.');
                        } finally {
                            setProcessingBid(null);
                        }
                    }
                }
            ]
        );
    };

    const handleRejectBid = async (bid: Bid) => {
        Alert.alert(
            '❌ Reject Bid',
            `Reject ${bid.profile?.full_name}'s offer?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        setProcessingBid(bid.id);
                        try {
                            const { error } = await supabase
                                .from('bids')
                                .update({ status: 'Rejected' })
                                .eq('id', bid.id);

                            if (error) throw error;
                            
                            fetchMyJobs();
                        } catch (error: any) {
                            console.error('Error rejecting bid:', error);
                            Alert.alert('Error', 'Failed to reject bid. Please try again.');
                        } finally {
                            setProcessingBid(null);
                        }
                    }
                }
            ]
        );
    };

    const renderBidItem = (bid: Bid & { profile?: Profile }, job: JobWithBids) => {
        const avatarColor = getAvatarColor(bid.profile?.full_name || 'P');
        const initials = bid.profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P';
        const isProcessing = processingBid === bid.id;

        const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
            'Pending': { color: '#F59E0B', bgColor: '#FFFBEB', label: 'Pending' },
            'Accepted': { color: '#10B981', bgColor: '#ECFDF5', label: 'Approved' },
            'Rejected': { color: '#EF4444', bgColor: '#FEF2F2', label: 'Rejected' },
        };
        const config = statusConfig[bid.status];

        return (
            <View key={bid.id} style={styles.bidCard}>
                <View style={styles.bidHeader}>
                    <View style={[styles.bidAvatar, { backgroundColor: avatarColor }]}>
                        <Text style={styles.bidAvatarText}>{initials}</Text>
                    </View>
                    <View style={styles.bidInfo}>
                        <View style={styles.bidNameRow}>
                            <Text style={styles.bidProName}>{bid.profile?.full_name || 'Pro'}</Text>
                            <View style={styles.proBadge}>
                                <Text style={styles.proBadgeText}>⭐ Pro</Text>
                            </View>
                        </View>
                        <Text style={styles.bidTime}>{getTimeAgo(bid.created_at)}</Text>
                    </View>
                    <View style={styles.bidPriceContainer}>
                        <Text style={styles.bidPriceCurrency}>$</Text>
                        <Text style={styles.bidPrice}>{bid.price}</Text>
                    </View>
                </View>

                {bid.message && (
                    <View style={styles.bidMessageBox}>
                        <Text style={styles.bidMessage}>"{bid.message}"</Text>
                    </View>
                )}

                {bid.status === 'Pending' ? (
                    <View style={styles.bidActions}>
                        <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={() => handleRejectBid(bid)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <Text style={styles.rejectButtonText}>Decline</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.approveButton}
                            onPress={() => handleApproveBid(bid, job)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.approveButtonIcon}>✓</Text>
                                    <Text style={styles.approveButtonText}>Approve</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={[styles.bidStatusBadge, { backgroundColor: config.bgColor }]}>
                        <Text style={[styles.bidStatusText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderJobItem = ({ item }: { item: JobWithBids }) => {
        const categoryConfig = CATEGORY_CONFIG[item.category] || { icon: '📋', color: '#6B7280' };
        const pendingBids = item.bids.filter(b => b.status === 'Pending').length;

        const statusConfig: Record<string, { color: string; bgColor: string }> = {
            'Open': { color: '#10B981', bgColor: '#ECFDF5' },
            'In Progress': { color: '#F59E0B', bgColor: '#FFFBEB' },
            'Completed': { color: '#6366F1', bgColor: '#EEF2FF' },
        };
        const jobStatusConfig = statusConfig[item.status];

        return (
            <View style={styles.jobCard}>
                {/* Job Header */}
                <View style={styles.jobHeader}>
                    <View style={styles.jobTitleRow}>
                        <Text style={styles.categoryIcon}>{categoryConfig.icon}</Text>
                        <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: jobStatusConfig.bgColor }]}>
                        <Text style={[styles.statusText, { color: jobStatusConfig.color }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                {/* Job Details */}
                <View style={styles.jobDetails}>
                    <View style={styles.jobPriceRow}>
                        <Text style={styles.jobPriceLabel}>Your budget:</Text>
                        <Text style={styles.jobPrice}>${item.price_offer}</Text>
                    </View>
                    <Text style={styles.jobDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>

                {/* Bids Section */}
                <View style={styles.bidsSection}>
                    <View style={styles.bidsSectionHeader}>
                        <Text style={styles.bidsSectionTitle}>
                            📬 Incoming Bids
                        </Text>
                        {pendingBids > 0 && (
                            <View style={styles.pendingBadge}>
                                <Text style={styles.pendingBadgeText}>{pendingBids} new</Text>
                            </View>
                        )}
                    </View>

                    {item.bids.length === 0 ? (
                        <View style={styles.noBidsContainer}>
                            <Text style={styles.noBidsIcon}>🔍</Text>
                            <Text style={styles.noBidsText}>No bids yet</Text>
                            <Text style={styles.noBidsSubtext}>
                                Pros will start bidding soon
                            </Text>
                        </View>
                    ) : (
                        item.bids.map(bid => renderBidItem(bid, item))
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Loading your jobs...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔐</Text>
                <Text style={styles.emptyTitle}>Sign In Required</Text>
                <Text style={styles.emptyText}>
                    Please sign in to view your posted jobs and manage bids.
                </Text>
                <TouchableOpacity
                    style={styles.signInButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            
            <FlatList
                data={jobs}
                keyExtractor={(item) => item.id}
                renderItem={renderJobItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#6366F1"
                    />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>📋 My Jobs</Text>
                        <Text style={styles.headerSubtitle}>
                            Manage your posted jobs and review incoming bids
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyTitle}>No Jobs Posted</Text>
                        <Text style={styles.emptyText}>
                            Post your first job to start receiving bids from local pros!
                        </Text>
                        <TouchableOpacity
                            style={styles.postJobButton}
                            onPress={() => navigation.navigate('CreateJob')}
                        >
                            <Text style={styles.postJobButtonText}>+ Post a Job</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
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
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    header: {
        paddingHorizontal: 4,
        paddingTop: 8,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#64748B',
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    jobCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
        overflow: 'hidden',
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    jobTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    categoryIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    jobDetails: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    jobPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    jobPriceLabel: {
        fontSize: 14,
        color: '#64748B',
        marginRight: 8,
    },
    jobPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: '#10B981',
    },
    jobDescription: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    bidsSection: {
        padding: 16,
    },
    bidsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    bidsSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    pendingBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 10,
    },
    pendingBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D97706',
    },
    noBidsContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    noBidsIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    noBidsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
    },
    noBidsSubtext: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 4,
    },
    bidCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    bidHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bidAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bidAvatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    bidInfo: {
        flex: 1,
    },
    bidNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bidProName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginRight: 8,
    },
    proBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    proBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6366F1',
    },
    bidTime: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    bidPriceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bidPriceCurrency: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
        marginTop: 2,
    },
    bidPrice: {
        fontSize: 24,
        fontWeight: '800',
        color: '#10B981',
    },
    bidMessageBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        marginTop: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#6366F1',
    },
    bidMessage: {
        fontSize: 14,
        color: '#475569',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    bidActions: {
        flexDirection: 'row',
        marginTop: 14,
        gap: 10,
    },
    rejectButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    rejectButtonText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '700',
    },
    approveButton: {
        flex: 1.5,
        flexDirection: 'row',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
    },
    approveButtonIcon: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
        marginRight: 6,
    },
    approveButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    bidStatusBadge: {
        marginTop: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    bidStatusText: {
        fontSize: 13,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 56,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    postJobButton: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    postJobButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    signInButton: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    signInButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default MyJobsScreen;
