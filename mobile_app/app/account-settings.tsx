import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { colors } from "@/constants/theme";
import { Save } from "lucide-react-native";

export default function AccountSettings() {
  const [name, setName] = useState("Abedmadjid Teboun");
  const [email, setEmail] = useState("abedmadjid@gmail.com");
  const [phone, setPhone] = useState("0550000000");
  const [password, setPassword] = useState("");

  const handleSave = () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // 🔴 Later connect to backend
    const updatedUser = {
      name,
      email,
      phone,
      password,
    };

    console.log("UPDATED USER:", updatedUser);

    Alert.alert("Success", "Account updated successfully");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>

      {/* NAME */}
      <Input label="Full Name" value={name} onChange={setName} />

      {/* EMAIL */}
      <Input label="Email" value={email} onChange={setEmail} />

      {/* PHONE */}
      <Input label="Phone Number" value={phone} onChange={setPhone} />

      {/* PASSWORD */}
      <Input
        label="New Password"
        value={password}
        onChange={setPassword}
        secure
      />

      {/* SAVE BUTTON */}
      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Save size={18} color="white" />
        <Text style={styles.saveText}>Save Changes</Text>
      </Pressable>
    </ScrollView>
  );
}


type InputProps = {
  label: string;
  value: string;
  onChange: (text: string) => void;
  secure?: boolean;
};

function Input({ label, value, onChange, secure = false }: InputProps) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        style={styles.input}
        placeholder={`Enter ${label}`}
        placeholderTextColor="#6b7280"
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },

  label: {
    color: "#9ca3af",
    marginBottom: 6,
    fontSize: 12,
  },

  input: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    color: "white",
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  saveBtn: {
    marginTop: 30,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,

    // glow
    shadowColor: "#3b82f6",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },

  saveText: {
    color: "white",
    fontWeight: "700",
  },
});