import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ActionButtonProps {
  title: string;
  icon: LucideIcon;
  onPress: () => void;
  variant?: 'default' | 'destructive' | 'secondary' | 'ghost' | 'outline';
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  icon: Icon,
  onPress,
  variant = 'default',
  disabled = false,
  size = 'default',
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = {
      ...styles.button,
      ...(size === 'lg' ? styles.buttonLg : {}),
      ...(size === 'sm' ? styles.buttonSm : {}),
    };
    
    if (disabled) {
      return { 
        ...baseStyle,
        backgroundColor: theme.colors.disabled,
        borderColor: theme.colors.border,
        opacity: 0.5,
      };
    }

    switch (variant) {
      case 'destructive':
        return { 
          ...baseStyle, 
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.error,
        };
      case 'secondary':
        return { 
          ...baseStyle, 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        };
      case 'ghost':
        return { 
          ...baseStyle, 
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'outline':
        return { 
          ...baseStyle, 
          backgroundColor: 'transparent',
          borderColor: theme.colors.border,
          borderWidth: 1,
        };
      case 'default':
      default:
        return { 
          ...baseStyle, 
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = {
      ...styles.text,
      ...(size === 'lg' ? styles.textLg : {}),
      ...(size === 'sm' ? styles.textSm : {}),
    };

    if (disabled) {
      return { ...baseTextStyle, color: theme.colors.textSecondary };
    }

    switch (variant) {
      case 'secondary':
      case 'ghost':
      case 'outline':
        return { ...baseTextStyle, color: theme.colors.text };
      default:
        return { ...baseTextStyle, color: '#ffffff' };
    }
  };

  const getIconColor = (): string => {
    if (disabled) return theme.colors.textSecondary;
    
    switch (variant) {
      case 'secondary':
      case 'ghost': 
      case 'outline':
        return theme.colors.text;
      default:
        return '#ffffff';
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} color={getIconColor()} />
        <Text style={getTextStyle()}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonSm: {
    height: 36,
    paddingHorizontal: 12,
  },
  buttonLg: {
    height: 64,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  textSm: {
    fontSize: 14,
    lineHeight: 16,
  },
  textLg: {
    fontSize: 18,
    lineHeight: 24,
  },
});

export default ActionButton;