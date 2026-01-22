import React, { useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Platform, Animated, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Svg, Path, Circle } from 'react-native-svg';

interface ThemeSwitcherProps {
    size?: number;
}

/**
 * SunIcon - Animated sun icon for light mode
 */
const SunIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" fill="none" />
        <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

/**
 * MoonIcon - Animated moon icon for dark mode
 */
const MoonIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
);

/**
 * ThemeSwitcher - Animated toggle between light and dark mode
 * Features smooth rotation transition and scale bounce
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ size = 20 }) => {
    const { isDark, toggleTheme } = useTheme();
    const rotateAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(rotateAnim, {
            toValue: isDark ? 1 : 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
        }).start();
    }, [isDark]);

    const handlePress = () => {
        // Bounce and rotate animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 200,
                friction: 10,
            }),
        ]).start();

        toggleTheme();
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const sunOpacity = rotateAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0, 0],
    });

    const moonOpacity = rotateAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    return (
        <TouchableOpacity
            style={[styles.container, isDark && styles.containerDark]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Animated.View
                style={[
                    styles.iconWrapper,
                    {
                        transform: [
                            { rotate: rotation },
                            { scale: scaleAnim },
                        ],
                    },
                ]}
            >
                {/* Sun icon (visible in light mode) */}
                <Animated.View style={[styles.icon, { opacity: sunOpacity }]}>
                    <SunIcon size={size} color="#F59E0B" />
                </Animated.View>

                {/* Moon icon (visible in dark mode) */}
                <Animated.View style={[styles.icon, styles.iconOverlay, { opacity: moonOpacity }]}>
                    <MoonIcon size={size} color="#A78BFA" />
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            web: {
                cursor: 'pointer' as any,
                transition: 'background-color 0.3s ease',
            },
        }),
    },
    containerDark: {
        backgroundColor: '#1E293B',
    },
    iconWrapper: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        position: 'absolute',
    },
    iconOverlay: {
        position: 'absolute',
    },
});

export default ThemeSwitcher;
