import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ConnectionIndicatorProps {
  isOnline: boolean;
  pendingSync?: number;
}

const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ 
  isOnline, 
  pendingSync = 0 
}) => {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isOnline 
          ? (theme.isDark ? '#1B5E20' : '#E8F5E8')
          : (theme.isDark ? '#B71C1C' : '#FFEBEE')
      }
    ]}>
      {isOnline ? (
        <Wifi size={16} color={theme.colors.success} />
      ) : (
        <WifiOff size={16} color={theme.colors.error} />
      )}
      
      <Text style={[
        styles.text, 
        { 
          color: isOnline 
            ? (theme.isDark ? '#66BB6A' : '#2E7D32')
            : (theme.isDark ? '#EF5350' : '#C62828')
        }
      ]}>
        {isOnline ? 'Online' : 'Offline'}
      </Text>
      
      {pendingSync > 0 && (
        <Text style={[styles.pending, { color: theme.colors.warning }]}>
          ({pendingSync} pendente{pendingSync > 1 ? 's' : ''})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  pending: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default ConnectionIndicator;