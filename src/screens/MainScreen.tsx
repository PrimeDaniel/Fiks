import React, { useState, useCallback, useRef } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Platform,
    Image,
    Dimensions,
    FlatList,
    ActivityIndicator,
    NativeScrollEvent,
    NativeSyntheticEvent,
    LayoutChangeEvent,
    Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../services/supabase';
import { Job, JobCategory } from '../types/database';
import { COLORS, FONTS, SHADOWS, LAYOUT as THEME_LAYOUT } from '../theme';
import { useTranslation, getCategoryTranslation } from '../i18n';
import { useResponsive, LAYOUT as RESPONSIVE_LAYOUT } from '../utils/responsive';
import LanguageToggle from '../components/LanguageToggle';
import ThemeSwitcher from '../components/ThemeSwitcher';
import JobCard from '../components/JobCard';
import WebSidebar from '../components/WebSidebar';
import { ToolIcon, ChevronDownIcon } from '../components/icons/Icons';
import {
    LandingHero,
    FeatureShowcase,
    HowItWorks,
    StatsSection,
    TestimonialsCarousel,
    CTABanner,
} from '../components/landing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
        description: 'Kitchen sink is dripping constantly. Need a plumber ASAP.',
        category: 'Plumbing',
        photos: [],
        price_offer: 80,
        schedule_description: 'Available weekdays after 5 PM',
        allow_counter_offers: true,
        status: 'Open',
        views_count: 24,
        saves_count: 3,
        profile: { id: 'mock-user-1', full_name: 'John Doe', role: 'client', created_at: '', updated_at: '' },
        bids: [{ id: '1', created_at: '', updated_at: '', job_id: '1', pro_id: '1', price: 75, status: 'Pending' }],
    },
    {
        id: '2',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock-user-2',
        title: 'Assemble IKEA Wardrobe',
        description: 'Need help assembling a PAX wardrobe. Tools will be provided.',
        category: 'Assembly',
        photos: [],
        price_offer: 120,
        schedule_description: 'Weekend only',
        allow_counter_offers: false,
        status: 'Open',
        views_count: 18,
        saves_count: 5,
        profile: { id: 'mock-user-2', full_name: 'Jane Smith', role: 'client', created_at: '', updated_at: '' },
        bids: [],
    },
    {
        id: '3',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock-user-3',
        title: 'Install Ceiling Fan',
        description: 'Replacing an old light fixture with a ceiling fan.',
        category: 'Electricity',
        photos: [],
        price_offer: 150,
        schedule_description: 'Anytime this week',
        allow_counter_offers: true,
        status: 'Open',
        views_count: 42,
        saves_count: 8,
        profile: { id: 'mock-user-3', full_name: 'Mike Johnson', role: 'client', created_at: '', updated_at: '' },
        bids: [{ id: '2', created_at: '', updated_at: '', job_id: '3', pro_id: '2', price: 140, status: 'Pending' }, { id: '3', created_at: '', updated_at: '', job_id: '3', pro_id: '3', price: 145, status: 'Pending' }],
    },
    {
        id: '4',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock-user-4',
        title: 'Help Moving Apartment',
        description: 'Moving from a 2BR apartment. Need help with heavy furniture.',
        category: 'Moving',
        photos: [],
        price_offer: 250,
        schedule_description: 'This Saturday 9 AM - 3 PM',
        allow_counter_offers: true,
        status: 'Open',
        views_count: 67,
        saves_count: 12,
        profile: { id: 'mock-user-4', full_name: 'Sarah Wilson', role: 'client', created_at: '', updated_at: '' },
        bids: [{ id: '4', created_at: '', updated_at: '', job_id: '4', pro_id: '4', price: 230, status: 'Pending' }],
    },
];

type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

type Props = {
    navigation: MainScreenNavigationProp;
};

const SCROLL_THRESHOLD_NAVBAR = 80;

