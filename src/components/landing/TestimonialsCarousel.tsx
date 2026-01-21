import React, { useRef, useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Platform,
    Animated,
    Dimensions,
    TouchableOpacity,
    Image,
} from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../../theme';
import { StarIcon, QuoteIcon } from '../icons/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TestimonialsCarouselProps {
    isRTL?: boolean;
}

interface Testimonial {
    id: number;
    name: string;
    role: string;
    avatar: string;
    rating: number;
    quote: string;
    jobType: string;
}

const TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: 'Sarah Johnson',
        role: 'Homeowner',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
        rating: 5,
        quote: 'Found an amazing electrician within an hour of posting. The whole process was seamless and transparent.',
        jobType: 'Electricity',
    },
    {
        id: 2,
        name: 'Michael Chen',
        role: 'Business Owner',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        rating: 5,
        quote: 'As a business owner, I need reliable pros fast. Fiks has become my go-to for all maintenance needs.',
        jobType: 'Plumbing',
    },
    {
        id: 3,
        name: 'Emma Wilson',
        role: 'Property Manager',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
        rating: 5,
        quote: 'Managing multiple properties is easy with Fiks. Verified pros, competitive bids, quality work every time.',
        jobType: 'Assembly',
    },
    {
        id: 4,
        name: 'David Kim',
        role: 'First-time User',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
        rating: 5,
        quote: 'Was skeptical at first, but the reviews and verification badges gave me confidence. Will definitely use again!',
        jobType: 'Moving',
    },
];

/**
 * TestimonialCard - Individual testimonial with rating stars
 */
const TestimonialCard: React.FC<{ testimonial: Testimonial; isRTL?: boolean }> = ({
    testimonial,
    isRTL = false
}) => (
    <View style={[styles.testimonialCard, isRTL && styles.testimonialCardRTL]}>
        {/* Quote icon */}
        <View style={styles.quoteIconContainer}>
            <QuoteIcon size={24} color="#8B5CF620" />
        </View>

        {/* Quote text */}
        <Text style={[styles.quoteText, isRTL && styles.textRTL]}>
            "{testimonial.quote}"
        </Text>

        {/* Rating stars */}
        <View style={[styles.ratingContainer, isRTL && styles.ratingContainerRTL]}>
            {[...Array(testimonial.rating)].map((_, i) => (
                <StarIcon key={i} size={18} color="#F59E0B" />
            ))}
        </View>

        {/* User info */}
        <View style={[styles.userInfo, isRTL && styles.userInfoRTL]}>
            <Image
                source={{ uri: testimonial.avatar }}
                style={styles.avatar}
            />
            <View style={isRTL ? styles.userTextRTL : styles.userText}>
                <Text style={[styles.userName, isRTL && styles.textRTL]}>{testimonial.name}</Text>
                <Text style={[styles.userRole, isRTL && styles.textRTL]}>
                    {testimonial.role} • {testimonial.jobType}
                </Text>
            </View>
        </View>
    </View>
);

/**
 * TestimonialsCarousel - Social proof section with auto-playing carousel
 * Features: Star ratings, customer photos, smooth animations
 */
const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({ isRTL = false }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const cardWidth = SCREEN_WIDTH > 900 ? 360 : SCREEN_WIDTH > 600 ? 320 : SCREEN_WIDTH - 48;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>TESTIMONIALS</Text>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                    What Our Customers Say
                </Text>
                <Text style={[styles.sectionSubtitle, isRTL && styles.textRTL]}>
                    Real stories from real customers who found their perfect pro
                </Text>
            </View>

            {/* Desktop: Show grid, Mobile: Show carousel */}
            {SCREEN_WIDTH > 900 ? (
                <View style={[styles.testimonialsGrid, isRTL && styles.testimonialsGridRTL]}>
                    {TESTIMONIALS.slice(0, 3).map((testimonial) => (
                        <TestimonialCard
                            key={testimonial.id}
                            testimonial={testimonial}
                            isRTL={isRTL}
                        />
                    ))}
                </View>
            ) : (
                <View style={styles.carouselContainer}>
                    <View style={[styles.carousel, isRTL && styles.carouselRTL]}>
                        {TESTIMONIALS.map((testimonial, index) => (
                            <Animated.View
                                key={testimonial.id}
                                style={[
                                    styles.carouselItem,
                                    {
                                        width: cardWidth,
                                        opacity: index === activeIndex ? 1 : 0.3,
                                        transform: [{ scale: index === activeIndex ? 1 : 0.9 }],
                                    },
                                    index !== activeIndex && { display: 'none' },
                                ]}
                            >
                                <TestimonialCard testimonial={testimonial} isRTL={isRTL} />
                            </Animated.View>
                        ))}
                    </View>

                    {/* Dots indicator */}
                    <View style={styles.dotsContainer}>
                        {TESTIMONIALS.map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setActiveIndex(index)}
                                style={[
                                    styles.dot,
                                    index === activeIndex && styles.dotActive,
                                ]}
                            />
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 80,
        paddingHorizontal: 24,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        maxWidth: 600,
        alignSelf: 'center',
        marginBottom: 48,
    },
    sectionLabel: {
        fontSize: 13,
        fontFamily: FONTS.body.bold,
        color: '#8B5CF6',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
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
    sectionSubtitle: {
        fontSize: 18,
        fontFamily: FONTS.body.regular,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 28,
    },
    textRTL: {
        textAlign: 'right',
    },
    testimonialsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 24,
        maxWidth: 1200,
        alignSelf: 'center',
    },
    testimonialsGridRTL: {
        flexDirection: 'row-reverse',
    },
    carouselContainer: {
        alignItems: 'center',
    },
    carousel: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    carouselRTL: {
        flexDirection: 'row-reverse',
    },
    carouselItem: {
        // Width set dynamically
    },
    testimonialCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        width: SCREEN_WIDTH > 900 ? 360 : '100%',
        maxWidth: 380,
        position: 'relative',
        ...SHADOWS.card,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    testimonialCardRTL: {
        alignItems: 'flex-end',
    },
    quoteIconContainer: {
        position: 'absolute',
        top: 24,
        right: 24,
    },
    quoteText: {
        fontSize: 16,
        fontFamily: FONTS.body.regular,
        color: COLORS.text,
        lineHeight: 26,
        marginBottom: 20,
        fontStyle: 'italic',
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: 20,
    },
    ratingContainerRTL: {
        flexDirection: 'row-reverse',
        alignSelf: 'flex-end',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    userInfoRTL: {
        flexDirection: 'row-reverse',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.gray[200],
    },
    userText: {
        flex: 1,
    },
    userTextRTL: {
        flex: 1,
        alignItems: 'flex-end',
    },
    userName: {
        fontSize: 16,
        fontFamily: FONTS.body.bold,
        color: COLORS.text,
        marginBottom: 2,
    },
    userRole: {
        fontSize: 14,
        fontFamily: FONTS.body.regular,
        color: COLORS.textLight,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.gray[300],
        ...Platform.select({
            web: {
                cursor: 'pointer',
            } as any,
        }),
    },
    dotActive: {
        backgroundColor: '#8B5CF6',
        width: 24,
    },
});

export default TestimonialsCarousel;
