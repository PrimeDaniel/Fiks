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
    ActivityIndicator,
    Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../services/supabase';
import { JobCategory } from '../types/database';
import { useTranslation, getCategoryTranslation } from '../i18n';
import { useResponsive, LAYOUT as RESPONSIVE_LAYOUT } from '../utils/responsive';
import { COLORS, FONTS, SHADOWS, LAYOUT as THEME_LAYOUT } from '../theme';

type CreateJobScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateJob'>;

type Props = {
    navigation: CreateJobScreenNavigationProp;
};

type CategoryItem = {
    name: JobCategory;
    icon: string;
    color: string;
};

const CATEGORIES: CategoryItem[] = [
    { name: 'Electricity', icon: '⚡', color: '#F59E0B' },
    { name: 'Plumbing', icon: '🔧', color: '#3B82F6' },
    { name: 'Assembly', icon: '🔨', color: '#F97316' },
    { name: 'Moving', icon: '📦', color: '#10B981' },
    { name: 'Painting', icon: '🎨', color: '#EC4899' },
];

const CreateJobScreen: React.FC<Props> = ({ navigation }) => {
    const { t, isRTL } = useTranslation();
    const responsive = useResponsive();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<JobCategory | ''>('');
    const [priceOffer, setPriceOffer] = useState('');
    const [scheduleDescription, setScheduleDescription] = useState('');
    const [allowCounterOffers, setAllowCounterOffers] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !description || !category || !priceOffer) {
            Alert.alert(t.common.error, t.createJob.fillRequired);
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert(t.common.error, t.jobDetail.loginRequired);
                navigation.navigate('Login');
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
                    photos: [],
                    status: 'Open'
                });

            if (error) {
                console.error(error);
                Alert.alert(t.common.error, error.message);
                return;
            }

            Alert.alert(t.createJob.jobPosted, t.createJob.jobPostedMessage, [
                { text: t.common.ok, onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            console.error(e);
            Alert.alert(t.common.error, 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                responsive.isWeb && !responsive.isMobile && styles.containerWeb,
            ]}
            showsVerticalScrollIndicator={false}
        >
            {/* Title */}
            <View style={styles.section}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                    {t.createJob.whatNeedsDone} *
                </Text>
                <TextInput
                    style={[styles.input, isRTL && styles.inputRTL]}
                    placeholder={t.createJob.titlePlaceholder}
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor="#94A3B8"
                />
            </View>

            {/* Category */}
            <View style={styles.section}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                    {t.createJob.category} *
                </Text>
                <View style={[styles.pillsContainer, isRTL && styles.pillsContainerRTL]}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.name}
                            style={[
                                styles.pill,
                                category === cat.name && {
                                    backgroundColor: cat.color,
                                    borderColor: cat.color,
                                }
                            ]}
                            onPress={() => setCategory(cat.name)}
                        >
                            <Text style={styles.pillIcon}>{cat.icon}</Text>
                            <Text style={[
                                styles.pillText,
                                category === cat.name && styles.pillTextSelected
                            ]}>
                                {getCategoryTranslation(t, cat.name)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                    {t.createJob.description} *
                </Text>
                <TextInput
                    style={[styles.input, styles.textArea, isRTL && styles.inputRTL]}
                    placeholder={t.createJob.descriptionPlaceholder}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#94A3B8"
                />
            </View>

            {/* Price */}
            <View style={styles.section}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                    {t.createJob.priceOffer} *
                </Text>
                <View style={[styles.priceInputContainer, isRTL && styles.rowRTL]}>
                    <Text style={styles.pricePrefix}>$</Text>
                    <TextInput
                        style={[styles.priceInput, isRTL && styles.inputRTL]}
                        placeholder="0"
                        value={priceOffer}
                        onChangeText={setPriceOffer}
                        keyboardType="numeric"
                        placeholderTextColor="#94A3B8"
                    />
                </View>
            </View>

            {/* Schedule */}
            <View style={styles.section}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                    {t.createJob.schedule}
                </Text>
                <TextInput
                    style={[styles.input, isRTL && styles.inputRTL]}
                    placeholder={t.createJob.schedulePlaceholder}
                    value={scheduleDescription}
                    onChangeText={setScheduleDescription}
                    placeholderTextColor="#94A3B8"
                />
            </View>

            {/* Counter Offers Toggle */}
            <View style={[styles.switchContainer, isRTL && styles.switchContainerRTL]}>
                <View style={styles.switchTextContainer}>
                    <Text style={[styles.switchLabel, isRTL && styles.textRTL]}>
                        {t.createJob.allowCounterOffers}
                    </Text>
                    <Text style={[styles.switchDesc, isRTL && styles.textRTL]}>
                        {t.createJob.counterOffersDesc}
                    </Text>
                </View>
                <Switch
                    value={allowCounterOffers}
                    onValueChange={setAllowCounterOffers}
                    trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
                    thumbColor={allowCounterOffers ? '#6366F1' : '#94A3B8'}
                />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitButtonText}>{t.createJob.postJob}</Text>
                )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: COLORS.background,
    },
    containerWeb: {
        maxWidth: RESPONSIVE_LAYOUT.feedMaxWidth,
        alignSelf: 'center',
        width: '100%',
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontFamily: FONTS.body.bold,
        marginBottom: 12,
        color: COLORS.text,
    },
    textRTL: {
        textAlign: 'right',
    },
    rowRTL: {
        flexDirection: 'row-reverse',
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: FONTS.body.regular,
        color: COLORS.text,
    },
    inputRTL: {
        textAlign: 'right',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    pillsContainerRTL: {
        flexDirection: 'row-reverse',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        ...SHADOWS.card,
    },
    pillIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    pillTextSelected: {
        color: '#FFFFFF',
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    pricePrefix: {
        fontSize: 24,
        fontFamily: FONTS.heading.bold,
        color: COLORS.success,
        marginRight: 8,
    },
    priceInput: {
        flex: 1,
        fontSize: 24,
        fontFamily: FONTS.heading.bold,
        color: COLORS.text,
        paddingVertical: 14,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        ...SHADOWS.card,
    },
    switchContainerRTL: {
        flexDirection: 'row-reverse',
    },
    switchTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    switchDesc: {
        fontSize: 13,
        color: '#64748B',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
        ...SHADOWS.glow,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontFamily: FONTS.body.bold,
    },
});

export default CreateJobScreen;