const MainScreen: React.FC<Props> = ({ navigation }) => {
    const { t, isRTL } = useTranslation();
    const responsive = useResponsive();
    const scrollRef = useRef<ScrollView>(null);
    const jobSectionY = useRef(0);
    const scrollYAnimated = useRef(new Animated.Value(0)).current;

    const [scrollY, setScrollY] = useState(0);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'All'>('All');
    const [isPro, setIsPro] = useState(false);
    const [user, setUser] = useState<any>(null);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const { data: { user: u } } = await supabase.auth.getUser();
            setUser(u);
            if (u) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', u.id).single();
                setIsPro(profile?.role === 'pro');
            }
            let query = supabase.from('jobs').select('*, profiles(*), bids(*)').eq('status', 'Open').order('created_at', { ascending: false });
            if (selectedCategory !== 'All') query = query.eq('category', selectedCategory);
            const { data, error } = await query;
            if (error) {
                let mockData = selectedCategory === 'All' ? MOCK_JOBS : MOCK_JOBS.filter(j => j.category === selectedCategory);
                setJobs(mockData);
            } else {
                setJobs((data as Job[]) || []);
            }
        } catch (e) {
            setJobs(MOCK_JOBS);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchJobs(); }, [selectedCategory]));

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollYAnimated } } }],
        { useNativeDriver: true, listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => setScrollY(e.nativeEvent.contentOffset.y) }
    );

    const handleScrollToJobs = () => {
        scrollRef.current?.scrollTo({ y: jobSectionY.current, animated: true });
    };

    const handleJobSectionLayout = (event: LayoutChangeEvent) => {
        const { layout } = event.nativeEvent;
        jobSectionY.current = layout.y;
    };

    const handleFindPro = () => handleScrollToJobs();
    const handleBecomePro = () => navigation.navigate('Login');
    const handleCreateJob = () => navigation.navigate('CreateJob');
    const handleJobPress = (job: Job) => navigation.navigate('JobDetail', { job });
    const handleBecomeProPress = () => navigation.navigate('Login');

    const isNavbarPinned = scrollY > SCROLL_THRESHOLD_NAVBAR;
    const totalBids = jobs.reduce((acc, job) => acc + (job.bids?.length || 0), 0);

    const renderStickyNavBar = () => (
        <View
            style={[
                styles.navBar,
                isRTL && styles.navBarRTL,
                isNavbarPinned && styles.navBarPinned,
            ]}
        >
            <View style={[styles.logoContainer, isRTL && styles.rowRTL]}>
                <View style={[styles.logoIconContainer, isNavbarPinned && styles.logoIconContainerPinned]}>
                    <ToolIcon size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.logoText}>Fiks</Text>
            </View>
            <View style={[styles.navButtons, isRTL && styles.rowRTL]}>
                <View style={[styles.settingsGroup, isRTL && styles.rowRTL]}>
                    <LanguageToggle />
                    <ThemeSwitcher />
                </View>
                <View style={styles.navDivider} />
                <TouchableOpacity style={styles.navLink} onPress={handleScrollToJobs} activeOpacity={0.8}>
                    <Text style={styles.navLinkText}>{t.landing.browseJobs}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
                    <Text style={styles.loginButtonText}>{t.landing.signIn}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ctaButton} onPress={handleCreateJob} activeOpacity={0.8}>
                    <Text style={styles.ctaButtonText}>{t.landing.postAJob}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderJobFeed = () => (
        <View style={[styles.jobFeedSection, responsive.showSidebar && styles.jobFeedSectionRow]}>
            {responsive.showSidebar && (
                <WebSidebar
                    totalJobs={jobs.length}
                    activeBids={totalBids}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    onBecomeProPress={handleBecomeProPress}
                    isRTL={isRTL}
                />
            )}
            <View style={styles.jobFeedContent}>
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
                                    style={[styles.categoryPill, selectedCategory === item.name && { backgroundColor: item.color, borderColor: item.color }]}
                                    onPress={() => setSelectedCategory(item.name)}
                                    activeOpacity={0.7}
                                >
                                    <Image source={{ uri: item.image }} style={styles.categoryImage} />
                                    <Text style={[styles.categoryText, selectedCategory === item.name && styles.categoryTextSelected]}>
                                        {getCategoryTranslation(t, item.name)}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
                <View style={[styles.feedHeader, isRTL && styles.feedHeaderRTL]}>
                    <Text style={[styles.feedTitle, isRTL && styles.textRTL]}>
                        {selectedCategory === 'All' ? t.home.latestJobs : getCategoryTranslation(t, selectedCategory)}
                    </Text>
                    <Text style={styles.feedCount}>{jobs.length} {t.home.available}</Text>
                </View>
                {loading ? (
                    <View style={styles.loadingRow}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={[styles.loadingText, isRTL && styles.textRTL]}>{t.home.loading}</Text>
                    </View>
                ) : jobs.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>{t.home.noJobsFound}</Text>
                        <Text style={[styles.emptyText, isRTL && styles.textRTL]}>{t.home.beFirst}</Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('CreateJob')}>
                            <Text style={styles.emptyButtonText}>{t.home.postJob}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    jobs.map((item, index) => (
                        <JobCard key={item.id} job={item} isPro={isPro} onPress={handleJobPress} index={index} />
                    ))
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ScrollView
                ref={scrollRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                stickyHeaderIndices={[0]}
            >
                {renderStickyNavBar()}
                <Animated.View style={[styles.heroParallaxWrap, { transform: [{ translateY: scrollYAnimated.interpolate({ inputRange: [0, 400], outputRange: [0, -50] }) }] }]}>
                    <LandingHero onFindPro={handleScrollToJobs} onBecomePro={handleBecomePro} isRTL={isRTL} />
                </Animated.View>
                <Animated.View style={[styles.scrollIndicatorWrap, { opacity: scrollYAnimated.interpolate({ inputRange: [0, 120], outputRange: [1, 0], extrapolate: 'clamp' }) }]}>
                    <Text style={[styles.scrollIndicatorText, isRTL && styles.textRTL]}>{t.main.scrollToExplore}</Text>
                    <ChevronDownIcon size={20} color="rgba(255,255,255,0.9)" />
                </Animated.View>
                <View style={styles.proGallerySection}>
                    <View style={styles.galleryHeader}>
                        <Text style={[styles.gallerySectionLabel, isRTL && styles.textRTL]}>{t.landing.proGalleryLabel}</Text>
                        <Text style={[styles.gallerySectionTitle, isRTL && styles.textRTL]}>{t.landing.proGalleryTitle}</Text>
                        <Text style={[styles.gallerySectionSubtitle, isRTL && styles.textRTL]}>{t.landing.proGallerySubtitle}</Text>
                    </View>
                    <View style={[styles.proGalleryGrid, isRTL && styles.proGalleryGridRTL]}>
                        <View style={styles.proPhotoCard}>
                            <Image source={require('../../assets/pro_electrician.png')} style={styles.proPhotoImage} resizeMode="cover" />
                            <View style={styles.proPhotoOverlay}>
                                <Text style={[styles.proPhotoTitle, isRTL && styles.textRTL]}>{t.landing.electricalWork}</Text>
                                <Text style={[styles.proPhotoDescription, isRTL && styles.textRTL]}>{t.landing.electricalDesc}</Text>
                            </View>
                        </View>
                        <View style={styles.proPhotoCard}>
                            <Image source={require('../../assets/pro_plumber.png')} style={styles.proPhotoImage} resizeMode="cover" />
                            <View style={styles.proPhotoOverlay}>
                                <Text style={[styles.proPhotoTitle, isRTL && styles.textRTL]}>{t.landing.plumbingServices}</Text>
                                <Text style={[styles.proPhotoDescription, isRTL && styles.textRTL]}>{t.landing.plumbingDesc}</Text>
                            </View>
                        </View>
                        <View style={styles.proPhotoCard}>
                            <Image source={require('../../assets/pro_handyman.png')} style={styles.proPhotoImage} resizeMode="cover" />
                            <View style={styles.proPhotoOverlay}>
                                <Text style={[styles.proPhotoTitle, isRTL && styles.textRTL]}>{t.landing.furnitureAssembly}</Text>
                                <Text style={[styles.proPhotoDescription, isRTL && styles.textRTL]}>{t.landing.furnitureDesc}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <FeatureShowcase isRTL={isRTL} />
                <HowItWorks isRTL={isRTL} />
                <StatsSection isRTL={isRTL} />
                <TestimonialsCarousel isRTL={isRTL} />
                <CTABanner onGetStarted={handleCreateJob} isRTL={isRTL} />
                <View style={styles.transitionZone} onLayout={handleJobSectionLayout}>
                    <View style={styles.transitionWave} />
                    <Text style={[styles.transitionTitle, isRTL && styles.textRTL]}>{t.main.browseAvailableJobs}</Text>
                    <Text style={[styles.transitionSubtitle, isRTL && styles.textRTL]}>
                        {t.main.browseAvailableJobsSubtitle}
                    </Text>
                </View>
                {renderJobFeed()}
                <View style={[styles.footer, isRTL && styles.footerRTL]}>
                    <View style={styles.footerTop}>
                        <View style={[styles.footerBrand, isRTL && styles.footerBrandRTL]}>
                            <View style={styles.footerLogoContainer}>
                                <ToolIcon size={24} color="#8B5CF6" />
                            </View>
                            <Text style={styles.footerLogoText}>Fiks</Text>
                        </View>
                        <Text style={[styles.footerTagline, isRTL && styles.textRTL]}>{t.landing.footerTagline}</Text>
                    </View>
                    <View style={[styles.footerLinks, isRTL && styles.footerLinksRTL]}>
                        <View style={styles.footerColumn}>
                            <Text style={[styles.footerColumnTitle, isRTL && styles.textRTL]}>{t.landing.services}</Text>
                            <TouchableOpacity style={styles.footerLink}><Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.categories.electricity}</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}><Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.categories.plumbing}</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}><Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.categories.assembly}</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}><Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.categories.moving}</Text></TouchableOpacity>
                        </View>
                        <View style={styles.footerColumn}>
                            <Text style={[styles.footerColumnTitle, isRTL && styles.textRTL]}>{t.landing.company}</Text>
                            <TouchableOpacity style={styles.footerLink}><Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.landing.aboutUs}</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}><Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.landing.howItWorks}</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}><Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.sidebar.becomePro}</Text></TouchableOpacity>
                        </View>
                        <View style={styles.footerColumn}>
                            <Text style={[styles.footerColumnTitle, isRTL && styles.textRTL]}>{t.landing.support}</Text>
                            <TouchableOpacity style={styles.footerLink}><Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.landing.helpCenter}</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}><Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.landing.contactUs}</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}><Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.landing.privacyPolicy}</Text></TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.footerBottom}>
                        <Text style={styles.copyright}>{t.landing.copyright}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollView: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'ios' ? 50 : Platform.OS === 'web' ? 16 : 16,
        backgroundColor: 'rgba(255,255,255,0.75)',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
            android: { elevation: 3 },
            web: { boxShadow: '0 2px 12px rgba(0,0,0,0.06)', backdropFilter: 'blur(10px)', transition: 'background-color 0.2s ease' } as any,
        }),
    },
    navBarPinned: {
        backgroundColor: 'rgba(255,255,255,0.98)',
        ...Platform.select({
            ios: { shadowOpacity: 0.12, shadowRadius: 16 },
            android: { elevation: 8 },
            web: { boxShadow: '0 4px 24px rgba(0,0,0,0.1)' } as any,
        }),
    },
    navBarRTL: { flexDirection: 'row-reverse' },
    logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rowRTL: { flexDirection: 'row-reverse' },
    logoIconContainer: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: '#8B5CF615',
        justifyContent: 'center', alignItems: 'center',
    },
    logoIconContainerPinned: { backgroundColor: '#8B5CF620' },
    logoText: { fontSize: 22, fontFamily: FONTS.heading.bold, color: COLORS.text, letterSpacing: -0.5 },
    navButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    settingsGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(241, 245, 249, 0.8)', borderRadius: 14, padding: 4 },
    navDivider: { width: 1, height: 24, backgroundColor: COLORS.gray[200], marginHorizontal: 8 },
    navLink: { paddingHorizontal: 12, paddingVertical: 8, ...Platform.select({ web: { cursor: 'pointer' } as any }) },
    navLinkText: { fontSize: 14, fontFamily: FONTS.body.semiBold, color: COLORS.textLight },
    loginButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.gray[100], ...Platform.select({ web: { cursor: 'pointer' } as any }) },
    loginButtonText: { fontSize: 14, fontFamily: FONTS.body.semiBold, color: COLORS.text },
    ctaButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#8B5CF6', ...Platform.select({ web: { cursor: 'pointer' } as any }) },
    ctaButtonText: { fontSize: 14, fontFamily: FONTS.body.bold, color: 'white' },
    heroParallaxWrap: {},
    scrollIndicatorWrap: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 16, marginBottom: 24,
    },
    scrollIndicatorText: { fontSize: 14, fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.9)' },
    textRTL: { textAlign: 'right' },
    proGallerySection: { paddingVertical: 80, paddingHorizontal: 24, backgroundColor: 'white' },
    galleryHeader: { maxWidth: 600, alignSelf: 'center', marginBottom: 48 },
    gallerySectionLabel: { fontSize: 13, fontFamily: FONTS.body.bold, color: '#8B5CF6', letterSpacing: 2, textAlign: 'center', marginBottom: 12 },
    gallerySectionTitle: { fontSize: 36, fontFamily: FONTS.heading.bold, color: COLORS.text, textAlign: 'center', marginBottom: 16, ...Platform.select({ web: { fontSize: 42 } }) },
    gallerySectionSubtitle: { fontSize: 18, fontFamily: FONTS.body.regular, color: COLORS.textLight, textAlign: 'center', lineHeight: 28 },
    proGalleryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, maxWidth: 1100, alignSelf: 'center', width: '100%' },
    proGalleryGridRTL: { flexDirection: 'row-reverse' },
    proPhotoCard: {
        width: SCREEN_WIDTH > 900 ? 340 : SCREEN_WIDTH > 600 ? '45%' : '100%',
        minWidth: 280, maxWidth: 360, height: 280, borderRadius: 20, overflow: 'hidden', position: 'relative',
        ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16 }, android: { elevation: 8 }, web: { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', cursor: 'pointer' } as any }),
    },
    proPhotoImage: { width: '100%', height: '100%' },
    proPhotoOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 40,
        ...Platform.select({ web: { background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' } as any, default: { backgroundColor: 'rgba(0,0,0,0.4)' } }),
    },
    proPhotoTitle: { fontSize: 18, fontFamily: FONTS.heading.bold, color: 'white', marginBottom: 4 },
    proPhotoDescription: { fontSize: 14, fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.85)' },
    transitionZone: {
        paddingVertical: 48, paddingHorizontal: 24, backgroundColor: COLORS.background, alignItems: 'center',
    },
    transitionWave: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        backgroundColor: 'transparent',
        ...Platform.select({ web: { background: 'linear-gradient(90deg, transparent, #8B5CF6, #EC4899, transparent)' } as any }),
    },
    transitionTitle: { fontSize: 28, fontFamily: FONTS.heading.bold, color: COLORS.text, marginBottom: 8, textAlign: 'center' },
    transitionSubtitle: { fontSize: 16, fontFamily: FONTS.body.regular, color: COLORS.textLight, textAlign: 'center' },
    jobFeedSection: { paddingHorizontal: 24, paddingBottom: 32, backgroundColor: COLORS.background },
    jobFeedSectionRow: { flexDirection: 'row', justifyContent: 'center', maxWidth: 1200, alignSelf: 'center', width: '100%' },
    jobFeedContent: { flex: 1, maxWidth: RESPONSIVE_LAYOUT.feedMaxWidth },
    categoriesSection: { paddingBottom: 16 },
    categoriesContainer: { paddingHorizontal: 4, gap: 10 },
    categoryPill: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, paddingRight: 16, borderRadius: 30,
        backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.white, marginRight: 8,
        ...SHADOWS.card, ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    categoryImage: { width: 32, height: 32, borderRadius: 16, marginRight: 8, backgroundColor: COLORS.gray[200] },
    categoryText: { fontSize: 14, fontWeight: '600', color: '#475569' },
    categoryTextSelected: { color: '#FFFFFF' },
    feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 16 },
    feedHeaderRTL: { flexDirection: 'row-reverse' },
    feedTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    feedCount: { fontSize: 14, fontWeight: '500', color: '#94A3B8' },
    loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 32 },
    loadingText: { fontSize: 16, color: COLORS.gray[500], fontFamily: FONTS.body.regular },
    emptyContainer: { padding: 40, alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 20, marginTop: 20, ...SHADOWS.card },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20 },
    emptyButton: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, ...Platform.select({ web: { cursor: 'pointer' } as any }) },
    emptyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    footer: { backgroundColor: '#0F172A', paddingTop: 64, paddingBottom: 32, paddingHorizontal: 24 },
    footerRTL: {},
    footerTop: { maxWidth: 1100, alignSelf: 'center', width: '100%', marginBottom: 48 },
    footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    footerBrandRTL: { flexDirection: 'row-reverse' },
    footerLogoContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.2)', justifyContent: 'center', alignItems: 'center' },
    footerLogoText: { fontSize: 28, fontFamily: FONTS.heading.bold, color: 'white' },
    footerTagline: { fontSize: 16, fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.6)' },
    footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 32, maxWidth: 1100, alignSelf: 'center', width: '100%', marginBottom: 48 },
    footerLinksRTL: { flexDirection: 'row-reverse' },
    footerColumn: { minWidth: 140 },
    footerColumnTitle: { fontSize: 14, fontFamily: FONTS.body.bold, color: 'white', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
    footerLink: { paddingVertical: 6, ...Platform.select({ web: { cursor: 'pointer' } as any }) },
    footerLinkText: { fontSize: 14, fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.6)' },
    footerBottom: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 24, alignItems: 'center' },
    copyright: { fontSize: 14, fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.4)' },
});

export default MainScreen;
