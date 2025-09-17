import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Clock, MapPin, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

interface EventConfirmationModalProps {
  visible: boolean;
  eventType: string;
  eventLabel: string;
  eventIcon: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EventConfirmationModal: React.FC<EventConfirmationModalProps> = ({
  visible,
  eventType,
  eventLabel,
  eventIcon,
  location,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (visible) {
      const updateTime = () => {
        const now = new Date();
        setCurrentTime(
          now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);

      return () => clearInterval(interval);
    }
  }, [visible]);

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  const getEventColor = () => {
    if (eventType.includes('start') || eventType === 'journey_start') return '#4CAF50';
    if (eventType.includes('end') || eventType === 'journey_end') return '#F44336';
    return '#1976D2';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { 
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
        }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.iconContainer, { backgroundColor: getEventColor() }]}>
            <Text style={styles.modalIcon}>{eventIcon}</Text>
          </View>

          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Confirmar Evento
          </Text>
          <Text style={[styles.eventLabel, { color: theme.colors.primary }]}>
            {eventLabel}
          </Text>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {currentTime}
              </Text>
            </View>

            {location ? (
              <View style={styles.infoRow}>
                <MapPin size={20} color={theme.colors.success} />
                <Text style={[styles.infoText, { color: theme.colors.text }]} numberOfLines={2}>
                  {location.address}
                </Text>
              </View>
            ) : (
              <View style={styles.infoRow}>
                <MapPin size={20} color={theme.colors.warning} />
                <Text style={[styles.infoText, { color: theme.colors.warning }]}>
                  Obtendo localização...
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button, 
                { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                }
              ]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                CANCELAR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: getEventColor() },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>CONFIRMAR</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  eventLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EventConfirmationModal;