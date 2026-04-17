import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import {
  Search,
  MapPin,
  Clock,
  Building2,
  Package,
} from "lucide-react-native";

export default function MissionsScreen() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const missions = [
    {
      id: 1,
      site: "Blida Telecom Tower",
      company: "Algerie Telecom",
      status: "Pending",
      date: "today",
      time: "10:30",
      items: 5,
    },
    {
      id: 2,
      site: "Alger Center Hub",
      company: "Mobilis",
      status: "Completed",
      date: "today",
      time: "09:00",
      items: 3,
    },
    {
      id: 3,
      site: "Boufarik Node",
      company: "Ooredoo",
      status: "Completed",
      date: "old",
      time: "Yesterday",
      items: 8,
    },
  ];

  // Filter logic
  const filtered = missions.filter((m) => {
    const matchSearch =
      m.site.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ||
      (filter === "Today" && m.date === "today") ||
      (filter === "Completed" && m.status === "Completed") ||
      (filter === "Pending" && m.status === "Pending");

    return matchSearch && matchFilter;
  });

  const todayMissions = filtered.filter((m) => m.date === "today");
  const completedMissions = filtered.filter(
    (m) => m.status === "Completed"
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/*Search */}
        <View style={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            placeholder="Search missions..."
            placeholderTextColor="#6b7280"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {["All", "Today", "Completed", "Pending"].map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterBtn,
                filter === f && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && { color: "white" },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {/*  Today Missions */}
        {todayMissions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayMissions.map((m) => (
              <MissionCard key={m.id} mission={m} router={router} />
            ))}
          </>
        )}

        {/*  Completed */}
        {completedMissions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Completed</Text>
            {completedMissions.map((m) => (
              <MissionCard key={m.id} mission={m} router={router} />
            ))}
          </>
        )}

      </ScrollView>
    </View>
  );
}

//Mission Card

function MissionCard({ mission, router }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/mission-details",
          params: { id: mission.id },
        })
      }
    >
      <Text style={styles.site}>{mission.site}</Text>

      <View style={styles.row}>
        <Building2 size={14} color="#9ca3af" />
        <Text style={styles.text}>{mission.company}</Text>
      </View>

      <View style={styles.row}>
        <Clock size={14} color="#9ca3af" />
        <Text style={styles.text}>{mission.time}</Text>
      </View>

      <View style={styles.row}>
        <Package size={14} color="#9ca3af" />
        <Text style={styles.text}>{mission.items} items</Text>
      </View>

      <View style={styles.bottom}>
        <Text
          style={[
            styles.status,
            mission.status === "Completed"
              ? { color: "#22c55e" }
              : { color: "#f59e0b" },
          ]}
        >
          {mission.status}
        </Text>
      </View>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 8,
  },

  input: {
    color: "white",
    flex: 1,
  },

  filters: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },

  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#1f2937",
  },

  activeFilter: {
    backgroundColor: colors.primary,
  },

  filterText: {
    color: "#9ca3af",
    fontSize: 12,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 12,
  },

  site: {
    color: "white",
    fontWeight: "700",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  text: {
    color: "#9ca3af",
    fontSize: 12,
  },

  bottom: {
    marginTop: 10,
    alignItems: "flex-end",
  },

  status: {
    fontWeight: "700",
  },
});