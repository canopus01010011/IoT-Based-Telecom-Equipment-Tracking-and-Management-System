import React, { useState } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import { Switch } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { Gear } from '@/components/Gear';
import {
  User,
  Mail,
  Phone,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react-native";

const { width, height } = Dimensions.get('window');


export default function ProfileScreen() {
  const router = useRouter();
const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const user = {
    name: "Abedmadjid Teboun",
    role: "Technician",
    email: "abedmadjid@gmail.com",
    phone: "0550000000",
    avatar: null,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      
      {/* HEADER */}
        <Gear size={160} top={height * 0.04} left={width * -0.04} duration={20000} opacity={0.15} />
            <Gear size={120} top={height * 0.5} left={width * 0.8} duration={18000} opacity={0.12} reverse />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <User size={40} color={colors.primary} />
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>

        <View style={styles.status}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      {/* INFO CARD */}
      <View style={styles.card}>
        <InfoRow icon={<Mail size={18} color={colors.primary} />} text={user.email} />
        <InfoRow icon={<Phone size={18} color={colors.primary} />} text={user.phone} />
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <StatCard label="Missions" value="3" />
        <StatCard label="Completed" value="15" />
      </View>

      {/* SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

<MenuItem
  icon={<Settings size={18} />}
  label="Account Settings"
  onPress={() => router.push("../account-settings")}
/>
<View style={styles.menuItem}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
    <Bell size={18} />
    <Text style={styles.menuText}>Notifications</Text>
  </View>

  <Switch
    value={notificationsEnabled}
    onValueChange={setNotificationsEnabled}
    trackColor={{ false: "#374151", true: "#3b82f6" }}
    thumbColor="white"
  />
</View>
<MenuItem
  icon={<User size={18} />}
  label="Help & Support"
  onPress={() => router.push("../help-support")}
/>      </View>

      {/* LOGOUT */}
      <Pressable style={styles.logoutBtn}>
        <LogOut size={18} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

    </ScrollView>
  );
}


function InfoRow({ icon, text }) {
  return (
    <View style={styles.infoRow}>
      {icon}
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {icon}
        <Text style={styles.menuText}>{label}</Text>
      </View>
      <ChevronRight size={18} color="#9ca3af" />
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    alignItems: "center",
    marginTop: 40,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#1f2937",
  },

  name: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },

  role: {
    color: "#9ca3af",
    marginTop: 4,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },

  statusText: {
    color: "#22c55e",
    fontSize: 12,
  },

  card: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  infoText: {
    color: "white",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: "center",
  },

  statValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  statLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },

  section: {
    marginTop: 25,
    marginHorizontal: 20,
  },

  sectionTitle: {
    color: "white",
    fontWeight: "700",
    marginBottom: 10,
  },

  menuItem: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  menuText: {
    color: "white",
  },

  logoutBtn: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  logoutText: {
    color: "white",
    fontWeight: "700",
  },
});