import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../services/supabase';
import { Job, Bid, Profile } from '../types/database';

type JobDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'JobDetail'>;
type JobDetailScreenRouteProp = RouteProp<RootStackParamList, 'JobDetail'>;

type Props = {
    navigation: JobDetailScreenNavigationProp;
    route: JobDetailScreenRouteProp;
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
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
};

const getAvatarColor = (name: string): string => {
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

const JobDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { job } = route.params;
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existingBid, setExistingBid] = useState<Bid | null>(null);
    
    // Counter offer modal state
    const [showCounterModal, setShowCounterModal] = useState(false);
    const [counterPrice, setCounterPrice] = useState('');
    const [counterMessage, setCounterMessage] = useState('');

    const categoryConfig = CATEGORY_CONFIG[job.category] || { icon: '📋', color: '#6B7280', bgColor: '#F3F4F6' };
    const avatarColor = getAvatarColor(job.profile?.full_name || 'U');
    const initials = job.profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            if (user) {
                // Fetch user profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                setUserProfile(profile);
                setIsPro(profile?.role === 'pro');

                // Check for existing bid from this pro
                if (profile?.role === 'pro') {
                    const { data: bid } = await supabase
                        .from('bids')
                        .select('*')
                        .eq('job_id', job.id)
                        .eq('pro_id', user.id)
                        .single();
                    
                    setExistingBid(bid);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptJob = async () => {
        if (!currentUser) {
            Alert.alert('Login Required', 'Please sign in as a Pro to accept jobs.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign In', onPress: () => navigation.navigate('Login') }
            ]);
            return;
        }

        if (!isPro) {
            Alert.alert('Pro Account Required', 'Only Pro accounts can accept jobs.');
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('bids')
                .insert({
                    job_id: job.id,
                    pro_id: currentUser.id,
                    price: job.price_offer,
                    status: 'Pending',
                    message: 'Accepted at posted price',
                })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    Alert.alert('Already Applied', 'You have already submitted a bid for this job.');
                } else {
                    throw error;
                }
            } else {
                Alert.alert(
                    '✅ Bid Submitted!',
                    'Your bid has been sent to the job poster. They will review and respond soon.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error: any) {
            console.error('Error submitting bid:', error);
            Alert.alert('Error', error.message || 'Failed to submit bid. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCounterOffer = async () => {
        if (!counterPrice || isNaN(Number(counterPrice))) {
            Alert.alert('Invalid Price', 'Please enter a valid price.');
            return;
        }

        if (!currentUser) {
            Alert.alert('Login Required', 'Please sign in as a Pro to make offers.');
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('bids')
                .insert({
                    job_id: job.id,
                    pro_id: currentUser.id,
                    price: Number(counterPrice),
                    status: 'Pending',
                    message: counterMessage || 'Counter offer submitted',
                })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    Alert.alert('Already Applied', 'You have already submitted a bid for this job.');
                } else {
                    throw error;
                }
            } else {
                setShowCounterModal(false);
                Alert.alert(
                    '✅ Counter Offer Sent!',
                    `Your offer of $${counterPrice} has been sent to the job poster.`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error: any) {
            console.error('Error submitting counter offer:', error);
            Alert.alert('Error', error.message || 'Failed to submit offer. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderBidStatus = () => {
        if (!existingBid) return null;

        const statusConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
            'Pending': { color: '#F59E0B', bgColor: '#FFFBEB', icon: '⏳' },
            'Accepted': { color: '#10B981', bgColor: '#ECFDF5', icon: '✅' },
            'Rejected': { color: '#EF4444', bgColor: '#FEF2F2', icon: '❌' },
        };

        const config = statusConfig[existingBid.status];

        return (
            <View style={[styles.bidStatusCard, { backgroundColor: config.bgColor }]}>
                <Text style={styles.bidStatusIcon}>{config.icon}</Text>
                <View style={styles.bidStatusContent}>
                    <Text style={[styles.bidStatusTitle, { color: config.color }]}>
                        Your Bid: {existingBid.status}
                    </Text>
                    <Text style={styles.bidStatusPrice}>
                        ${existingBid.price} offered
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Category Badge */}
                <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.bgColor }]}>
                    <Text style={styles.categoryIcon}>{categoryConfig.icon}</Text>
                    <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                        {job.category}
                    </Text>
                </View>

                {/* Job Title */}
                <Text style={styles.jobTitle}>{job.title}</Text>

                {/* Price Section */}
                <View style={styles.priceCard}>
                    <View style={styles.priceHeader}>
                        <Text style={styles.priceLabel}>Budget Offer</Text>
                        {job.allow_counter_offers && (
                            <View style={styles.negotiableBadge}>
                                <Text style={styles.negotiableText}>💬 Open to Offers</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceCurrency}>$</Text>
                        <Text style={styles.priceAmount}>{job.price_offer}</Text>
                    </View>
                </View>

                {/* Poster Info */}
                <View style={styles.posterCard}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.posterInfo}>
                        <Text style={styles.posterName}>{job.profile?.full_name || 'Anonymous'}</Text>
                        <Text style={styles.posterTime}>Posted {getTimeAgo(job.created_at)}</Text>
                    </View>
                    <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓ Verified</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📝 Description</Text>
                    <Text style={styles.description}>{job.description}</Text>
                </View>

                {/* Schedule */}
                {job.schedule_description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📅 Availability</Text>
                        <View style={styles.scheduleBox}>
                            <Text style={styles.scheduleText}>{job.schedule_description}</Text>
                        </View>
                    </View>
                )}

                {/* Existing Bid Status */}
                {renderBidStatus()}

                {/* Spacer for buttons */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Fixed Bottom Action Buttons */}
            {isPro && !existingBid && (
                <View style={styles.bottomActions}>
                    {job.allow_counter_offers ? (
                        <View style={styles.twoButtonRow}>
                            <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() => setShowCounterModal(true)}
                                disabled={submitting}
                            >
                                <Text style={styles.counterButtonIcon}>💰</Text>
                                <Text style={styles.counterButtonText}>Counter Offer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={handleAcceptJob}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.acceptButtonIcon}>✨</Text>
                                        <Text style={styles.acceptButtonText}>
                                            Accept ${job.price_offer}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.acceptButtonFull}
                            onPress={handleAcceptJob}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.acceptButtonIcon}>✨</Text>
                                    <Text style={styles.acceptButtonText}>
                                        Accept Job for ${job.price_offer}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {!isPro && !currentUser && (
                <View style={styles.bottomActions}>
                    <TouchableOpacity
                        style={styles.loginPromptButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginPromptText}>Sign in as Pro to accept jobs</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Counter Offer Modal */}
            <Modal
                visible={showCounterModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCounterModal(false)}
            >
                <KeyboardAvoidingView 
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>💰 Make Counter Offer</Text>
                            <TouchableOpacity
                                style={styles.modalClose}
                                onPress={() => setShowCounterModal(false)}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Original offer: <Text style={styles.originalPrice}>${job.price_offer}</Text>
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Your Price</Text>
                            <View style={styles.priceInputContainer}>
                                <Text style={styles.priceInputPrefix}>$</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={counterPrice}
                                    onChangeText={setCounterPrice}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Message (optional)</Text>
                            <TextInput
                                style={styles.messageInput}
                                placeholder="Explain your pricing or experience..."
                                multiline
                                numberOfLines={3}
                                value={counterMessage}
                                onChangeText={setCounterMessage}
                                placeholderTextColor="#94A3B8"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.submitOfferButton}
                            onPress={handleCounterOffer}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitOfferText}>Submit Offer</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
    },
    categoryIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '700',
    },
    jobTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -0.5,
        marginBottom: 20,
    },
    priceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    priceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    negotiableBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    negotiableText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#D97706',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    priceCurrency: {
        fontSize: 24,
        fontWeight: '700',
        color: '#10B981',
        marginTop: 4,
    },
    priceAmount: {
        fontSize: 48,
        fontWeight: '800',
        color: '#10B981',
        letterSpacing: -2,
    },
    posterCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    posterInfo: {
        flex: 1,
    },
    posterName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    posterTime: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 2,
    },
    verifiedBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 26,
        color: '#475569',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    scheduleBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#6366F1',
    },
    scheduleText: {
        fontSize: 15,
        color: '#475569',
        fontWeight: '500',
    },
    bidStatusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    bidStatusIcon: {
        fontSize: 28,
        marginRight: 14,
    },
    bidStatusContent: {
        flex: 1,
    },
    bidStatusTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    bidStatusPrice: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    twoButtonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    counterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    counterButtonIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    counterButtonText: {
        color: '#475569',
        fontSize: 15,
        fontWeight: '700',
    },
    acceptButton: {
        flex: 1.5,
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
    acceptButtonFull: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6366F1',
        paddingVertical: 18,
        borderRadius: 14,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    acceptButtonIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    loginPromptButton: {
        backgroundColor: '#F1F5F9',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    loginPromptText: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
    },
    modalClose: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 18,
        color: '#64748B',
        fontWeight: '600',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 24,
    },
    originalPrice: {
        fontWeight: '700',
        color: '#1E293B',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 8,
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
    },
    priceInputPrefix: {
        fontSize: 24,
        fontWeight: '700',
        color: '#10B981',
        marginRight: 4,
    },
    priceInput: {
        flex: 1,
        fontSize: 28,
        fontWeight: '700',
        color: '#1E293B',
        paddingVertical: 14,
    },
    messageInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1E293B',
        textAlignVertical: 'top',
        minHeight: 80,
    },
    submitOfferButton: {
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    submitOfferText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default JobDetailScreen;
