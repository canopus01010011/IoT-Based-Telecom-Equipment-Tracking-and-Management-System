import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Gear } from '@/components/Gear';
import { colors } from '@/constants/theme';
import {
  Wrench,
  ClipboardList,
  CheckCircle2,
  BellIcon,
  QrCodeIcon,
  MapPin,
  ClockIcon,
  Building2,
  PackageIcon,
  HomeIcon,
  User,
} from 'lucide-react-native';

import { SafeAreaView, StatusBar } from 'react-native';

<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
  <StatusBar 
    barStyle="light-content" 
    backgroundColor={colors.background} 
  />
</SafeAreaView>

const { width, height } = Dimensions.get('window');

export default function TechDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Home');
  const [notifications] = useState(3);

  const missions = [
    {
      id: 1,
      site: 'Blida Telecom Tower',
      company: 'Mobilis',
      address: '13 Mai, Blida',
      time: '10:00 AM',
      items: 5,
      status: 'Pending',
    },
    {
      id: 2,
      site: 'Alger Center Hub',
      company: 'Ooredoo',
      address: '45 Central Avenue, Alger',
      time: '11:30 AM',
      items: 3,
      status: 'In Progress',
    },
    {
      id: 3,
      site: 'Boufarik Node',
      company: 'Djezzy',
      address: '78 Node Street, Boufarik',
      time: '2:00 PM',
      items: 7,
      status: 'Completed',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Background gears */}
      <Gear size={160} top={height * 0.04} left={width * -0.04} duration={20000} opacity={0.15} />
      <Gear size={120} top={height * 0.5} left={width * 0.8} duration={18000} opacity={0.12} reverse />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Abdemadjid Teboun</Text>
          </View>

          <View style={styles.iconCircle}>
            <BellIcon color={colors.primary} size={22} />
            {notifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Active" value="3" icon={<ClipboardList size={20} color={colors.primary} />} />
          <StatCard label="Completed" value="15" icon={<CheckCircle2 size={20} color={colors.primary} />} />
        </View>

        {/* Missions */}
        <Text style={styles.sectionTitle}>Active Missions</Text>

        {missions.map((m) => (
          <View key={m.id} style={styles.missionCard}>
            <Text style={styles.site}>{m.site}</Text>
            <View style={styles.missionRow}>
              <Building2 size={16} color="#9ca3af" />
              <Text style={styles.missionDetail}>{m.company}</Text>
            </View>
            <View style={styles.missionRow}>
              <MapPin size={16} color="#9ca3af" />
              <Text style={styles.missionDetail}>{m.address}</Text>
            </View>
            <View style={styles.missionRow}>
              <ClockIcon size={16} color="#9ca3af" />
              <Text style={styles.missionDetail}>{m.time}</Text>
            </View>
            <View style={styles.missionRow}>
              <PackageIcon size={16} color="#9ca3af" />
              <Text style={styles.missionDetail}>{m.items} Items</Text>
            </View>
            <View style={[styles.statusBadge, m.status === 'Completed' ? styles.completed : m.status === 'Pending' ? styles.pending : styles.inProgress]}>
              <Text style={styles.statusText}>{m.status}</Text>
            </View>
          </View>
        ))}

      </ScrollView>

    </View>
  );
}

/* Stat Card */
function StatCard({ label, value, icon }) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 100,
  },

  header: {
    marginTop: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  subtitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  title: {
    color: colors.textMuted,
    marginTop: 4,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 5,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginTop: 6,
  },

  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginTop: 10,
  },

  missionCard: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginTop: 10,
  },

  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  missionDetail: {
    color: '#9ca3af',
    fontSize: 12,
  },

  site: {
    color: 'white',
    fontWeight: '600',
  },

  statusBadge: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },

  pending: { backgroundColor: '#f97316' },
  inProgress: { backgroundColor: '#3b82f6' },
  completed: { backgroundColor: '#22c55e' },

  actionCard: {
    backgroundColor: '#111827',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginTop: 10,
  },

  actionTitle: {
    color: 'white',
    fontWeight: '700',
  },

  actionDesc: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },

});
