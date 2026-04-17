import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors } from "@/constants/theme";
import { RefreshCcw } from "lucide-react-native";

export default function QRScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [mission, setMission] = useState<any>(null);

  // 🔐 Simulated user (replace later with auth)
  const user = {
    role: "technician", // change to "driver" to test
  };

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  // ✅ HANDLE SCAN
  const handleScan = ({ data }: { data: string }) => {
    try {
      const parsed = JSON.parse(data);

      if (!parsed.missionId) {
        throw new Error("Invalid QR");
      }

      setMission(parsed);
      setScanned(true);
    } catch (err) {
      Alert.alert("Invalid QR Code", "This QR is not recognized");
    }
  };

  // 🔄 RESCAN
  const handleRescan = () => {
    setScanned(false);
    setMission(null);
  };

  // 🚀 ACTION BUTTON
  const handleAction = () => {
    if (user.role === "driver") {
      Alert.alert("Success", "Delivery Started 🚚");
    } else {
      Alert.alert("Success", "Package Received 📦");
    }
  };

  // ⛔ Loading permission
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Requesting permission...</Text>
      </View>
    );
  }

  // ⛔ Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera access denied</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CAMERA */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      {/* OVERLAY */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />

        <View style={styles.overlayMiddle}>
          <View style={styles.sideOverlay} />

          {/* FRAME */}
          <View style={styles.frame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <View style={styles.sideOverlay} />
        </View>

        <View style={styles.overlayBottom}>
          <Text style={styles.title}>Scan QR Code</Text>
          <Text style={styles.subtitle}>Align QR inside the frame</Text>
        </View>
      </View>

      {/* RESULT */}
      {scanned && mission && (
        <View style={styles.card}>
          <Text style={styles.resultTitle}>Mission Info</Text>

          <Text style={styles.resultText}>
            Mission ID: {mission.missionId}
          </Text>

          <Text style={styles.resultText}>
            Site: {mission.site}
          </Text>

          <Text style={styles.resultText}>
            Location: {mission.location}
          </Text>

          {/* 🎯 ROLE BASED ACTION */}
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor:
                  user.role === "driver" ? "#22c55e" : "#3b82f6",
              },
            ]}
            onPress={handleAction}
          >
            <Text style={styles.buttonText}>
              {user.role === "driver"
                ? "Start Delivery Mission"
                : "Package Received"}
            </Text>
          </Pressable>

          {/* 🔄 RESCAN */}
          <Pressable style={styles.buttonSecondary} onPress={handleRescan}>
            <RefreshCcw color="white" size={18} />
            <Text style={styles.buttonText}>Scan Again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

//
// 🎨 STYLES
//

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  text: {
    color: "white",
    marginBottom: 10,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },

  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  overlayMiddle: {
    flexDirection: "row",
    height: 260,
  },

  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    paddingTop: 20,
  },

  frame: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
  },

  corner: {
    position: "absolute",
    width: 35,
    height: 35,
    borderColor: "#3b82f6",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    marginTop: 4,
  },

  card: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  resultTitle: {
    color: "#9ca3af",
    fontSize: 12,
  },

  resultText: {
    color: "white",
    marginTop: 6,
    fontWeight: "600",
  },

  button: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",

    // glow
    shadowColor: "#3b82f6",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },

  buttonSecondary: {
    marginTop: 10,
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});