export const Colors = {
  light: {
    // Primary colors
    primary: '#6366F1', // Indigo
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',

    // Secondary colors
    secondary: '#EC4899', // Pink
    secondaryLight: '#F472B6',
    secondaryDark: '#DB2777',

    // Background colors
    background: '#F8FAFC',
    surface: '#FFFFFF',
    card: '#FFFFFF',

    // Text colors
    text: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Category colors
    prescription: '#8B5CF6', // Purple
    otc: '#06B6D4', // Cyan
    supplement: '#84CC16', // Lime

    // Time-based colors (for different times of day)
    morning: '#F59E0B', // Orange for morning
    afternoon: '#3B82F6', // Blue for afternoon
    evening: '#8B5CF6', // Purple for evening
    night: '#6366F1', // Indigo for night

    // UI elements
    border: '#E2E8F0',
    divider: '#CBD5E1',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Gradient colors
    gradientStart: '#6366F1',
    gradientEnd: '#8B5CF6',
  },
  dark: {
    // Primary colors
    primary: '#818CF8',
    primaryLight: '#A5B4FC',
    primaryDark: '#6366F1',

    // Secondary colors
    secondary: '#F472B6',
    secondaryLight: '#F9A8D4',
    secondaryDark: '#EC4899',

    // Background colors
    background: '#0F172A',
    surface: '#1E293B',
    card: '#334155',

    // Text colors
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',

    // Status colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    // Category colors
    prescription: '#A78BFA',
    otc: '#22D3EE',
    supplement: '#A3E635',

    // Time-based colors
    morning: '#FBBF24',
    afternoon: '#60A5FA',
    evening: '#A78BFA',
    night: '#818CF8',

    // UI elements
    border: '#475569',
    divider: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Gradient colors
    gradientStart: '#6366F1',
    gradientEnd: '#8B5CF6',
  },
};

export const getCategoryColor = (
  category: 'prescription' | 'otc' | 'supplement',
  isDark: boolean,
) => {
  return isDark
    ? Colors.dark[category]
    : Colors.light[category];
};

export const getTimeBasedColor = (time: string, isDark: boolean) => {
  const hour = parseInt(time.split(':')[0], 10);

  if (hour >= 5 && hour < 12) {
    return isDark ? Colors.dark.morning : Colors.light.morning;
  } else if (hour >= 12 && hour < 17) {
    return isDark ? Colors.dark.afternoon : Colors.light.afternoon;
  } else if (hour >= 17 && hour < 21) {
    return isDark ? Colors.dark.evening : Colors.light.evening;
  } else {
    return isDark ? Colors.dark.night : Colors.light.night;
  }
};
