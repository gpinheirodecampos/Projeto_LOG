import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DriverEvent, EVENT_LABELS } from '@/types/driver';
import { useTheme } from '@/contexts/ThemeContext';
import { EventIcons, EventColors } from '@/components/IconMap';
import { MapPin, Info } from 'lucide-react-native';

interface TimelineItemProps {
  event: DriverEvent;
  showDuration?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, showDuration = true }) => {
  const { theme } = useTheme();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return ` (${hours}h${minutes > 0 ? ` ${minutes}min` : ''})`;
    }
    return ` (${minutes}min)`;
  };

  const getIconComponent = (type: keyof typeof EventIcons) => EventIcons[type] ?? EventIcons.journey_start;
  const getEventColor = (type: keyof typeof EventColors) => EventColors[type] ?? theme.colors.primary;

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.card,
      borderBottomColor: theme.colors.border,
    }]}>
      <View style={[styles.iconContainer, { backgroundColor: getEventColor(event.type as keyof typeof EventColors) }]}>
        {(() => {
          const Icon = getIconComponent(event.type as keyof typeof EventIcons);
          return <Icon size={20} color="#FFFFFF" />;
        })()}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.time, { color: theme.colors.primary }]}>
            {formatTime(event.timestamp)}
          </Text>
          <Text style={[styles.event, { color: theme.colors.text }]}>
            {EVENT_LABELS[event.type]}
            {showDuration && formatDuration(event.duration)}
          </Text>
        </View>
        
        {event.location && (
          <View style={styles.inlineRow}>
            <MapPin size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.location, { color: theme.colors.textSecondary }]}>
              {event.location.address}
            </Text>
          </View>
        )}
        
        {event.reason && (
          <View style={styles.inlineRow}>
            <Info size={16} color={theme.colors.warning} />
            <Text style={[styles.reason, { color: theme.colors.warning }]}>
              {event.reason}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
    minWidth: 60,
  },
  event: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  location: {
    fontSize: 14,
    marginTop: 4,
  },
  reason: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default TimelineItem;