import type { Role } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export function useLogin() {
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const [role, setRole] = useState<Role>("technician");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    if (!userId.trim() || !password.trim()) {
      Alert.alert("Login required", "Please enter your ID and password.");
      return;
    }

    try {
      await authLogin(userId.trim(), password.trim(), role);
      router.replace("./(Tabs)/Home");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      Alert.alert("Login failed", message);
    }
  }

  return {
    role,
    setRole,
    userId,
    setUserId,
    password,
    setPassword,
    login,
  };
}
