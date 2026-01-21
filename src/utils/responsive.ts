import { useState, useEffect } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';

// Breakpoints
export const BREAKPOINTS = {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
} as const;

// Layout constants
export const LAYOUT = {
    feedMaxWidth: 680,
    sidebarWidth: 280,
    containerPadding: 16,
    cardBorderRadius: 20,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export interface ResponsiveInfo {
    width: number;
    height: number;
    isWeb: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isWide: boolean;
    breakpoint: Breakpoint;
    showSidebar: boolean;
    feedWidth: number;
    containerStyle: {
        maxWidth: number;
        alignSelf: 'center' | 'stretch';
        width: string | number;
    };
}

const getBreakpoint = (width: number): Breakpoint => {
    if (width >= BREAKPOINTS.wide) return 'wide';
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
};

const getResponsiveInfo = (dimensions: ScaledSize): ResponsiveInfo => {
    const { width, height } = dimensions;
    const isWeb = Platform.OS === 'web';
    const breakpoint = getBreakpoint(width);
    
    const isMobile = breakpoint === 'mobile';
    const isTablet = breakpoint === 'tablet';
    const isDesktop = breakpoint === 'desktop' || breakpoint === 'wide';
    const isWide = breakpoint === 'wide';
    
    // Show sidebar only on desktop+ for web
    const showSidebar = isWeb && isDesktop;
    
    // Calculate feed width
    let feedWidth: number;
    if (isWeb) {
        if (isDesktop) {
            feedWidth = LAYOUT.feedMaxWidth;
        } else if (isTablet) {
            feedWidth = Math.min(width * 0.9, LAYOUT.feedMaxWidth);
        } else {
            feedWidth = width - (LAYOUT.containerPadding * 2);
        }
    } else {
        // Native mobile
        feedWidth = width - (LAYOUT.containerPadding * 2);
    }
    
    // Container style for centering on web
    const containerStyle = {
        maxWidth: isWeb && !isMobile ? LAYOUT.feedMaxWidth : width,
        alignSelf: (isWeb && !isMobile ? 'center' : 'stretch') as 'center' | 'stretch',
        width: isWeb && !isMobile ? '100%' : width - (LAYOUT.containerPadding * 2),
    };

    return {
        width,
        height,
        isWeb,
        isMobile,
        isTablet,
        isDesktop,
        isWide,
        breakpoint,
        showSidebar,
        feedWidth,
        containerStyle,
    };
};

export const useResponsive = (): ResponsiveInfo => {
    const [dimensions, setDimensions] = useState<ScaledSize>(Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    return getResponsiveInfo(dimensions);
};

// Helper function for card width
export const getCardWidth = (screenWidth: number, isWeb: boolean): number => {
    if (!isWeb) {
        return screenWidth - (LAYOUT.containerPadding * 2);
    }
    
    const breakpoint = getBreakpoint(screenWidth);
    
    switch (breakpoint) {
        case 'wide':
        case 'desktop':
            return LAYOUT.feedMaxWidth - (LAYOUT.containerPadding * 2);
        case 'tablet':
            return Math.min(screenWidth * 0.85, LAYOUT.feedMaxWidth) - (LAYOUT.containerPadding * 2);
        default:
            return screenWidth - (LAYOUT.containerPadding * 2);
    }
};

// Helper for web-specific styles
export const webOnlyStyle = <T extends object>(style: T): T | undefined => {
    return Platform.OS === 'web' ? style : undefined;
};

// Helper for hover effects on web
export const getHoverStyle = (isHovered: boolean, hoverStyle: object) => {
    if (Platform.OS !== 'web') return {};
    return isHovered ? hoverStyle : {};
};
