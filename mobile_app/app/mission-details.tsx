import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { colors } from "@/constants/theme";
import { Gear } from "@/components/Gear";
import {
  Phone,
  User,
  Wrench,
  Truck,
  FileText,
  QrCode,
} from "lucide-react-native";

const { width, height } = Dimensions.get("window");


export default function MissionDetails() {
  //STATIC DATA
  const user = { role: "technician" }; 
const router = useRouter();
  const mission = {
    Mission_ID: "M-001",
    Mission_type: "Installation",
    scheduled_start_date: "2026-04-06 ",
    scheduled_end_date: "2026-04-06",
    Start_date: "2026-04-06 09:15",
    End_date: "--",
    Mission_status: "In Progress",
    Creation_date: "2026-04-05",
  };

  const site = {
    Site_ID: "S-11",
    Site_name: "Blida Telecom Tower",
    Site_address: "Blida, Algeria",
    Site_creation_date: "2024-01-10",
    Site_Latitude: "36.47",
    Site_Longitude: "2.83",
  };

  const gps = {
    GPS_ID: "GPS-77",
    Device_serial_number: "DEV-9981",
    Battery_level: "78%",
    Device_status: "Active",
    Last_maintenance_date: "2026-03-01",
  };

  const equipment = [
    {
      Eq_ID: "EQ-01",
      Eq_type: "Router",
      Eq_Serial_number: "SN12345",
      Eq_model: "Huawei AX3",
      Eq_qr_code: "QR12345",
      Eq_status: "Delivered",
    },
    {
      Eq_ID: "EQ-02",
      Eq_type: "Antenna",
      Eq_Serial_number: "SN67890",
      Eq_model: "Nokia AirScale",
      Eq_qr_code: "QR67890",
      Eq_status: "Pending",
    },
  ];

  return (
    <View style={styles.container}>
      {/*Animated gears */}
      <Gear size={150} top={height * 0.05} left={width * -0.05} duration={20000} opacity={0.12} />
      <Gear size={120} top={height * 0.6} left={width * 0.8} duration={18000} opacity={0.1} reverse />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* HEADER */}
        <Text style={styles.title}>{site.Site_name}</Text>
        <Text style={styles.subtitle}>{site.Site_address}</Text>

        {/* MISSION */}
        <Section title="Mission Info">
          <Info label="ID" value={mission.Mission_ID} />
          <Info label="Type" value={mission.Mission_type} />
          <Info label="Scheduled" value={`${mission.scheduled_start_date} → ${mission.scheduled_end_date}`} />
          <Info label="Started" value={mission.Start_date} />
          <Info label="End" value={mission.End_date} />
          <Info label="Status" value={mission.Mission_status} highlight />
          <Info label="Created" value={mission.Creation_date} />
        </Section>

        {/*SITE */}
        <Section title="Site Info">
          <Info label="ID" value={site.Site_ID} />
          <Info label="Name" value={site.Site_name} />
          <Info label="Address" value={site.Site_address} />
          <Info label="Lat/Lng" value={`${site.Site_Latitude}, ${site.Site_Longitude}`} />
        </Section>

        {/*GPS */}
        <Section title="Tracking Device">
          <Info label="GPS ID" value={gps.GPS_ID} />
          <Info label="Serial" value={gps.Device_serial_number} />
          <Info label="Battery" value={gps.Battery_level} />
          <Info label="Status" value={gps.Device_status} />
        </Section>

        {/* EQUIPMENT */}
        <Text style={styles.sectionTitle}>Equipment</Text>
        {equipment.map((eq, i) => (
          <View key={i} style={styles.card}>
            <Info label="ID" value={eq.Eq_ID} />
            <Info label="Type" value={eq.Eq_type} />
            <Info label="Model" value={eq.Eq_model} />
            <Info label="Serial" value={eq.Eq_Serial_number} />
            <Info label="QR" value={eq.Eq_qr_code} />
            <Info label="Status" value={eq.Eq_status} />
          </View>
        ))}

        {/* CONTACT */}
        <Text style={styles.sectionTitle}>Contact</Text>

        <View style={styles.contactRow}>
          <CircleIcon icon={<Truck size={18} />} />
          <CircleIcon icon={<User size={18} />} />
        </View>

        {/*ACTIONS */}
        {user.role === "technician" && (
          <>
<GlowButton
  icon={<FileText size={18} />}
  text="Create Report"
  onPress={() =>
    router.push({
      pathname: "create-report",
      params: {
        missionId: mission.Mission_ID,
        siteName: site.Site_name,
      },
    })
  }
/>            <GlowButton icon={<QrCode size={18} />} text="Confirm Delivery" />
          </>
        )}

        {user.role === "driver" && (
          <GlowButton icon={<QrCode size={18} />} text="Start Delivery" />
        )}
      </ScrollView>
    </View>
  );
}

/* COMPONENTS */

function Section({ title, children }) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </>
  );
}

function Info({ label, value, highlight }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && { color: "#3b82f6" }]}>
        {value}
      </Text>
    </View>
  );
}

function CircleIcon({ icon }) {
  return <View style={styles.circle}>{icon}</View>;
}

function GlowButton({ icon, text, onPress }) {
  return (
    <Pressable style={styles.glowBtn} onPress={onPress}>
      {icon}
      <Text style={styles.glowText}>{text}</Text>
    </Pressable>
  );
}

/*  STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
  },

  subtitle: {
    color: "#9ca3af",
    marginBottom: 20,
  },

  sectionTitle: {
    color: "white",
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    color: "#9ca3af",
    fontSize: 12,
  },

  value: {
    color: "white",
    fontWeight: "600",
  },

  contactRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  glowBtn: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,

    // glow
    shadowColor: "#3b82f6",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },

  glowText: {
    color: "white",
    fontWeight: "700",
  },
});