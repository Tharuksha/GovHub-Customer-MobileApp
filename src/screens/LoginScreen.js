import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  TextInput,
  Text,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [isLoading]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await login(email, password);
      if (!result.success) {
        throw new Error(result.error || "Login failed. Please try again.");
      }
      // If login is successful, the AuthContext will update and redirect to Dashboard
    } catch (error) {
      setError(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderButton = () => (
    <TouchableOpacity
      onPress={handleLogin}
      style={[styles.loginButton, isLoading && styles.disabledButton]}
      disabled={isLoading}
    >
      <LinearGradient
        colors={["#4E94DE", "#3A7CC0"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        {isLoading ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="reload-outline" size={24} color="#FFFFFF" />
          </Animated.View>
        ) : (
          <Text style={styles.loginButtonText}>Log In</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#E0EAFC", "#CFDEF3"]} style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Animated.View
            style={[
              styles.logoContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>GOV HUB</Text>
            <Text style={styles.subtitle}>
              Your gateway to efficient services
            </Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.formContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.inputOuterContainer}>
              <Ionicons
                name="mail-outline"
                size={24}
                color="#4E94DE"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Email"
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
                value={email}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            <View style={styles.inputOuterContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color="#4E94DE"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Password"
                onChangeText={(text) => {
                  setPassword(text);
                  setError("");
                }}
                value={password}
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color="#4E94DE"
                />
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {renderButton()}
          </Animated.View>
          <Animated.View
            style={[styles.footerContainer, { opacity: fadeAnim }]}
          >
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              disabled={isLoading}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4E94DE",
    marginBottom: 10,
  },
  subtitle: {
    color: "#6C757D",
    fontSize: 16,
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputOuterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F5",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#343A40",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    padding: 12,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 10,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  footerText: {
    color: "#6C757D",
    fontSize: 16,
  },
  signUpText: {
    color: "#4E94DE",
    fontWeight: "600",
    marginLeft: 5,
    fontSize: 16,
  },
});

export default LoginScreen;
