import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DriverState, STATUS_LABELS } from '@/types/driver';
import { Play, Pause, Square, Truck, Coffee, Bed, Clock, Search } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface StatusCardProps {
  driverState: DriverState;
  onQuickAction?: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({ driverState, onQuickAction }) => {
  const { theme } = useTheme();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  const getStatusIcon = () => {
    const size = 20;
    const color = theme.colors.text;
    
    switch (driverState.currentStatus) {
      case 'on_journey':
        return <Truck size={size} color={color} />;
      case 'meal':
        return <Coffee size={size} color={color} />;
      case 'rest':
        return <Bed size={size} color={color} />;
      case 'available':
        return <Clock size={size} color={color} />;

      case 'off_duty':
      default:
        return <Square size={size} color={color} />;
    }
  };

  useEffect(() => {
    if (!driverState.currentEventStart) {
      setElapsedTime('--:--:--');
      return;
    }

    const updateTimer = () => {
      const start = new Date(driverState.currentEventStart!);
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000);

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [driverState.currentEventStart]);

  const getStatusColor = () => {
    switch (driverState.currentStatus) {
      case 'on_journey':
        return theme.colors.primary;
      case 'meal':
        return theme.colors.warning;
      case 'rest':
        return theme.colors.info;
      case 'available':
        return theme.colors.success;
      case 'off_duty':
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.shadow,
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getStatusIcon()}
        </View>
        <Text style={[styles.status, { color: theme.colors.text }]}>
          {STATUS_LABELS[driverState.currentStatus]}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.timerContainer}
        onPress={onQuickAction}
        disabled={!onQuickAction}
      >
        <Text style={[styles.timer, { color: getStatusColor() }]}>
          {elapsedTime}
        </Text>
      </TouchableOpacity>
      
      <View style={[styles.totals, { borderTopColor: theme.colors.border }]}>
        <View style={styles.totalItem}>
          <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
            Jornada Hoje
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.text }]}>
            {Math.floor(driverState.totalJourneyTime / 3600)}h{' '}
            {Math.floor((driverState.totalJourneyTime % 3600) / 60)}min
          </Text>
        </View>
        
        <View style={styles.totalItem}>
          <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
            Descanso Hoje
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.text }]}>
            {Math.floor(driverState.totalRestTime / 3600)}h{' '}
            {Math.floor((driverState.totalRestTime % 3600) / 60)}min
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  iconContainer: {
    padding: 4,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timer: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalItem: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default StatusCard;