import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import StatusCard from '@/components/StatusCard';
import ActionButton from '@/components/ActionButton';
import ConnectionIndicator from '@/components/ConnectionIndicator';
import EventConfirmationModal from '@/components/EventConfirmationModal';
import { useDriverState } from '@/hooks/useDriverState';
import { useLocation } from '@/hooks/useLocation';
import { DriverEvent } from '@/types/driver';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { driverState, addEvent, getAvailableActions, canPerformAction, getSuggestions } = useDriverState();
  const { getCurrentLocation } = useLocation();
  const [isOnline] = useState(true); // Simulate connection status
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    type: string;
    label: string;
    icon: string;
  } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleEventPress = async (eventType: string, eventLabel: string, icon: string) => {
    // Check if action is allowed
    const validation = canPerformAction(eventType);
    if (!validation.allowed) {
      Alert.alert('Ação não permitida', validation.reason);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Set selected event and show modal
    setSelectedEvent({ type: eventType, label: eventLabel, icon });
    setModalVisible(true);
    
    // Get location in background
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.log('Could not get location:', error);
      setCurrentLocation(null);
    }
  };

  const handleConfirmEvent = async () => {
    if (!selectedEvent) return;

    setIsProcessing(true);
    
    try {
      const event: DriverEvent = {
        id: Date.now().toString(),
        type: selectedEvent.type as any,
        timestamp: new Date().toISOString(),
        location: currentLocation || undefined,
      };
      
      addEvent(event);
      
      // Close modal and reset state
      setModalVisible(false);
      setSelectedEvent(null);
      setCurrentLocation(null);
      
    } catch (error) {
      console.error('Error adding event:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Não foi possível registrar o evento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelEvent = () => {
    setModalVisible(false);
    setSelectedEvent(null);
    setCurrentLocation(null);
    setIsProcessing(false);
  };

  const getActionButtons = () => {
    const availableActions = getAvailableActions();
    const buttons = [];

    // Journey Start/End
    if (availableActions.includes('journey_start')) {
      buttons.push(
        <ActionButton
          key="journey_start"
          title="INICIAR JORNADA"
          icon="🚛"
          variant="success"
          onPress={() => handleEventPress('journey_start', 'Iniciar Jornada', '🚛')}
        />
      );
    }
    
    if (availableActions.includes('journey_end')) {
      buttons.push(
        <ActionButton
          key="journey_end"
          title="ENCERRAR JORNADA"
          icon="🏁"
          variant="danger"
          onPress={() => handleEventPress('journey_end', 'Encerrar Jornada', '🏁')}
        />
      );
    }

    // Meal Start/End
    if (availableActions.includes('meal_start')) {
      buttons.push(
        <ActionButton
          key="meal_start"
          title="INICIAR REFEIÇÃO"
          icon="🍽️"
          variant="warning"
          onPress={() => handleEventPress('meal_start', 'Iniciar Refeição', '🍽️')}
        />
      );
    }
    
    if (driverState.currentStatus === 'meal') {
      buttons.push(
        <ActionButton
          key="meal_end"
          title="FIM REFEIÇÃO"
          icon="✅"
          variant="success"
          pulse={true}
          onPress={() => handleEventPress('meal_end', 'Fim da Refeição', '✅')}
        />
      );
    }

    // Rest Start/End
    if (availableActions.includes('rest_start')) {
      buttons.push(
        <ActionButton
          key="rest_start"
          title="INICIAR DESCANSO"
          icon="😴"
          variant="primary"
          onPress={() => handleEventPress('rest_start', 'Iniciar Descanso', '😴')}
        />
      );
    }
    
    if (driverState.currentStatus === 'rest') {
      buttons.push(
        <ActionButton
          key="rest_end"
          title="FIM DESCANSO"
          icon="⏰"
          variant="success"
          pulse={true}
          onPress={() => handleEventPress('rest_end', 'Fim do Descanso', '⏰')}
        />
      );
    }

    // Available and Inspection
    if (availableActions.includes('available')) {
      buttons.push(
        <ActionButton
          key="available"
          title="À DISPOSIÇÃO"
          icon="⏳"
          variant="primary"
          onPress={() => handleEventPress('available', 'À Disposição', '⏳')}
        />
      );
    }
    
    if (availableActions.includes('inspection')) {
      buttons.push(
        <ActionButton
          key="inspection"
          title="FISCALIZAÇÃO"
          icon="🔍"
          variant="warning"
          onPress={() => handleEventPress('inspection', 'Fiscalização', '🔍')}
        />
      );
    }

    return buttons;
  };

  const suggestions = getSuggestions();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Diário de Bordo</Text>
        
        <ConnectionIndicator isOnline={isOnline} pendingSync={0} />
        
        <StatusCard driverState={driverState} />
        
        {suggestions.length > 0 && (
          <View style={[styles.suggestionsContainer, { 
            backgroundColor: theme.isDark ? '#2D1B00' : '#FFF3E0',
            borderLeftColor: theme.colors.warning 
          }]}>
            <View style={styles.suggestionHeader}>
              <AlertTriangle size={20} color={theme.colors.warning} />
              <Text style={[styles.suggestionTitle, { 
                color: theme.isDark ? '#FFB74D' : '#E65100' 
              }]}>Sugestões</Text>
            </View>
            {suggestions.map((suggestion, index) => (
              <Text key={index} style={[styles.suggestionText, { 
                color: theme.isDark ? '#FF8A65' : '#BF360C' 
              }]}>
                • {suggestion}
              </Text>
            ))}
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          {getActionButtons()}
        </View>
        
        <EventConfirmationModal
          visible={modalVisible}
          eventType={selectedEvent?.type || ''}
          eventLabel={selectedEvent?.label || ''}
          eventIcon={selectedEvent?.icon || ''}
          location={currentLocation}
          onConfirm={handleConfirmEvent}
          onCancel={handleCancelEvent}
          isLoading={isProcessing}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  actionsContainer: {
    paddingBottom: 100,
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});