import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export const Colors = {
  primary: '#534AB7',
  primaryLight: '#EEF0FB',
  correct: '#1D9E75',
  correctLight: '#E1F5EE',
  wrong: '#E24B4A',
  wrongLight: '#FCEBEB',
  goldBadge: '#EF9F27',
  goldBadgeDark: '#BA7517',
  text: '#1A1A2E',
  textSub: '#6B7280',
  textMuted: '#9CA3AF',
  background: '#F8F8FC',
  card: '#FFFFFF',
  border: '#E5E7EB',
  badgeRed: '#A32D2D',
  badgeRedBg: '#FCEBEB',
  badgeOrange: '#854F0B',
  badgeOrangeBg: '#FAEEDA',
  badgeGreen: '#0F6E56',
  badgeGreenBg: '#E1F5EE',
} as const;

export const fontSize = {
  hanzi: isTablet ? 72 : 56,
  pinyin: isTablet ? 24 : 18,
  h1: isTablet ? 28 : 24,
  h2: isTablet ? 22 : 18,
  body: isTablet ? 16 : 14,
  small: isTablet ? 13 : 11,
  button: isTablet ? 17 : 15,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  card: 16,
  button: 12,
  badge: 20,
  small: 8,
} as const;
