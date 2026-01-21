import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../services/supabase';
import { Job, JobCategory } from '../types/database';
import JobCard from '../components/JobCard';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
    navigation: HomeScreenNavigationProp;
};

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
        profile: {
            id: 'mock-user-1',
            full_name: 'John Doe',
            role: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
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
        profile: {
            id: 'mock-user-2',
            full_name: 'Jane Smith',
            role: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
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
        profile: {
            id: 'mock-user-3',
            full_name: 'Mike Johnson',
            role: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
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
        profile: {
            id: 'mock-user-4',
            full_name: 'Sarah Wilson',
            role: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    }
];

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
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
                .select('*, profiles(*)')
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

    const handleAcceptJob = async (jobId: string) => {
        Alert.alert(
            '🎉 Coming Soon!', 
            'Accept Job functionality will be available in the next update.',
            [{ text: 'Got it', style: 'default' }]
        );
    };

    const renderHeader = () => (
        <View style={styles.headerWrapper}>
            {/* Top Navigation Bar */}
            <View style={styles.navBar}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>🔧</Text>
                    <Text style={styles.logoText}>Fiks</Text>
                </View>
                <View style={styles.navButtons}>
                    {!user ? (
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.userBadge}>
                            <Text style={styles.userBadgeText}>
                                {isPro ? '⭐ Pro' : '👤'}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.postButton}
                        onPress={() => navigation.navigate('CreateJob')}
                    >
                        <Text style={styles.postButtonIcon}>+</Text>
                        <Text style={styles.postButtonText}>Post</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Hero Section */}
            <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>Find Local Pros</Text>
                <Text style={styles.heroSubtitle}>
                    Connect with skilled professionals in your area
                </Text>
            </View>

            {/* Category Pills */}
            <View style={styles.categoriesSection}>
                <FlatList
                    horizontal
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
                            <Text style={styles.categoryIcon}>{item.icon}</Text>
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === item.name && styles.categoryTextSelected
                            ]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Feed Header */}
            <View style={styles.feedHeader}>
                <Text style={styles.feedTitle}>
                    {selectedCategory === 'All' ? '🔥 Latest Jobs' : `${CATEGORIES.find(c => c.name === selectedCategory)?.icon} ${selectedCategory}`}
                </Text>
                <Text style={styles.feedCount}>{jobs.length} available</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            
            {loading ? (
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingSpinner}>
                        <ActivityIndicator size="large" color="#6366F1" />
                        <Text style={styles.loadingText}>Loading jobs...</Text>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <JobCard
                            job={item}
                            isPro={isPro}
                            onAccept={handleAcceptJob}
                            index={index}
                        />
                    )}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🔍</Text>
                            <Text style={styles.emptyTitle}>No jobs found</Text>
                            <Text style={styles.emptyText}>
                                Be the first to post a job in this category!
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => navigation.navigate('CreateJob')}
                            >
                                <Text style={styles.emptyButtonText}>Post a Job</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
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
    loadingSpinner: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    headerWrapper: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 16,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 16,
        paddingBottom: 12,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        fontSize: 28,
        marginRight: 8,
    },
    logoText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -1,
    },
    navButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    loginButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
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
        fontWeight: '600',
        color: '#6366F1',
    },
    postButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#6366F1',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    postButtonIcon: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginRight: 4,
    },
    postButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    heroSection: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -1,
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
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
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        marginRight: 8,
    },
    categoryIcon: {
        fontSize: 16,
        marginRight: 6,
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
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default HomeScreen;
