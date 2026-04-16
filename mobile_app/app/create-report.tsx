import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/constants/theme";
import { Camera, Send, Trash2 } from "lucide-react-native";

export default function CreateReport() {
  // 🔐 Simulated user
  const user = { role: "technician" };

  const { missionId, siteName } = useLocalSearchParams();

  const [reportText, setReportText] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // 🚫 BLOCK NON-TECHNICIANS
  if (user.role !== "technician") {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Access Denied</Text>
        <Text style={styles.sub}>Only technicians can create reports</Text>
      </View>
    );
  }

  // 📸 PICK IMAGE
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((a) => a.uri);
      setImages([...images, ...newImages]);
    }
  };

  // 🗑 REMOVE IMAGE
  const removeImage = (uri: string) => {
    setImages(images.filter((img) => img !== uri));
  };

  // 🚀 SUBMIT REPORT
  const handleSubmit = () => {
    if (!reportText.trim()) {
      Alert.alert("Error", "Please write your report");
      return;
    }

    const report = {
      missionId,
      siteName,
      text: reportText,
      images,
      date: new Date(),
    };

    console.log("REPORT SENT:", report);

    Alert.alert("Success", "Report sent to admin");

    setReportText("");
    setImages([]);
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* ✅ FIXED: wrapped properly */}
      <View>
        <Text style={styles.title}>Create Report</Text>

        <Text style={styles.subtitle}>
          Describe the mission outcome and attach images
        </Text>

        <Text style={styles.meta}>
          Mission ID: {missionId}
        </Text>

        <Text style={styles.meta}>
          Site: {siteName}
        </Text>
      </View>

      {/* INPUT */}
      <TextInput
        style={styles.input}
        placeholder="Write your report..."
        placeholderTextColor="#6b7280"
        multiline
        value={reportText}
        onChangeText={setReportText}
      />

      {/* IMAGE BUTTON */}
      <Pressable style={styles.uploadBtn} onPress={pickImage}>
        <Camera color="white" size={18} />
        <Text style={styles.uploadText}>Upload Images</Text>
      </Pressable>

      {/* IMAGE PREVIEW */}
      <View style={styles.imageContainer}>
        {images.map((img, i) => (
          <View key={i} style={styles.imageWrapper}>
            <Image source={{ uri: img }} style={styles.image} />

            <Pressable
              style={styles.deleteBtn}
              onPress={() => removeImage(img)}
            >
              <Trash2 size={14} color="white" />
            </Pressable>
          </View>
        ))}
      </View>

      {/* SUBMIT */}
      <Pressable style={styles.submitBtn} onPress={handleSubmit}>
        <Send size={18} color="white" />
        <Text style={styles.submitText}>Send Report</Text>
      </Pressable>
    </ScrollView>
  );
}

//
// 🎨 STYLES
//

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  error: {
    color: "red",
    fontSize: 18,
    fontWeight: "700",
  },

  sub: {
    color: "#9ca3af",
    marginTop: 6,
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },

  subtitle: {
    color: "#9ca3af",
    marginBottom: 10,
  },

  meta: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 4,
  },

  input: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    color: "white",
    marginTop: 12,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  uploadBtn: {
    marginTop: 16,
    backgroundColor: "#374151",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  uploadText: {
    color: "white",
    fontWeight: "600",
  },

  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 10,
  },

  imageWrapper: {
    position: "relative",
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },

  deleteBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "red",
    borderRadius: 10,
    padding: 4,
  },

  submitBtn: {
    marginTop: 24,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,

    shadowColor: "#3b82f6",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },

  submitText: {
    color: "white",
    fontWeight: "700",
  },
});