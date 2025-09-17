import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

interface ActionButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'disabled';
  disabled?: boolean;
  pulse?: boolean;
  size?: 'normal' | 'large';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
  pulse = false,
  size = 'normal',
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = size === 'large' ? styles.buttonLarge : styles.button;
    
    if (disabled || variant === 'disabled') {
      return { 
        ...baseStyle, 
        backgroundColor: theme.colors.disabled,
        opacity: 0.5,
      };
    }

    switch (variant) {
      case 'success':
        return { ...baseStyle, backgroundColor: theme.colors.success };
      case 'danger':
        return { ...baseStyle, backgroundColor: theme.colors.error };
      case 'warning':
        return { ...baseStyle, backgroundColor: theme.colors.warning };
      case 'primary':
      default:
        return { ...baseStyle, backgroundColor: theme.colors.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    return disabled || variant === 'disabled' 
      ? { ...styles.text, color: theme.colors.textSecondary }
      : styles.text;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), pulse && styles.pulse]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[getTextStyle(), size === 'large' && styles.textLarge]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 72,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonLarge: {
    height: 88,
    borderRadius: 16,
    marginVertical: 10,
    marginHorizontal: 16,
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  textLarge: {
    fontSize: 20,
    fontWeight: '700',
  },
  pulse: {
    // Animation would be added with react-native-reanimated
  },
});

export default ActionButton;