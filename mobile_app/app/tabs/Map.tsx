import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
import { Phone } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

// ⚠️ Replace with Google API key
const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Example technician
  const technician = {
    latitude: 36.472,
    longitude: 2.828,
    phone: "0550000000",
    name: "Technician Putin",
  };

  // Active mission
  const mission = {
    site: "Blida Telecom Tower",
    company: "Algerie Telecom",
    items: 5,
    status: "In Progress",
  };

  useEffect(() => {
    getLocation();
  }, []);

  // Get user location
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setLocationEnabled(false);
      Alert.alert("Permission denied", "Enable location to use map");
      return;
    }

    setLocationEnabled(true);

    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  // Call technician
  const handleCall = () => {
    Linking.openURL(`tel:${technician.phone}`);
  };

  return (
    <View style={styles.container}>
      {/* MAP */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation ? userLocation.latitude : 36.47,
          longitude: userLocation ? userLocation.longitude : 2.83,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={locationEnabled}
      >
        {/*Driver */}
        {userLocation && (
          <Marker coordinate={userLocation} title="Driver" />
        )}

        {/* Technician */}
        <Marker coordinate={technician} title={technician.name} />

        {/* Road route */}
        {userLocation && (
          <MapViewDirections
            origin={userLocation}
            destination={technician}
            apikey={GOOGLE_API_KEY}
            strokeWidth={4}
            strokeColor="#3b82f6"
            onReady={(result) => {
              setDistance(result.distance.toFixed(1) + " km");
              setDuration(Math.ceil(result.duration) + " min");
            }}
            onError={(err) => console.log("Directions error:", err)}
          />
        )}
      </MapView>

      {/* Location warning */}
      {!locationEnabled && (
        <View style={styles.warning}>
          <Text style={{ color: "white" }}>
            Location disabled — enable GPS
          </Text>
        </View>
      )}

      {/* Active Mission Card */}
      <View style={styles.card}>
        <Text style={styles.title}>{mission.site}</Text>
        <Text style={styles.sub}>{mission.company}</Text>

        <Text style={styles.info}>
          📦 {mission.items} items • {mission.status}
        </Text>

        <Text style={styles.info}>
          📍 Distance: {distance || "..."} • ⏱ {duration || "..."}
        </Text>

        {/* Call Button */}
        <Pressable style={styles.callBtn} onPress={handleCall}>
          <Phone color="white" size={18} />
          <Text style={styles.callText}>Call Technician</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  map: {
    width: width,
    height: height,
  },

  warning: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
  },

  card: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },

  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  sub: {
    color: "#9ca3af",
    marginTop: 2,
  },

  info: {
    color: "#9ca3af",
    marginTop: 6,
  },

  callBtn: {
    marginTop: 12,
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  callText: {
    color: "white",
    fontWeight: "600",
  },
});