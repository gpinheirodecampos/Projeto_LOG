import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DriverState, DriverEvent } from '@/types/driver';
import * as Haptics from 'expo-haptics';

const STORAGE_KEY = 'driver_state';

const initialState: DriverState = {
  currentStatus: 'off_duty',
  currentEventStart: undefined,
  totalJourneyTime: 0,
  totalRestTime: 0,
  events: [],
};

export const useDriverState = () => {
  const [driverState, setDriverState] = useState<DriverState>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from storage
  useEffect(() => {
    loadState();
  }, []);

  // Save state to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveState();
    }
  }, [driverState, isLoading]);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        setDriverState(parsedState);
      }
    } catch (error) {
      console.error('Error loading driver state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(driverState));
    } catch (error) {
      console.error('Error saving driver state:', error);
    }
  };

  const addEvent = (event: DriverEvent) => {
    setDriverState(prev => {
      const newState = { ...prev };
      
      // Add event to history
      newState.events = [event, ...prev.events];
      
      // Update current status and timing
      switch (event.type) {
        case 'journey_start':
          newState.currentStatus = 'on_journey';
          newState.currentEventStart = event.timestamp;
          break;
          
        case 'journey_end':
          newState.currentStatus = 'off_duty';
          newState.currentEventStart = undefined;
          // Add journey time if we have a start event
          if (prev.currentEventStart) {
            const duration = Math.floor(
              (new Date(event.timestamp).getTime() - new Date(prev.currentEventStart).getTime()) / 1000
            );
            newState.totalJourneyTime += duration;
          }
          break;
          
        case 'meal_start':
          newState.currentStatus = 'meal';
          newState.currentEventStart = event.timestamp;
          break;
          
        case 'meal_end':
          newState.currentStatus = 'on_journey';
          newState.currentEventStart = event.timestamp;
          break;
          
        case 'rest_start':
          newState.currentStatus = 'rest';
          newState.currentEventStart = event.timestamp;
          break;
          
        case 'rest_end':
          newState.currentStatus = 'on_journey';
          newState.currentEventStart = event.timestamp;
          // Add rest time if we have a start event
          if (prev.currentEventStart && prev.currentStatus === 'rest') {
            const duration = Math.floor(
              (new Date(event.timestamp).getTime() - new Date(prev.currentEventStart).getTime()) / 1000
            );
            newState.totalRestTime += duration;
          }
          break;
          
        case 'available':
          newState.currentStatus = 'available';
          newState.currentEventStart = event.timestamp;
          break;
          
        case 'inspection':
          // Inspection doesn't change current status
          break;
      }
      
      return newState;
    });
    
    // Provide haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const canPerformAction = (actionType: string): { allowed: boolean; reason?: string } => {
    switch (actionType) {
      case 'journey_start':
        if (driverState.currentStatus !== 'off_duty') {
          return { allowed: false, reason: 'Você deve estar fora de jornada para iniciar' };
        }
        break;
        
      case 'journey_end':
        if (driverState.currentStatus === 'off_duty') {
          return { allowed: false, reason: 'Você não está em jornada' };
        }
        if (driverState.currentStatus === 'meal' || driverState.currentStatus === 'rest') {
          return { allowed: false, reason: 'Finalize a atividade atual primeiro' };
        }
        break;
        
      case 'meal_start':
        if (driverState.currentStatus !== 'on_journey' && driverState.currentStatus !== 'available') {
          return { allowed: false, reason: 'Você deve estar em jornada ou à disposição' };
        }
        break;
        
      case 'meal_end':
        if (driverState.currentStatus !== 'meal') {
          return { allowed: false, reason: 'Você não está em refeição' };
        }
        break;
        
      case 'rest_start':
        if (driverState.currentStatus !== 'on_journey' && driverState.currentStatus !== 'available') {
          return { allowed: false, reason: 'Você deve estar em jornada ou à disposição' };
        }
        break;
        
      case 'rest_end':
        if (driverState.currentStatus !== 'rest') {
          return { allowed: false, reason: 'Você não está descansando' };
        }
        break;
        
      case 'available':
        if (driverState.currentStatus === 'off_duty') {
          return { allowed: false, reason: 'Inicie a jornada primeiro' };
        }
        if (driverState.currentStatus === 'meal' || driverState.currentStatus === 'rest') {
          return { allowed: false, reason: 'Finalize a atividade atual primeiro' };
        }
        break;
        
      case 'inspection':
        if (driverState.currentStatus === 'off_duty') {
          return { allowed: false, reason: 'Você deve estar em jornada' };
        }
        break;
    }
    
    return { allowed: true };
  };

  const getSuggestions = (): string[] => {
    const suggestions = [];
    const now = new Date();
    
    // Check if driver has been working for too long
    if (driverState.currentStatus === 'on_journey' && driverState.currentEventStart) {
      const workingTime = Math.floor(
        (now.getTime() - new Date(driverState.currentEventStart).getTime()) / 1000
      );
      
      if (workingTime > 4 * 3600) { // 4 hours
        suggestions.push('Considere fazer uma refeição após 4h de jornada');
      }
      
      if (workingTime > 5.5 * 3600) { // 5.5 hours
        suggestions.push('Tempo para descanso obrigatório');
      }
    }
    
    // Check total journey time
    if (driverState.totalJourneyTime > 8 * 3600) { // 8 hours
      suggestions.push('Você já trabalhou mais de 8 horas hoje');
    }
    
    return suggestions;
  };
  const getAvailableActions = () => {
    const actions = [];
    
    switch (driverState.currentStatus) {
      case 'off_duty':
        actions.push('journey_start');
        break;
        
      case 'on_journey':
        actions.push('journey_end', 'meal_start', 'rest_start', 'available', 'inspection');
        break;
        
      case 'meal':
        actions.push('meal_end');
        break;
        
      case 'rest':
        actions.push('rest_end');
        break;
        
      case 'available':
        actions.push('journey_end', 'meal_start', 'rest_start', 'inspection');
        break;
    }
    
    return actions;
  };

  const resetDayTotals = () => {
    setDriverState(prev => ({
      ...prev,
      totalJourneyTime: 0,
      totalRestTime: 0,
      events: [],
    }));
  };

  return {
    driverState,
    isLoading,
    addEvent,
    canPerformAction,
    getSuggestions,
    getAvailableActions,
    resetDayTotals,
  };
};