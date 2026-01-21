import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../services/supabase';
import { useTranslation } from '../i18n';
import { useResponsive, LAYOUT } from '../utils/responsive';
import LanguageToggle from '../components/LanguageToggle';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
    navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const { t, isRTL } = useTranslation();
    const responsive = useResponsive();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'client' | 'pro'>('client');

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert(t.common.error, t.createJob.fillRequired);
            return;
        }

        if (isSignUp && !fullName) {
            Alert.alert(t.common.error, t.createJob.fillRequired);
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            role: selectedRole,
                        }
                    }
                });
                if (error) throw error;
                Alert.alert('✅', 'Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigation.replace('Home');
            }
        } catch (error: any) {
            Alert.alert(t.common.error, error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView 
                contentContainerStyle={[
                    styles.scrollContent,
                    responsive.isWeb && !responsive.isMobile && styles.scrollContentWeb,
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Language Toggle */}
                <View style={[styles.langToggleContainer, isRTL && styles.rowRTL]}>
                    <LanguageToggle />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logoIcon}>🔧</Text>
                    <Text style={[styles.title, isRTL && styles.textRTL]}>
                        {isSignUp ? t.login.welcome : t.login.welcome}
                    </Text>
                    <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
                        {t.login.subtitle}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {isSignUp && (
                        <>
                            <Text style={[styles.inputLabel, isRTL && styles.textRTL]}>
                                {t.login.fullName}
                            </Text>
                            <TextInput
                                style={[styles.input, isRTL && styles.inputRTL]}
                                placeholder={t.login.fullName}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholderTextColor="#94A3B8"
                            />

                            {/* Role Selection */}
                            <Text style={[styles.inputLabel, isRTL && styles.textRTL]}>
                                {t.login.selectRole}
                            </Text>
                            <View style={[styles.roleContainer, isRTL && styles.rowRTL]}>
                                <TouchableOpacity
                                    style={[
                                        styles.roleCard,
                                        selectedRole === 'client' && styles.roleCardSelected,
                                    ]}
                                    onPress={() => setSelectedRole('client')}
                                >
                                    <Text style={styles.roleIcon}>👤</Text>
                                    <Text style={[
                                        styles.roleTitle,
                                        selectedRole === 'client' && styles.roleTitleSelected,
                                    ]}>
                                        {t.login.client}
                                    </Text>
                                    <Text style={[styles.roleDesc, isRTL && styles.textRTL]}>
                                        {t.login.clientDesc}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.roleCard,
                                        selectedRole === 'pro' && styles.roleCardSelected,
                                    ]}
                                    onPress={() => setSelectedRole('pro')}
                                >
                                    <Text style={styles.roleIcon}>⭐</Text>
                                    <Text style={[
                                        styles.roleTitle,
                                        selectedRole === 'pro' && styles.roleTitleSelected,
                                    ]}>
                                        {t.login.professional}
                                    </Text>
                                    <Text style={[styles.roleDesc, isRTL && styles.textRTL]}>
                                        {t.login.professionalDesc}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    <Text style={[styles.inputLabel, isRTL && styles.textRTL]}>
                        {t.login.email}
                    </Text>
                    <TextInput
                        style={[styles.input, isRTL && styles.inputRTL]}
                        placeholder={t.login.email}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#94A3B8"
                    />

                    <Text style={[styles.inputLabel, isRTL && styles.textRTL]}>
                        {t.login.password}
                    </Text>
                    <TextInput
                        style={[styles.input, isRTL && styles.inputRTL]}
                        placeholder={t.login.password}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#94A3B8"
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {isSignUp ? t.login.signUp : t.login.signIn}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.switchButton}
                        onPress={() => setIsSignUp(!isSignUp)}
                    >
                        <Text style={[styles.switchText, isRTL && styles.textRTL]}>
                            {isSignUp 
                                ? `${t.login.haveAccount} ${t.login.signIn}` 
                                : `${t.login.noAccount} ${t.login.signUp}`
                            }
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 40,
    },
    scrollContentWeb: {
        maxWidth: LAYOUT.feedMaxWidth,
        alignSelf: 'center',
        width: '100%',
    },
    langToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    rowRTL: {
        flexDirection: 'row-reverse',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoIcon: {
        fontSize: 56,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    textRTL: {
        textAlign: 'right',
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        fontSize: 16,
        color: '#1E293B',
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    inputRTL: {
        textAlign: 'right',
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    roleCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    roleCardSelected: {
        borderColor: '#6366F1',
        backgroundColor: '#EEF2FF',
    },
    roleIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    roleTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    roleTitleSelected: {
        color: '#6366F1',
    },
    roleDesc: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#6366F1',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    switchButton: {
        marginTop: 24,
        padding: 12,
    },
    switchText: {
        textAlign: 'center',
        color: '#6366F1',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default LoginScreen;
