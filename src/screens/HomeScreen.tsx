import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Button,
    ActivityIndicator,
    Alert
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

const CATEGORIES: (JobCategory | 'All')[] = ['All', 'Electricity', 'Plumbing', 'Assembly', 'Moving', 'Painting'];

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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock-user-2',
        title: 'Assemble IKEA Wardrobe',
        description: 'Need help assembling a PAX wardrobe. It is huge.',
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock-user-3',
        title: 'Install Ceiling Fan',
        description: 'Replacing an old light fixture with a fan.',
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
    }
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'All'>('All');
    const [isPro, setIsPro] = useState(false);
    const [user, setUser] = useState<any>(null);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            // Check if user is pro (simplified check for now)
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

            // Build Query
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
                console.warn('Error fetching jobs (Using Mock Data):', error.message);
                // Fallback to MOCK DATA
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
            setJobs(MOCK_JOBS); // Fallback on crash
        } finally {
            setLoading(false);
        }
    };

    // Refetch when screen comes into focus (e.g. after posting a job)
    useFocusEffect(
        useCallback(() => {
            fetchJobs();
        }, [selectedCategory])
    );

    const handleAcceptJob = async (jobId: string) => {
        Alert.alert('Info', 'Accept Job functionality coming next!');
    };

    const renderHeader = () => (
        <View>
            <View style={styles.headerTop}>
                <Text style={styles.mainTitle}>Home Repair Market</Text>
                <View style={styles.headerButtons}>
                    {!user && (
                        <Button
                            title="Login"
                            onPress={() => navigation.navigate('Login')}
                        />
                    )}
                    <View style={{ width: 10 }} />
                    <Button
                        title="+ Post"
                        onPress={() => navigation.navigate('CreateJob')}
                    />
                </View>
            </View>
            <FlatList
                horizontal
                data={CATEGORIES}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.categoryTab,
                            selectedCategory === item && styles.categoryTabSelected
                        ]}
                        onPress={() => setSelectedCategory(item)}
                    >
                        <Text style={[
                            styles.categoryTabText,
                            selectedCategory === item && styles.categoryTabTextSelected
                        ]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <JobCard
                            job={item}
                            isPro={isPro}
                            onAccept={handleAcceptJob}
                        />
                    )}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No jobs found in this category.</Text>
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
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    categoryTabSelected: {
        backgroundColor: '#333',
    },
    categoryTabText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    categoryTabTextSelected: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
});

export default HomeScreen;
