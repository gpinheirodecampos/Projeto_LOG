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
import { AlertTriangle, Truck, Coffee, Bed, Clock, Search, StopCircle, CheckCircle } from 'lucide-react-native';
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
  
  const handleEventPress = async (eventType: string, eventLabel: string) => {
    // Check if action is allowed
    const validation = canPerformAction(eventType);
    if (!validation.allowed) {
      Alert.alert('Ação não permitida', validation.reason);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Set selected event and show modal
    setSelectedEvent({ type: eventType, label: eventLabel, icon: eventType });
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
          title="Iniciar Jornada"
          icon={Truck}
          variant="default"
          onPress={() => handleEventPress('journey_start', 'Iniciar Jornada')}
        />
      );
    }
    
    if (availableActions.includes('journey_end')) {
      buttons.push(
        <ActionButton
          key="journey_end"
          title="Encerrar Jornada"
          icon={StopCircle}
          variant="destructive"
          onPress={() => handleEventPress('journey_end', 'Encerrar Jornada')}
        />
      );
    }

    // Meal Start/End
    if (availableActions.includes('meal_start')) {
      buttons.push(
        <ActionButton
          key="meal_start"
          title="Iniciar Refeição"
          icon={Coffee}
          variant="secondary"
          onPress={() => handleEventPress('meal_start', 'Iniciar Refeição')}
        />
      );
    }
    
    if (driverState.currentStatus === 'meal') {
      buttons.push(
        <ActionButton
          key="meal_end"
          title="Fim da Refeição"
          icon={CheckCircle}
          variant="default"
          onPress={() => handleEventPress('meal_end', 'Fim da Refeição')}
        />
      );
    }

    // Rest Start/End
    if (availableActions.includes('rest_start')) {
      buttons.push(
        <ActionButton
          key="rest_start"
          title="Iniciar Descanso"
          icon={Bed}
          variant="secondary"
          onPress={() => handleEventPress('rest_start', 'Iniciar Descanso')}
        />
      );
    }
    
    if (driverState.currentStatus === 'rest') {
      buttons.push(
        <ActionButton
          key="rest_end"
          title="Fim do Descanso"
          icon={CheckCircle}
          variant="default"
          onPress={() => handleEventPress('rest_end', 'Fim do Descanso')}
        />
      );
    }

    // Available and Inspection
    if (availableActions.includes('available')) {
      buttons.push(
        <ActionButton
          key="available"
          title="À Disposição"
          icon={Clock}
          variant="outline"
          onPress={() => handleEventPress('available', 'À Disposição')}
        />
      );
    }
    
    if (availableActions.includes('inspection')) {
      buttons.push(
        <ActionButton
          key="inspection"
          title="Fiscalização"
          icon={Search}
          variant="outline"
          onPress={() => handleEventPress('inspection', 'Fiscalização')}
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
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.warning,
            borderLeftColor: theme.colors.warning 
          }]}>
            <View style={styles.suggestionHeader}>
              <AlertTriangle size={16} color={theme.colors.warning} />
              <Text style={[styles.suggestionTitle, { color: theme.colors.text }]}>
                Sugestões
              </Text>
            </View>
            {suggestions.map((suggestion, index) => (
              <Text key={index} style={[styles.suggestionText, { color: theme.colors.textSecondary }]}>
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
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  actionsContainer: {
    paddingBottom: 100,
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionText: {
    fontSize: 13,
    lineHeight: 18,
  },
});