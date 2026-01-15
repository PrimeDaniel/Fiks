import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Switch,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../services/supabase';
import { JobCategory } from '../types/database';

type CreateJobScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateJob'>;

type Props = {
    navigation: CreateJobScreenNavigationProp;
};

const CATEGORIES: JobCategory[] = ['Electricity', 'Plumbing', 'Assembly', 'Moving', 'Painting'];

const CreateJobScreen: React.FC<Props> = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<JobCategory | ''>('');
    const [priceOffer, setPriceOffer] = useState('');
    const [scheduleDescription, setScheduleDescription] = useState('');
    const [allowCounterOffers, setAllowCounterOffers] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !description || !category || !priceOffer) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Error', 'You must be logged in to post a job');
                return;
            }

            const { error } = await supabase
                .from('jobs')
                .insert({
                    title,
                    description,
                    category: category as JobCategory,
                    price_offer: parseFloat(priceOffer),
                    schedule_description: scheduleDescription,
                    allow_counter_offers: allowCounterOffers,
                    user_id: user.id,
                    photos: [], // Mocking photos for now
                    status: 'Open'
                });

            if (error) {
                console.error(error);
                Alert.alert('Error', error.message);
                return;
            }

            Alert.alert('Success', 'Job posted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Fix leaking tap"
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the issue in detail..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
            />

            <Text style={styles.label}>Category *</Text>
            <View style={styles.pillsContainer}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.pill,
                            category === cat && styles.pillSelected
                        ]}
                        onPress={() => setCategory(cat)}
                    >
                        <Text style={[
                            styles.pillText,
                            category === cat && styles.pillTextSelected
                        ]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Price Offer (USD) *</Text>
            <TextInput
                style={styles.input}
                placeholder="0.00"
                value={priceOffer}
                onChangeText={setPriceOffer}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Schedule Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="When are you available? Be specific."
                value={scheduleDescription}
                onChangeText={setScheduleDescription}
                multiline
            />

            <View style={styles.switchContainer}>
                <Text style={styles.label}>Allow Counter Offers</Text>
                <Switch
                    value={allowCounterOffers}
                    onValueChange={setAllowCounterOffers}
                />
            </View>

            <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => Alert.alert('Info', 'Photo upload not implemented yet')}
            >
                <Text style={styles.uploadButtonText}>Upload Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitButtonText}>Post Job</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        gap: 10,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    pillSelected: {
        backgroundColor: '#007AFF', // Example primary color
        borderColor: '#007AFF',
    },
    pillText: {
        color: '#333',
    },
    pillTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    uploadButton: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 8,
        borderStyle: 'dashed',
        alignItems: 'center',
        marginBottom: 24,
    },
    uploadButtonText: {
        color: '#007AFF',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 40,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CreateJobScreen;
