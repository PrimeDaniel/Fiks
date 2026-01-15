import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Job } from '../types/database';

type Props = {
    job: Job;
    isPro: boolean;
    onAccept?: (jobId: string) => void;
};

const JobCard: React.FC<Props> = ({ job, isPro, onAccept }) => {
    const formattedDate = new Date(job.created_at).toLocaleDateString();

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {job.profile?.full_name?.charAt(0) || 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{job.profile?.full_name || 'Anonymous User'}</Text>
                        <Text style={styles.date}>{formattedDate}</Text>
                    </View>
                </View>
                <View style={[styles.categoryPill, { backgroundColor: getCategoryColor(job.category) }]}>
                    <Text style={styles.categoryText}>{job.category}</Text>
                </View>
            </View>

            <Text style={styles.title}>{job.title}</Text>

            <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Offer:</Text>
                <Text style={styles.price}>${job.price_offer.toFixed(2)}</Text>
            </View>

            <Text style={styles.description} numberOfLines={3}>{job.description}</Text>

            {job.schedule_description && (
                <View style={styles.scheduleContainer}>
                    <Text style={styles.scheduleLabel}>📅 Schedule:</Text>
                    <Text style={styles.scheduleText} numberOfLines={1}>{job.schedule_description}</Text>
                </View>
            )}

            {isPro && onAccept && (
                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => onAccept(job.id)}
                >
                    <Text style={styles.acceptButtonText}>Accept Job</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'Electricity': return '#FFD700';
        case 'Plumbing': return '#87CEEB';
        case 'Assembly': return '#FFA500';
        case 'Moving': return '#90EE90';
        case 'Painting': return '#FF69B4';
        default: return '#E0E0E0';
    }
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    date: {
        fontSize: 12,
        color: '#888',
    },
    categoryPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 14,
        color: '#555',
        marginRight: 4,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF', // Functionally green or brand color
    },
    description: {
        fontSize: 14,
        color: '#444',
        marginBottom: 12,
        lineHeight: 20,
    },
    scheduleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 8,
        borderRadius: 6,
        marginBottom: 12,
    },
    scheduleLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginRight: 6,
        color: '#555',
    },
    scheduleText: {
        fontSize: 12,
        color: '#333',
        flex: 1,
    },
    acceptButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 4,
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default JobCard;
