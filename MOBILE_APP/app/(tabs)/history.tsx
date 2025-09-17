import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import TimelineItem from '@/components/TimelineItem';
import { useDriverState } from '@/hooks/useDriverState';
import { useTheme } from '@/contexts/ThemeContext';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { driverState, resetDayTotals } = useDriverState();

  const getTodayEvents = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return driverState.events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= todayStart;
    });
  };

  const calculateDurations = (events: typeof driverState.events) => {
    const durationsMap = new Map();
    
    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i];
      const next = events[i + 1];
      
      if (current.type.includes('start') && next.type.includes('end')) {
        const duration = Math.floor(
          (new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime()) / 1000
        );
        durationsMap.set(next.id, duration);
      }
    }
    
    return durationsMap;
  };

  const todayEvents = getTodayEvents().reverse(); // Show chronologically
  const durations = calculateDurations([...driverState.events].reverse());

  const eventsWithDuration = todayEvents.map(event => ({
    ...event,
    duration: durations.get(event.id),
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Calendar size={24} color={theme.colors.primary} />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Histórico do Dia
        </Text>
      </View>
      
      <View style={[styles.summary, { 
        backgroundColor: theme.colors.card,
        shadowColor: theme.colors.shadow,
      }]}>
        <View style={styles.summaryItem}>
          <Clock size={20} color={theme.colors.success} />
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Jornada
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {Math.floor(driverState.totalJourneyTime / 3600)}h{' '}
            {Math.floor((driverState.totalJourneyTime % 3600) / 60)}min
          </Text>
        </View>
        
        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
        
        <View style={styles.summaryItem}>
          <Clock size={20} color="#9C27B0" />
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Descanso
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {Math.floor(driverState.totalRestTime / 3600)}h{' '}
            {Math.floor((driverState.totalRestTime % 3600) / 60)}min
          </Text>
        </View>
      </View>

      <ScrollView style={[styles.timeline, { 
        backgroundColor: theme.colors.card,
        shadowColor: theme.colors.shadow,
      }]} showsVerticalScrollIndicator={false}>
        {eventsWithDuration.length > 0 ? (
          eventsWithDuration.map((event) => (
            <TimelineItem key={event.id} event={event} showDuration={true} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Nenhum evento hoje
            </Text>
            <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
              Seus registros aparecerão aqui conforme você utilizar o diário de bordo
            </Text>
          </View>
        )}
      </ScrollView>

      {eventsWithDuration.length > 0 && (
        <TouchableOpacity style={[styles.clearButton, { backgroundColor: theme.colors.error }]} onPress={resetDayTotals}>
          <Text style={styles.clearButtonText}>Limpar Histórico do Dia</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
  },
  summary: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: 20,
  },
  timeline: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  clearButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});