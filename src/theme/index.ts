export const COLORS = {
    primary: '#8B5CF6', // Violet
    secondary: '#EC4899', // Pink
    accent: '#F59E0B', // Amber
    background: '#E0F2FE', // Darker Alice Blue for contrast
    card: 'rgba(255, 255, 255, 0.9)', // Glassy opacity
    text: '#1E293B',
    textLight: '#64748B',
    white: '#FFFFFF',
    success: '#10B981',
    error: '#EF4444',
    gray: {
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
    },
    // Gradients (for linear-gradient usage)
    gradients: {
        primary: ['#8B5CF6', '#EC4899'],
        card: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)'], // Glass gradient
    }
};

export const FONTS = {
    heading: {
        regular: 'Poppins_400Regular',
        medium: 'Poppins_500Medium',
        bold: 'Poppins_700Bold',
    },
    body: {
        light: 'OpenSans_300Light',
        regular: 'OpenSans_400Regular',
        semiBold: 'OpenSans_600SemiBold',
        bold: 'OpenSans_700Bold',
    },
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const LAYOUT = {
    padding: 20,
    borderRadius: {
        s: 8,
        m: 12,
        l: 20,
        xl: 28,
        xxl: 32,
    },
};

export const SHADOWS = {
    none: {},
    // "Pro Max" Glow
    glow: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25, // Increased opacity for visibility
        shadowRadius: 16,
        elevation: 10,
    },
    card: {
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
};
