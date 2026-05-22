import { Phone, Truck } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import * as Linking from "expo-linking";

import RoadDirections from "@/components/map/RoadDirections";
import { HAS_GOOGLE_DIRECTIONS } from "@/constants/config";
import { WAREHOUSE } from "@/constants/warehouse";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { useLiveGps } from "@/hooks/useLiveGps";
import { useMissions } from "@/hooks/useMissions";
import { resolveRouteName, sliceRouteFromPosition } from "@/utils/routeUtils";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
  const { location, loading: locationLoading, enabled } = useLocation();
  const { activeMission } = useMissions();
  const { user } = useAuth();

  const containerId = (activeMission?.raw as Record<string, unknown>)
    ?.container_id as string | undefined;

  const site = activeMission?.raw
    ? ((activeMission.raw as Record<string, any>).Site ??
      (activeMission.raw as Record<string, any>).site)
    : null;

  const routeName = resolveRouteName(site as Record<string, unknown> | null);

  const {
    latitude: iotLat,
    longitude: iotLng,
    hasPosition: hasIotPosition,
    battery: iotBattery,
    serial: iotSerial,
    trackPoints,
    plannedRoute,
  } = useLiveGps(containerId, routeName);

  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const destination =
    site?.latitude != null && site?.longitude != null
      ? {
          latitude: Number(site.latitude),
          longitude: Number(site.longitude),
        }
      : null;

  const warehouse = {
    latitude: WAREHOUSE.latitude,
    longitude: WAREHOUSE.longitude,
  };

  const iotCoordinate =
    hasIotPosition && iotLat != null && iotLng != null
      ? { latitude: iotLat, longitude: iotLng }
      : null;

  const trailCoordinates = useMemo(
    () =>
      trackPoints
        .map((point) => ({
          latitude: Number(point.latitude),
          longitude: Number(point.longitude),
        }))
        .filter(
          (point) =>
            Number.isFinite(point.latitude) &&
            Number.isFinite(point.longitude) &&
            !(point.latitude === 0 && point.longitude === 0),
        ),
    [trackPoints],
  );

  const contactPhone =
    user?.role === "driver"
      ? (activeMission?.raw as Record<string, any>)?.technician?.phone
      : (activeMission?.raw as Record<string, any>)?.driver?.phone;

  const useGpxRoute = plannedRoute.length > 1;
  const remainingGpxRoute =
    iotCoordinate && useGpxRoute
      ? sliceRouteFromPosition(plannedRoute, iotCoordinate)
      : [];

  const showEta = !!destination && (HAS_GOOGLE_DIRECTIONS || useGpxRoute);

  useEffect(() => {
    if (!destination) return;

    const points = [
      warehouse,
      ...trailCoordinates,
      ...(iotCoordinate ? [iotCoordinate] : []),
      destination,
    ];

    if (points.length > 1) {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 90, right: 70, bottom: 260, left: 70 },
        animated: true,
      });
    }
  }, [
    destination?.latitude,
    destination?.longitude,
    iotCoordinate?.latitude,
    iotCoordinate?.longitude,
    trailCoordinates,
  ]);

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (!activeMission || !destination) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>No active mission with site location</Text>
      </View>
    );
  }

  if (activeMission.statusRaw !== "in-progress") {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white", textAlign: "center", paddingHorizontal: 24 }}>
          Mission {activeMission.id} — en attente
        </Text>
        <Text style={{ color: "#9ca3af", marginTop: 8, textAlign: "center", paddingHorizontal: 24 }}>
          Le conducteur assigné doit scanner le QR de la mission (MIS-…) à l&apos;entrepôt Oued Smar.
        </Text>
      </View>
    );
  }

  const region: Region = {
    latitude: iotCoordinate?.latitude ?? location?.latitude ?? destination.latitude,
    longitude: iotCoordinate?.longitude ?? location?.longitude ?? destination.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={enabled}
      >
        <Marker coordinate={warehouse} title={WAREHOUSE.name} pinColor="#f59e0b" />

        <Marker coordinate={destination} title={activeMission.site} pinColor="#22c55e" />

        {iotCoordinate && (
          <Marker coordinate={iotCoordinate} title="Container (IoT)">
            <View style={styles.iotMarker}>
              <Truck color="#fff" size={18} />
            </View>
          </Marker>
        )}

        {/* Full planned route — GPX track from backend or Google driving directions */}
        {useGpxRoute ? (
          <Polyline
            coordinates={plannedRoute}
            strokeColor="#6b7280"
            strokeWidth={4}
          />
        ) : (
          destination && (
            <RoadDirections
              origin={warehouse}
              destination={destination}
              strokeColor="#6b7280"
              strokeWidth={4}
              onReady={(km, min) => {
                if (!iotCoordinate) {
                  setDistance(km.toFixed(1) + " km");
                  setDuration(min + " min");
                }
              }}
            />
          )
        )}

        {/* Traveled path — GPS history trail (only if route exists) */}
        {trailCoordinates.length > 1 && (
          <Polyline
            coordinates={[warehouse, ...trailCoordinates]}
            strokeColor="#3b82f6"
            strokeWidth={5}
          />
        )}

        {/* Remaining path — slice GPX from current position (only if route exists) */}
        {iotCoordinate && destination && remainingGpxRoute.length > 1 && (
          <Polyline
            coordinates={remainingGpxRoute}
            strokeColor="#f97316"
            strokeWidth={5}
          />
        )}
      </MapView>

      <View style={styles.card}>
        <Text style={styles.title}>{activeMission.site}</Text>
        <Text style={styles.sub}>{activeMission.address || activeMission.company}</Text>

        <Text style={styles.info}>
          📦 {activeMission.items} items • {activeMission.status}
        </Text>

        {containerId ? (
          <Text style={styles.info}>
            {hasIotPosition
              ? `📡 IoT ${iotSerial || "GPS"} • ${iotLat?.toFixed(5)}, ${iotLng?.toFixed(5)}${iotBattery != null ? ` • 🔋 ${iotBattery}%` : ""}`
              : "⏳ Waiting for IoT GPS simulation…"}
          </Text>
        ) : null}

        {showEta && (distance || duration) ? (
          <Text style={styles.info}>
            📍 Remaining: {distance || "..."} • ⏱ {duration || "..."}
          </Text>
        ) : null}

        {contactPhone ? (
          <Pressable
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${contactPhone}`)}
          >
            <Phone color="white" size={18} />
            <Text style={styles.callText}>
              {user?.role === "driver" ? "Call Technician" : "Call Driver"}
            </Text>
          </Pressable>
        ) : null}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  loadingText: {
    marginTop: 10,
    color: "#9ca3af",
  },
  iotMarker: {
    backgroundColor: "#1d4ed8",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#60a5fa",
  },
  card: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
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
