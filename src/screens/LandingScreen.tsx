import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Platform,
    Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS } from '../theme';
import { useTranslation } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';
import {
    LandingHero,
    FeatureShowcase,
    HowItWorks,
    StatsSection,
    TestimonialsCarousel,
    CTABanner,
} from '../components/landing';
import { ToolIcon } from '../components/icons/Icons';

type LandingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

type Props = {
    navigation: LandingScreenNavigationProp;
};

/**
 * LandingScreen - Main landing/marketing page for Fiks
 * Composes all landing components into a cohesive page
 */
const LandingScreen: React.FC<Props> = ({ navigation }) => {
    const { t, isRTL } = useTranslation();

    const handleFindPro = () => {
        navigation.navigate('Home');
    };

    const handleBecomePro = () => {
        navigation.navigate('Login');
    };

    const handleCreateJob = () => {
        navigation.navigate('CreateJob');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Floating Navigation Bar */}
            <View style={[styles.navBar, isRTL && styles.navBarRTL]}>
                <View style={[styles.logoContainer, isRTL && styles.rowRTL]}>
                    <View style={styles.logoIconContainer}>
                        <ToolIcon size={20} color="#8B5CF6" />
                    </View>
                    <Text style={styles.logoText}>Fiks</Text>
                </View>
                <View style={[styles.navButtons, isRTL && styles.rowRTL]}>
                    <LanguageToggle />
                    <TouchableOpacity
                        style={styles.navLink}
                        onPress={handleFindPro}
                    >
                        <Text style={styles.navLinkText}>Browse Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={handleCreateJob}
                    >
                        <Text style={styles.ctaButtonText}>Post a Job</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <LandingHero
                    onFindPro={handleFindPro}
                    onBecomePro={handleBecomePro}
                    isRTL={isRTL}
                />

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
                            Connecting you with trusted local professionals
                        </Text>
                    </View>

                    <View style={[styles.footerLinks, isRTL && styles.footerLinksRTL]}>
                        <View style={styles.footerColumn}>
                            <Text style={[styles.footerColumnTitle, isRTL && styles.textRTL]}>Services</Text>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>Electricity</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>Plumbing</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>Assembly</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>Moving</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerColumn}>
                            <Text style={[styles.footerColumnTitle, isRTL && styles.textRTL]}>Company</Text>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>About Us</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>How It Works</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>Become a Pro</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerColumn}>
                            <Text style={[styles.footerColumnTitle, isRTL && styles.textRTL]}>Support</Text>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>Help Center</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>Contact Us</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerLink}>
                                <Text style={[styles.footerLinkText, isRTL && styles.textRTL]}>Privacy Policy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footerBottom}>
                        <Text style={styles.copyright}>
                            © 2026 Fiks. All rights reserved.
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
    // Floating Navigation Bar
    navBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : Platform.OS === 'web' ? 20 : 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        zIndex: 100,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
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
    logoText: {
        fontSize: 24,
        fontFamily: FONTS.heading.bold,
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    navButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
        paddingHorizontal: 16,
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
    textRTL: {
        textAlign: 'right',
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
