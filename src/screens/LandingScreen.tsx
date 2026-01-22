import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Platform,
    Animated,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Image,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS } from '../theme';
import { useTranslation } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';
import ThemeSwitcher from '../components/ThemeSwitcher';
import {
    LandingHero,
    FeatureShowcase,
    HowItWorks,
    StatsSection,
    TestimonialsCarousel,
    CTABanner,
} from '../components/landing';
import { ToolIcon } from '../components/icons/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type LandingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

type Props = {
    navigation: LandingScreenNavigationProp;
};

// Scroll threshold for navbar behavior
const SCROLL_THRESHOLD = 100;

/**
 * LandingScreen - Main landing/marketing page for Fiks
 * Features: Scroll-aware navbar, dark mode toggle, language switcher, pro photos gallery
 */
const LandingScreen: React.FC<Props> = ({ navigation }) => {
    const { t, isRTL } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);

    // Animation values for navbar
    const navbarAnim = useRef(new Animated.Value(0)).current;
    const navbarOpacity = useRef(new Animated.Value(1)).current;

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        const shouldBeScrolled = scrollY > SCROLL_THRESHOLD;

        if (shouldBeScrolled !== isScrolled) {
            setIsScrolled(shouldBeScrolled);

            // Animate navbar transformation
            Animated.parallel([
                Animated.spring(navbarAnim, {
                    toValue: shouldBeScrolled ? 1 : 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 12,
                }),
                Animated.timing(navbarOpacity, {
                    toValue: shouldBeScrolled ? 1 : 0.98,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    const handleFindPro = () => {
        navigation.navigate('Home');
    };

    const handleBecomePro = () => {
        navigation.navigate('Login');
    };

    const handleCreateJob = () => {
        navigation.navigate('CreateJob');
    };

    // Navbar animation styles
    const navbarStyle = {
        transform: [
            {
                translateY: navbarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0],
                }),
            },
            {
                scale: navbarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.98],
                }),
            },
        ],
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Scroll-aware Navigation Bar */}
            <Animated.View
                style={[
                    styles.navBar,
                    isRTL && styles.navBarRTL,
                    isScrolled && styles.navBarScrolled,
                    navbarStyle,
                ]}
            >
                {/* Logo */}
                <View style={[styles.logoContainer, isRTL && styles.rowRTL]}>
                    <View style={[styles.logoIconContainer, isScrolled && styles.logoIconContainerScrolled]}>
                        <ToolIcon size={20} color="#8B5CF6" />
                    </View>
                    <Text style={[styles.logoText, isScrolled && styles.logoTextScrolled]}>Fiks</Text>
                </View>

                {/* Navigation buttons */}
                <View style={[styles.navButtons, isRTL && styles.rowRTL]}>
                    {/* Settings group (Language + Theme) */}
                    <View style={[styles.settingsGroup, isRTL && styles.rowRTL]}>
                        <LanguageToggle />
                        <ThemeSwitcher />
                    </View>

                    {/* Divider */}
                    <View style={styles.navDivider} />

                    {/* Main nav links */}
                    <TouchableOpacity
                        style={styles.navLink}
                        onPress={handleFindPro}
                    >
                        <Text style={styles.navLinkText}>{t.landing.browseJobs}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>{t.landing.signIn}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={handleCreateJob}
                    >
                        <Text style={styles.ctaButtonText}>{t.landing.postAJob}</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Hero Section */}
                <LandingHero
                    onFindPro={handleFindPro}
                    onBecomePro={handleBecomePro}
                    isRTL={isRTL}
                />

                {/* Pro Photos Gallery Section */}
                <View style={styles.proGallerySection}>
                    <View style={styles.galleryHeader}>
                        <Text style={[styles.gallerySectionLabel, isRTL && styles.textRTL]}>
                            {t.landing.proGalleryLabel}
                        </Text>
                        <Text style={[styles.gallerySectionTitle, isRTL && styles.textRTL]}>
                            {t.landing.proGalleryTitle}
                        </Text>
                        <Text style={[styles.gallerySectionSubtitle, isRTL && styles.textRTL]}>
                            {t.landing.proGallerySubtitle}
                        </Text>
                    </View>

                    <View style={[styles.proGalleryGrid, isRTL && styles.proGalleryGridRTL]}>
                        <View style={styles.proPhotoCard}>
                            <Image
                                source={require('../../assets/pro_electrician.png')}
                                style={styles.proPhotoImage}
                                resizeMode="cover"
                            />
                            <View style={styles.proPhotoOverlay}>
                                <Text style={[styles.proPhotoTitle, isRTL && styles.textRTL]}>{t.landing.electricalWork}</Text>
                                <Text style={[styles.proPhotoDescription, isRTL && styles.textRTL]}>{t.landing.electricalDesc}</Text>
                            </View>
                        </View>
                        <View style={styles.proPhotoCard}>
                            <Image
                                source={require('../../assets/pro_plumber.png')}
                                style={styles.proPhotoImage}
                                resizeMode="cover"
                            />
                            <View style={styles.proPhotoOverlay}>
                                <Text style={[styles.proPhotoTitle, isRTL && styles.textRTL]}>{t.landing.plumbingServices}</Text>
                                <Text style={[styles.proPhotoDescription, isRTL && styles.textRTL]}>{t.landing.plumbingDesc}</Text>
                            </View>
                        </View>
                        <View style={styles.proPhotoCard}>
                            <Image
                                source={require('../../assets/pro_handyman.png')}
                                style={styles.proPhotoImage}
                                resizeMode="cover"
                            />
                            <View style={styles.proPhotoOverlay}>
                                <Text style={[styles.proPhotoTitle, isRTL && styles.textRTL]}>{t.landing.furnitureAssembly}</Text>
                                <Text style={[styles.proPhotoDescription, isRTL && styles.textRTL]}>{t.landing.furnitureDesc}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Features Section */}
                <FeatureShowcase isRTL={isRTL} />

                {/* How It Works Section */}
                <HowItWorks isRTL={isRTL} />

                {/* Stats Section */}
                <StatsSection isRTL={isRTL} />

                {/* Testimonials Section */}
                <TestimonialsCarousel isRTL={isRTL} />

                {/* Bottom CTA Section */}
                <CTABanner onGetStarted={handleCreateJob} isRTL={isRTL} />

                {/* Footer */}
                <View style={[styles.footer, isRTL && styles.footerRTL]}>
                    <View style={styles.footerTop}>
                        <View style={[styles.footerBrand, isRTL && styles.footerBrandRTL]}>
                            <View style={styles.footerLogoContainer}>
                                <ToolIcon size={24} color="#8B5CF6" />
                            </View>
                            <Text style={styles.footerLogoText}>Fiks</Text>
                        </View>
                        <Text style={[styles.footerTagline, isRTL && styles.textRTL]}>
                            {t.landing.footerTagline}
                        </Text>
                    </View>

                    <View style={[styles.footerLinks, isRTL && styles.footerLinksRTL]}>
                        <View style={styles.footerColumn}>
                            <Text style={[styles.footerColumnTitle, isRTL && styles.textRTL]}>{t.landing.services}</Text>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.categories.electricity}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.categories.plumbing}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.categories.assembly}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.categories.moving}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerColumn}>
                            <Text style={[styles.footerColumnTitle, isRTL && styles.textRTL]}>{t.landing.company}</Text>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.landing.aboutUs}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.landing.howItWorks}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.sidebar.becomePro}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerColumn}>
                            <Text style={[styles.footerColumnTitle, isRTL && styles.textRTL]}>{t.landing.support}</Text>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.landing.helpCenter}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.landing.contactUs}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>{t.landing.privacyPolicy}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footerBottom}>
                        <Text style={styles.copyright}>
                            {t.landing.copyright}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    // Scroll-aware Navigation Bar
    navBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : Platform.OS === 'web' ? 16 : 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        zIndex: 100,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease',
            } as any,
        }),
    },
    navBarScrolled: {
        backgroundColor: 'rgba(255,255,255,0.98)',
        ...Platform.select({
            ios: {
                shadowOpacity: 0.15,
                shadowRadius: 16,
            },
            android: {
                elevation: 12,
            },
            web: {
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            } as any,
        }),
    },
    navBarRTL: {
        flexDirection: 'row-reverse',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rowRTL: {
        flexDirection: 'row-reverse',
    },
    logoIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#8B5CF615',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIconContainerScrolled: {
        backgroundColor: '#8B5CF620',
    },
    logoText: {
        fontSize: 22,
        fontFamily: FONTS.heading.bold,
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    logoTextScrolled: {
        color: COLORS.text,
    },
    navButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(241, 245, 249, 0.8)',
        borderRadius: 14,
        padding: 4,
    },
    navDivider: {
        width: 1,
        height: 24,
        backgroundColor: COLORS.gray[200],
        marginHorizontal: 8,
    },
    navLink: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        ...Platform.select({
            web: {
                cursor: 'pointer',
            } as any,
        }),
    },
    navLinkText: {
        fontSize: 14,
        fontFamily: FONTS.body.semiBold,
        color: COLORS.textLight,
    },
    loginButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: COLORS.gray[100],
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            } as any,
        }),
    },
    loginButtonText: {
        fontSize: 14,
        fontFamily: FONTS.body.semiBold,
        color: COLORS.text,
    },
    ctaButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#8B5CF6',
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            } as any,
        }),
    },
    ctaButtonText: {
        fontSize: 14,
        fontFamily: FONTS.body.bold,
        color: 'white',
    },
    // Scroll content
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    // Pro Gallery Section
    proGallerySection: {
        paddingVertical: 80,
        paddingHorizontal: 24,
        backgroundColor: 'white',
    },
    galleryHeader: {
        maxWidth: 600,
        alignSelf: 'center',
        marginBottom: 48,
    },
    gallerySectionLabel: {
        fontSize: 13,
        fontFamily: FONTS.body.bold,
        color: '#8B5CF6',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 12,
    },
    gallerySectionTitle: {
        fontSize: 36,
        fontFamily: FONTS.heading.bold,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 16,
        ...Platform.select({
            web: {
                fontSize: 42,
            },
        }),
    },
    gallerySectionSubtitle: {
        fontSize: 18,
        fontFamily: FONTS.body.regular,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 28,
    },
    textRTL: {
        textAlign: 'right',
    },
    proGalleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 20,
        maxWidth: 1100,
        alignSelf: 'center',
        width: '100%',
    },
    proGalleryGridRTL: {
        flexDirection: 'row-reverse',
    },
    proPhotoCard: {
        width: SCREEN_WIDTH > 900 ? 340 : SCREEN_WIDTH > 600 ? '45%' : '100%',
        minWidth: 280,
        maxWidth: 360,
        height: 280,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            } as any,
        }),
    },
    proPhotoImage: {
        width: '100%',
        height: '100%',
    },
    proPhotoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingTop: 40,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        ...Platform.select({
            web: {
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            } as any,
            default: {
                backgroundColor: 'rgba(0,0,0,0.4)',
            },
        }),
    },
    proPhotoTitle: {
        fontSize: 18,
        fontFamily: FONTS.heading.bold,
        color: 'white',
        marginBottom: 4,
    },
    proPhotoDescription: {
        fontSize: 14,
        fontFamily: FONTS.body.regular,
        color: 'rgba(255,255,255,0.85)',
    },
    // Footer
    footer: {
        backgroundColor: '#0F172A',
        paddingTop: 64,
        paddingBottom: 32,
        paddingHorizontal: 24,
    },
    footerRTL: {},
    footerTop: {
        maxWidth: 1100,
        alignSelf: 'center',
        width: '100%',
        marginBottom: 48,
    },
    footerBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    footerBrandRTL: {
        flexDirection: 'row-reverse',
    },
    footerLogoContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLogoText: {
        fontSize: 28,
        fontFamily: FONTS.heading.bold,
        color: 'white',
    },
    footerTagline: {
        fontSize: 16,
        fontFamily: FONTS.body.regular,
        color: 'rgba(255,255,255,0.6)',
    },
    footerLinks: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 32,
        maxWidth: 1100,
        alignSelf: 'center',
        width: '100%',
        marginBottom: 48,
    },
    footerLinksRTL: {
        flexDirection: 'row-reverse',
    },
    footerColumn: {
        minWidth: 140,
    },
    footerColumnTitle: {
        fontSize: 14,
        fontFamily: FONTS.body.bold,
        color: 'white',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footerLink: {
        paddingVertical: 6,
        ...Platform.select({
            web: {
                cursor: 'pointer',
            } as any,
        }),
    },
    footerLinkText: {
        fontSize: 14,
        fontFamily: FONTS.body.regular,
        color: 'rgba(255,255,255,0.6)',
    },
    footerBottom: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 24,
        alignItems: 'center',
    },
    copyright: {
        fontSize: 14,
        fontFamily: FONTS.body.regular,
        color: 'rgba(255,255,255,0.4)',
    },
});

export default LandingScreen;
