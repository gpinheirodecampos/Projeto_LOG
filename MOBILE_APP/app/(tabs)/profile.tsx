import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { User, Settings, Moon, Bell, MapPin, Shield, LogOut } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sair do App',
      'Tem certeza que deseja sair? Todos os dados não sincronizados serão perdidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            console.log('Logout pressed');
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.avatarContainer}>
          <User size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.name}>João Silva</Text>
        <Text style={styles.info}>Motorista Profissional</Text>
        <Text style={styles.info}>CNH: 12345678901</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Settings size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Configurações
          </Text>
        </View>

        <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.settingLeft}>
            <Moon size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Modo Noturno
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            thumbColor={isDarkMode ? theme.colors.primary : '#FFFFFF'}
            trackColor={{ 
              false: theme.colors.border, 
              true: theme.isDark ? '#1565C0' : '#BBDEFB' 
            }}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.settingLeft}>
            <Bell size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Notificações
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            thumbColor={notifications ? theme.colors.primary : '#FFFFFF'}
            trackColor={{ 
              false: theme.colors.border, 
              true: theme.isDark ? '#1565C0' : '#BBDEFB' 
            }}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.settingLeft}>
            <MapPin size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Localização
            </Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            thumbColor={locationEnabled ? theme.colors.primary : '#FFFFFF'}
            trackColor={{ 
              false: theme.colors.border, 
              true: theme.isDark ? '#1565C0' : '#BBDEFB' 
            }}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Segurança e Privacidade
          </Text>
        </View>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
            Alterar PIN
          </Text>
          <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
            Biometria
          </Text>
          <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
            Política de Privacidade
          </Text>
          <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
            Sobre o App
          </Text>
          <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
            Ajuda e Suporte
          </Text>
          <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.colors.error }]} onPress={handleLogout}>
        <LogOut size={20} color="#FFFFFF" />
        <Text style={styles.logoutText}>Sair do App</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
        Versão 1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    color: '#E3F2FD',
    marginBottom: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuLabel: {
    fontSize: 16,
  },
  menuArrow: {
    fontSize: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  version: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
});