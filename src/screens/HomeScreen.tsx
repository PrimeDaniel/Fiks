import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    ScrollView,
    Image,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../services/supabase';
import { Job, JobCategory } from '../types/database';
import JobCard from '../components/JobCard';
import LanguageToggle from '../components/LanguageToggle';
import WebSidebar from '../components/WebSidebar';
import { useTranslation, getCategoryTranslation } from '../i18n';
import { useResponsive, LAYOUT as RESPONSIVE_LAYOUT } from '../utils/responsive';
import { COLORS, FONTS, SHADOWS, LAYOUT as THEME_LAYOUT } from '../theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
    navigation: HomeScreenNavigationProp;
};

type CategoryItem = {
    name: JobCategory | 'All';
    image: string;
    color: string;
};

const CATEGORIES: CategoryItem[] = [
    { name: 'All', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&q=80', color: '#6366F1' },
    { name: 'Electricity', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&q=80', color: '#F59E0B' },
    { name: 'Plumbing', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&q=80', color: '#3B82F6' },
    { name: 'Assembly', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=100&q=80', color: '#F97316' },
    { name: 'Moving', image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=100&q=80', color: '#10B981' },
    { name: 'Painting', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=100&q=80', color: '#EC4899' },
];

const MOCK_JOBS: Job[] = [
    {
        id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock-user-1',
        title: 'Fix Leaking Sink',
        description: 'Kitchen sink is dripping constantly. Need a plumber ASAP. The leak seems to be coming from under the cabinet.',
        category: 'Plumbing',
        photos: [],
        price_offer: 80,
        schedule_description: 'Available weekdays after 5 PM',
        allow_counter_offers: true,
        status: 'Open',
        views_count: 24,
        saves_count: 3,
        profile: {
            id: 'mock-user-1',
            full_name: 'John Doe',
            role: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        bids: [{ id: '1', created_at: '', updated_at: '', job_id: '1', pro_id: '1', price: 75, status: 'Pending' }]
    },
    {
        id: '2',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock-user-2',
        title: 'Assemble IKEA Wardrobe',
        description: 'Need help assembling a PAX wardrobe. It is huge and has mirror doors. Tools will be provided.',
        category: 'Assembly',
        photos: [],
        price_offer: 120,
        schedule_description: 'Weekend only',
        allow_counter_offers: false,
        status: 'Open',
        views_count: 18,
        saves_count: 5,
        profile: {
            id: 'mock-user-2',
            full_name: 'Jane Smith',
            role: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        bids: []
    },
    {
        id: '3',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock-user-3',
        title: 'Install Ceiling Fan',
        description: 'Replacing an old light fixture with a ceiling fan in the living room. Need someone with electrical experience.',
        category: 'Electricity',
        photos: [],
        price_offer: 150,
        schedule_description: 'Anytime this week',
        allow_counter_offers: true,
        status: 'Open',
        views_count: 42,
        saves_count: 8,
        profile: {
            id: 'mock-user-3',
            full_name: 'Mike Johnson',
            role: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        bids: [{ id: '2', created_at: '', updated_at: '', job_id: '3', pro_id: '2', price: 140, status: 'Pending' }, { id: '3', created_at: '', updated_at: '', job_id: '3', pro_id: '3', price: 145, status: 'Pending' }]
    },
    {
        id: '4',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock-user-4',
        title: 'Help Moving Apartment',
        description: 'Moving from a 2BR apartment to a new place across town. Need help with heavy furniture.',
        category: 'Moving',
        photos: [],
        price_offer: 250,
        schedule_description: 'This Saturday 9 AM - 3 PM',
        allow_counter_offers: true,
        status: 'Open',
        views_count: 67,
        saves_count: 12,
        profile: {
            id: 'mock-user-4',
            full_name: 'Sarah Wilson',
            role: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        bids: [{ id: '4', created_at: '', updated_at: '', job_id: '4', pro_id: '4', price: 230, status: 'Pending' }]
    }
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { t, isRTL } = useTranslation();
    const responsive = useResponsive();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'All'>('All');
    const [isPro, setIsPro] = useState(false);
    const [user, setUser] = useState<any>(null);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setIsPro(profile?.role === 'pro');
            }

            let query = supabase
                .from('jobs')
                .select('*, profiles(*), bids(*)')
                .eq('status', 'Open')
                .order('created_at', { ascending: false });

            if (selectedCategory !== 'All') {
                query = query.eq('category', selectedCategory);
            }

            const { data, error } = await query;

            if (error) {
                console.warn('Using Mock Data:', error.message);
                let mockData = MOCK_JOBS;
                if (selectedCategory !== 'All') {
                    mockData = mockData.filter(j => j.category === selectedCategory);
                }
                setJobs(mockData);
            } else {
                setJobs(data as Job[] || []);
            }
        } catch (e) {
            console.error(e);
            setJobs(MOCK_JOBS);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchJobs();
        }, [selectedCategory])
    );

    const handleJobPress = (job: Job) => {
        navigation.navigate('JobDetail', { job });
    };

    const handleBecomeProPress = () => {
        navigation.navigate('Login');
    };

    const renderHeader = () => (
        <View style={[styles.headerWrapper, responsive.isWeb && styles.headerWrapperWeb]}>
            {/* Top Navigation Bar */}
            <View style={[styles.navBar, isRTL && styles.navBarRTL]}>
                <View style={[styles.logoContainer, isRTL && styles.rowRTL]}>
                    <Text style={[styles.logoIcon, isRTL && styles.logoIconRTL]}>🔧</Text>
                    <Text style={styles.logoText}>Fiks</Text>
                </View>
                <View style={[styles.navButtons, isRTL && styles.rowRTL]}>
                    <LanguageToggle />
                    {user && (
                        <TouchableOpacity
                            style={[styles.myJobsButton, isRTL && styles.rowRTL]}
                            onPress={() => navigation.navigate('MyJobs')}
                        >
                            <Text style={[styles.myJobsIcon, isRTL && styles.iconRTL]}>📋</Text>
                            <Text style={styles.myJobsText}>{t.nav.myJobs}</Text>
                        </TouchableOpacity>
                    )}
                    {!user ? (
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginButtonText}>{t.nav.signIn}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.userBadge}>
                            <Text style={styles.userBadgeText}>
                                {isPro ? `⭐ ${t.myJobs.pro}` : '👤'}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.postButton, isRTL && styles.rowRTL]}
                        onPress={() => navigation.navigate('CreateJob')}
                    >
                        <Text style={[styles.postButtonIcon, isRTL && styles.iconRTL]}>+</Text>
                        <Text style={styles.postButtonText}>{t.nav.post}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Hero Section */}
            <LinearGradient
                colors={COLORS.gradients.primary as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
            >
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80' }}
                    style={styles.heroBgImage}
                />
                <View style={styles.heroContent}>
                    <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>{t.home.title}</Text>
                    <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
                        {t.home.subtitle}
                    </Text>
                </View>
            </LinearGradient>

            {/* Category Pills - Only show on mobile/when sidebar is hidden */}
            {!responsive.showSidebar && (
                <View style={styles.categoriesSection}>
                    <FlatList
                        horizontal
                        inverted={isRTL}
                        data={CATEGORIES}
                        keyExtractor={(item) => item.name}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesContainer}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.categoryPill,
                                    selectedCategory === item.name && {
                                        backgroundColor: item.color,
                                        borderColor: item.color,
                                    }
                                ]}
                                onPress={() => setSelectedCategory(item.name)}
                                activeOpacity={0.7}
                            >
                                <Image source={{ uri: item.image }} style={styles.categoryImage} />
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === item.name && styles.categoryTextSelected
                                ]}>
                                    {getCategoryTranslation(t, item.name)}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {/* Feed Header */}
            <View style={[styles.feedHeader, isRTL && styles.feedHeaderRTL]}>
                <Text style={[styles.feedTitle, isRTL && styles.textRTL]}>
                    {selectedCategory === 'All'
                        ? t.home.latestJobs
                        : `${getCategoryTranslation(t, selectedCategory)}`
                    }
                </Text>
                <Text style={styles.feedCount}>{jobs.length} {t.home.available}</Text>
            </View>
        </View>
    );

    const renderFeed = () => (
        <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
                <JobCard
                    job={item}
                    isPro={isPro}
                    onPress={handleJobPress}
                    index={index}
                />
            )}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={[
                styles.listContent,
                responsive.isWeb && !responsive.isMobile && styles.listContentWeb,
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>{t.home.noJobsFound}</Text>
                    <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
                        {t.home.beFirst}
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => navigation.navigate('CreateJob')}
                    >
                        <Text style={styles.emptyButtonText}>{t.home.postJob}</Text>
                    </TouchableOpacity>
                </View>
            }
        />
    );

    // Calculate total bids for sidebar
    const totalBids = jobs.reduce((acc, job) => acc + (job.bids?.length || 0), 0);

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingSpinner}>
                        <ActivityIndicator size="large" color="#6366F1" />
                        <Text style={[styles.loadingText, isRTL && styles.textRTL]}>{t.home.loading}</Text>
                    </View>
                </View>
            </View>
        );
    }

    // Web layout with sidebar
    if (responsive.showSidebar) {
        return (
            <View style={styles.container}>
                <StatusBar style="dark" />
                <ScrollView
                    style={styles.webScrollView}
                    contentContainerStyle={styles.webScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.webLayout, isRTL && styles.webLayoutRTL]}>
                        {/* Left Sidebar */}
                        <WebSidebar
                            totalJobs={jobs.length}
                            activeBids={totalBids}
                            selectedCategory={selectedCategory}
                            onCategorySelect={setSelectedCategory}
                            onBecomeProPress={handleBecomeProPress}
                            isRTL={isRTL}
                        />

                        {/* Center Feed */}
                        <View style={styles.webFeedContainer}>
                            {renderHeader()}
                            {jobs.map((item, index) => (
                                <JobCard
                                    key={item.id}
                                    job={item}
                                    isPro={isPro}
                                    onPress={handleJobPress}
                                    index={index}
                                />
                            ))}
                            {jobs.length === 0 && (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyIcon}>🔍</Text>
                                    <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>{t.home.noJobsFound}</Text>
                                    <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
                                        {t.home.beFirst}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.emptyButton}
                                        onPress={() => navigation.navigate('CreateJob')}
                                    >
                                        <Text style={styles.emptyButtonText}>{t.home.postJob}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Right spacer for balance */}
                        <View style={styles.webRightSpacer} />
                    </View>
                </ScrollView>
            </View>
        );
    }

    // Mobile/Tablet layout
    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            {renderFeed()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingSpinner: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: COLORS.gray[500],
        fontFamily: FONTS.body.regular,
    },
    // Web layout styles
    webScrollView: {
        flex: 1,
    },
    webScrollContent: {
        minHeight: '100%',
    },
    webLayout: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    webLayoutRTL: {
        flexDirection: 'row-reverse',
    },
    webFeedContainer: {
        width: RESPONSIVE_LAYOUT.feedMaxWidth,
        maxWidth: RESPONSIVE_LAYOUT.feedMaxWidth,
    },
    // Header styles
    webRightSpacer: {
        width: RESPONSIVE_LAYOUT.sidebarWidth,
        ...Platform.select({
            web: {
                display: 'none',
            } as any,
        }),
    },
    headerWrapper: {
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        borderBottomWidth: 1,
        borderColor: COLORS.gray[200],
        // Flat design - no shadow
        marginBottom: 16,
    },
    headerWrapperWeb: {
        borderRadius: 24,
        marginBottom: 20,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : Platform.OS === 'web' ? 16 : 16,
        paddingBottom: 12,
    },
    navBarRTL: {
        flexDirection: 'row-reverse',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowRTL: {
        flexDirection: 'row-reverse',
    },
    logoIcon: {
        fontSize: 28,
        marginRight: 8,
    },
    logoIconRTL: {
        marginRight: 0,
        marginLeft: 8,
    },
    iconRTL: {
        marginRight: 0,
        marginLeft: 4,
    },
    logoText: {
        fontSize: 28,
        fontFamily: FONTS.heading.bold,
        color: COLORS.text,
        letterSpacing: -1,
    },
    navButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    myJobsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        ...Platform.select({
            web: {
                cursor: 'pointer',
            } as any,
        }),
    },
    myJobsIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    myJobsText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6366F1',
    },
    loginButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        ...Platform.select({
            web: {
                cursor: 'pointer',
            } as any,
        }),
    },
    loginButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    userBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
    },
    userBadgeText: {
        fontSize: 14,
        fontFamily: FONTS.body.semiBold,
        color: COLORS.primary,
    },
    postButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        // Flat design - no shadow

        ...Platform.select({
            web: {
                cursor: 'pointer',
            } as any,
        }),
    },
    postButtonIcon: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginRight: 4,
    },
    postButtonText: {
        fontSize: 14,
        fontFamily: FONTS.body.bold, // Updated to bold
        color: '#FFFFFF',
    },
    heroGradient: {
        margin: 20,
        borderRadius: THEME_LAYOUT.borderRadius.l,
        padding: 0, // Remove padding to let image fill, add padding to content
        ...SHADOWS.glow,
        overflow: 'hidden',
        position: 'relative',
    },
    heroBgImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.2,
    },
    heroContent: {
        padding: 24,
    },
    heroTitle: {
        fontSize: 32,
        fontFamily: FONTS.heading.bold,
        color: COLORS.white, // White text on gradient
        letterSpacing: -1,
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.95)', // White text on gradient
        fontFamily: FONTS.body.regular,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    textRTL: {
        textAlign: 'right',
    },
    categoriesSection: {
        paddingBottom: 16,
    },
    categoriesContainer: {
        paddingHorizontal: 20,
        gap: 10,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        paddingRight: 16,
        borderRadius: 30, // Pill shape
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.white,
        marginRight: 8,
        ...SHADOWS.card,
        ...Platform.select({
            web: {
                cursor: 'pointer',
            } as any,
        }),
    },
    categoryImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: COLORS.gray[200],
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    categoryTextSelected: {
        color: '#FFFFFF',
    },
    feedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    feedHeaderRTL: {
        flexDirection: 'row-reverse',
    },
    feedTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    feedCount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#94A3B8',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    listContentWeb: {
        maxWidth: RESPONSIVE_LAYOUT.feedMaxWidth,
        alignSelf: 'center',
        width: '100%',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        ...Platform.select({
            web: {
                cursor: 'pointer',
            } as any,
        }),
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default HomeScreen;
