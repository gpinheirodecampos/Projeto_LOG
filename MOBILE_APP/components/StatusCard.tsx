import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DriverState, STATUS_LABELS, STATUS_ICONS } from '@/types/driver';
import { Play, Pause, Square } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface StatusCardProps {
  driverState: DriverState;
  onQuickAction?: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({ driverState, onQuickAction }) => {
  const { theme } = useTheme();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isBlinking, setIsBlinking] = useState(false);

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

  useEffect(() => {
    // Blink effect for active states
    if (driverState.currentStatus === 'meal' || driverState.currentStatus === 'rest') {
      const blinkInterval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 1000);
      return () => clearInterval(blinkInterval);
    }
  }, [driverState.currentStatus]);

  const getStatusColor = () => {
    switch (driverState.currentStatus) {
      case 'on_journey':
        return '#4CAF50';
      case 'meal':
        return '#FF9800';
      case 'rest':
        return '#9C27B0';
      case 'available':
        return '#1976D2';
      case 'off_duty':
      default:
        return '#757575';
    }
  };

  const getStatusIcon = () => {
    switch (driverState.currentStatus) {
      case 'on_journey':
        return <Play size={24} color="#FFFFFF" />;
      case 'meal':
      case 'rest':
        return <Pause size={24} color="#FFFFFF" />;
      default:
        return <Square size={24} color="#FFFFFF" />;
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        borderLeftColor: getStatusColor(),
        backgroundColor: theme.colors.card,
        shadowColor: theme.colors.shadow,
      }
    ]}>
      <View style={styles.header}>
        <Text style={styles.icon}>
          {STATUS_ICONS[driverState.currentStatus]}
        </Text>
        <Text style={[styles.status, { color: theme.colors.text }]}>
          {STATUS_LABELS[driverState.currentStatus]}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.timerContainer,
          isBlinking && styles.blinking
        ]}
        onPress={onQuickAction}
        disabled={!onQuickAction}
      >
        <Text style={[styles.timer, { color: theme.colors.primary }]}>
          {elapsedTime}
        </Text>
        {onQuickAction && (
          <View style={[styles.quickActionIcon, { backgroundColor: getStatusColor() }]}>
            {getStatusIcon()}
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.totals}>
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
    borderRadius: 16,
    padding: 24,
    margin: 16,
    borderLeftWidth: 6,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  status: {
    fontSize: 20,
    fontWeight: '700',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  timer: {
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  blinking: {
    opacity: 0.7,
  },
  quickActionIcon: {
    position: 'absolute',
    right: -40,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  totalItem: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StatusCard;