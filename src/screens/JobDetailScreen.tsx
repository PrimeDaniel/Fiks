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
import { useTranslation, getTimeAgoTranslation, getCategoryTranslation, getStatusTranslation } from '../i18n';
import { useResponsive, LAYOUT } from '../utils/responsive';

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

const getAvatarColor = (name: string): string => {
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

const JobDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { t, isRTL } = useTranslation();
    const responsive = useResponsive();
    
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
    const timeAgo = getTimeAgoTranslation(t, job.created_at);
    
    // Engagement stats
    const viewsCount = job.views_count || Math.floor(Math.random() * 50) + 10;
    const bidsCount = job.bids?.length || 0;

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                setUserProfile(profile);
                setIsPro(profile?.role === 'pro');

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
            Alert.alert(t.jobDetail.loginRequired, t.jobDetail.signInAsPro, [
                { text: t.common.cancel, style: 'cancel' },
                { text: t.nav.signIn, onPress: () => navigation.navigate('Login') }
            ]);
            return;
        }

        if (!isPro) {
            Alert.alert(t.jobDetail.proAccountRequired, t.jobDetail.signInAsPro);
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
                    Alert.alert(t.common.error, t.jobDetail.alreadyApplied);
                } else {
                    throw error;
                }
            } else {
                Alert.alert(
                    t.jobDetail.bidSubmitted,
                    t.jobDetail.bidSentMessage,
                    [{ text: t.common.ok, onPress: () => navigation.goBack() }]
                );
            }
        } catch (error: any) {
            console.error('Error submitting bid:', error);
            Alert.alert(t.common.error, error.message || 'Failed to submit bid.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCounterOffer = async () => {
        if (!counterPrice || isNaN(Number(counterPrice))) {
            Alert.alert(t.common.error, t.jobDetail.invalidPrice);
            return;
        }

        if (!currentUser) {
            Alert.alert(t.jobDetail.loginRequired, t.jobDetail.signInAsPro);
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
                    Alert.alert(t.common.error, t.jobDetail.alreadyApplied);
                } else {
                    throw error;
                }
            } else {
                setShowCounterModal(false);
                Alert.alert(
                    t.jobDetail.counterOfferSent,
                    `$${counterPrice}`,
                    [{ text: t.common.ok, onPress: () => navigation.goBack() }]
                );
            }
        } catch (error: any) {
            console.error('Error submitting counter offer:', error);
            Alert.alert(t.common.error, error.message || 'Failed to submit offer.');
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
            <View style={[styles.bidStatusCard, { backgroundColor: config.bgColor }, isRTL && styles.rowRTL]}>
                <Text style={[styles.bidStatusIcon, isRTL && styles.iconRTL]}>{config.icon}</Text>
                <View style={styles.bidStatusContent}>
                    <Text style={[styles.bidStatusTitle, { color: config.color }, isRTL && styles.textRTL]}>
                        {t.jobDetail.yourBid}: {getStatusTranslation(t, existingBid.status)}
                    </Text>
                    <Text style={[styles.bidStatusPrice, isRTL && styles.textRTL]}>
                        ${existingBid.price}
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
                contentContainerStyle={[
                    styles.scrollContent,
                    responsive.isWeb && !responsive.isMobile && styles.scrollContentWeb,
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Engagement Stats Bar */}
                <View style={[styles.engagementBar, isRTL && styles.rowRTL]}>
                    <View style={[styles.engagementItem, isRTL && styles.rowRTL]}>
                        <Text style={styles.engagementIcon}>👁</Text>
                        <Text style={styles.engagementText}>{viewsCount} {t.jobCard.views}</Text>
                    </View>
                    <View style={[styles.engagementItem, isRTL && styles.rowRTL]}>
                        <Text style={styles.engagementIcon}>📝</Text>
                        <Text style={styles.engagementText}>{bidsCount} {t.jobCard.bids}</Text>
                    </View>
                </View>

                {/* Category Badge */}
                <View style={[
                    styles.categoryBadge, 
                    { backgroundColor: categoryConfig.bgColor },
                    isRTL && styles.categoryBadgeRTL
                ]}>
                    <Text style={styles.categoryIcon}>{categoryConfig.icon}</Text>
                    <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                        {getCategoryTranslation(t, job.category)}
                    </Text>
                </View>

                {/* Job Title */}
                <Text style={[styles.jobTitle, isRTL && styles.textRTL]}>{job.title}</Text>

                {/* Price Section */}
                <View style={styles.priceCard}>
                    <View style={[styles.priceHeader, isRTL && styles.rowRTL]}>
                        <Text style={[styles.priceLabel, isRTL && styles.textRTL]}>{t.jobDetail.budgetOffer}</Text>
                        {job.allow_counter_offers && (
                            <View style={styles.negotiableBadge}>
                                <Text style={styles.negotiableText}>{t.jobDetail.openToOffers}</Text>
                            </View>
                        )}
                    </View>
                    <View style={[styles.priceRow, isRTL && styles.rowRTL]}>
                        <Text style={styles.priceCurrency}>$</Text>
                        <Text style={styles.priceAmount}>{job.price_offer}</Text>
                    </View>
                </View>

                {/* Poster Info */}
                <View style={[styles.posterCard, isRTL && styles.rowRTL]}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor }, isRTL && styles.avatarRTL]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.posterInfo}>
                        <Text style={[styles.posterName, isRTL && styles.textRTL]}>
                            {job.profile?.full_name || 'Anonymous'}
                        </Text>
                        <Text style={[styles.posterTime, isRTL && styles.textRTL]}>
                            {t.jobDetail.postedBy} {timeAgo}
                        </Text>
                    </View>
                    <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓ {t.jobCard.verified}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t.jobDetail.description}</Text>
                    <Text style={[styles.description, isRTL && styles.textRTL]}>{job.description}</Text>
                </View>

                {/* Schedule */}
                {job.schedule_description && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t.jobDetail.availability}</Text>
                        <View style={[styles.scheduleBox, isRTL && styles.scheduleBoxRTL]}>
                            <Text style={[styles.scheduleText, isRTL && styles.textRTL]}>
                                {job.schedule_description}
                            </Text>
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
                        <View style={[styles.twoButtonRow, isRTL && styles.rowRTL]}>
                            <TouchableOpacity
                                style={[styles.counterButton, isRTL && styles.rowRTL]}
                                onPress={() => setShowCounterModal(true)}
                                disabled={submitting}
                            >
                                <Text style={[styles.counterButtonIcon, isRTL && styles.iconRTL]}>💰</Text>
                                <Text style={styles.counterButtonText}>{t.jobDetail.counterOffer}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.acceptButton, isRTL && styles.rowRTL]}
                                onPress={handleAcceptJob}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Text style={[styles.acceptButtonIcon, isRTL && styles.iconRTL]}>✨</Text>
                                        <Text style={styles.acceptButtonText}>
                                            {t.jobDetail.acceptJob} ${job.price_offer}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.acceptButtonFull, isRTL && styles.rowRTL]}
                            onPress={handleAcceptJob}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Text style={[styles.acceptButtonIcon, isRTL && styles.iconRTL]}>✨</Text>
                                    <Text style={styles.acceptButtonText}>
                                        {t.jobDetail.acceptJob} ${job.price_offer}
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
                        <Text style={[styles.loginPromptText, isRTL && styles.textRTL]}>
                            {t.jobDetail.signInAsPro}
                        </Text>
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
                        <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
                            <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                                {t.jobDetail.makeCounterOffer}
                            </Text>
                            <TouchableOpacity
                                style={styles.modalClose}
                                onPress={() => setShowCounterModal(false)}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.modalSubtitle, isRTL && styles.textRTL]}>
                            {t.jobDetail.originalOffer}: <Text style={styles.originalPrice}>${job.price_offer}</Text>
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, isRTL && styles.textRTL]}>{t.jobDetail.yourPrice}</Text>
                            <View style={[styles.priceInputContainer, isRTL && styles.rowRTL]}>
                                <Text style={[styles.priceInputPrefix, isRTL && styles.prefixRTL]}>$</Text>
                                <TextInput
                                    style={[styles.priceInput, isRTL && styles.textInputRTL]}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={counterPrice}
                                    onChangeText={setCounterPrice}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, isRTL && styles.textRTL]}>
                                {t.jobDetail.messageOptional}
                            </Text>
                            <TextInput
                                style={[styles.messageInput, isRTL && styles.textInputRTL]}
                                placeholder={t.jobDetail.explainPricing}
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
                                <Text style={styles.submitOfferText}>{t.jobDetail.submitOffer}</Text>
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
    iconRTL: {
        marginRight: 0,
        marginLeft: 8,
    },
    // Engagement stats
    engagementBar: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 16,
    },
    engagementItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    engagementIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    engagementText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
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
    categoryBadgeRTL: {
        alignSelf: 'flex-end',
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
    avatarRTL: {
        marginRight: 0,
        marginLeft: 14,
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
    scheduleBoxRTL: {
        borderLeftWidth: 0,
        borderRightWidth: 4,
        borderRightColor: '#6366F1',
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
    prefixRTL: {
        marginRight: 0,
        marginLeft: 4,
    },
    priceInput: {
        flex: 1,
        fontSize: 28,
        fontWeight: '700',
        color: '#1E293B',
        paddingVertical: 14,
    },
    textInputRTL: {
        textAlign: 'right',
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
