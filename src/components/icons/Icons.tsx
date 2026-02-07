import React from 'react';
import { Svg, Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
}

/**
 * Lightning bolt icon - represents speed and efficiency
 */
export const LightningIcon: React.FC<IconProps> = ({ size = 24, color = '#0369A1' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

/**
 * Shield icon - represents trust and security
 */
export const ShieldIcon: React.FC<IconProps> = ({ size = 24, color = '#0369A1' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M9 12L11 14L15 10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

/**
 * Star icon - represents quality and ratings
 */
export const StarIcon: React.FC<IconProps> = ({ size = 24, color = '#F59E0B' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

/**
 * Users icon - represents community
 */
export const UsersIcon: React.FC<IconProps> = ({ size = 24, color = '#0369A1' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle cx="9" cy="7" r="4" fill={color} stroke={color} strokeWidth="2" />
        <Path
            d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

/**
 * Checkmark circle icon - represents verification
 */
export const CheckCircleIcon: React.FC<IconProps> = ({ size = 24, color = '#10B981' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill={color} stroke={color} strokeWidth="2" />
        <Path
            d="M9 12L11 14L15 10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

/**
 * Briefcase icon - represents jobs/work
 */
export const BriefcaseIcon: React.FC<IconProps> = ({ size = 24, color = '#0369A1' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path d="M12 11V15" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

/**
 * Arrow right icon - for CTAs and links
 */
export const ArrowRightIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M5 12H19M19 12L12 5M19 12L12 19"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

/**
 * Clock icon - represents time/scheduling
 */
export const ClockIcon: React.FC<IconProps> = ({ size = 24, color = '#0369A1' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
        <Path
            d="M12 6V12L16 14"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

/**
 * Tool/Wrench icon - represents services
 */
export const ToolIcon: React.FC<IconProps> = ({ size = 24, color = '#0369A1' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M14.7 6.3C14.5168 6.48693 14.4141 6.73825 14.4141 7C14.4141 7.26175 14.5168 7.51307 14.7 7.7L16.3 9.3C16.4869 9.48323 16.7382 9.58588 17 9.58588C17.2618 9.58588 17.5131 9.48323 17.7 9.3L21.47 5.53C21.9728 6.64372 22.1251 7.88188 21.9065 9.08294C21.688 10.284 21.1087 11.3893 20.249 12.249C19.3893 13.1087 18.284 13.688 17.0829 13.9065C15.8819 14.1251 14.6437 13.9728 13.53 13.47L6.62 20.38C6.22218 20.7778 5.68261 21.0013 5.12 21.0013C4.55739 21.0013 4.01782 20.7778 3.62 20.38C3.22218 19.9822 2.99868 19.4426 2.99868 18.88C2.99868 18.3174 3.22218 17.7778 3.62 17.38L10.53 10.47C10.0272 9.35628 9.87493 8.11812 10.0935 6.91706C10.312 5.716 10.8913 4.61073 11.751 3.75101C12.6107 2.89129 13.716 2.31203 14.9171 2.09346C16.1181 1.87489 17.3563 2.02718 18.47 2.53L14.71 6.29L14.7 6.3Z"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

/**
 * Map pin icon - represents location
 */
export const MapPinIcon: React.FC<IconProps> = ({ size = 24, color = '#0369A1' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle cx="12" cy="10" r="3" fill="white" stroke="white" strokeWidth="2" />
    </Svg>
);

/**
 * Chevron down icon - for scroll indicator
 */
export const ChevronDownIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M6 9L12 15L18 9"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

/**
 * Quote icon - for testimonials
 */
export const QuoteIcon: React.FC<IconProps> = ({ size = 24, color = '#0369A1' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M3 21C3 21 4 20 4 18V14C4 12 5 11 7 11H8C10 11 11 12 11 14V17C11 19 10 20 8 20H6C4 20 3 21 3 21Z"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M13 21C13 21 14 20 14 18V14C14 12 15 11 17 11H18C20 11 21 12 21 14V17C21 19 20 20 18 20H16C14 20 13 21 13 21Z"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);
