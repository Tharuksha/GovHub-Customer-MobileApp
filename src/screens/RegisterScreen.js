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
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    NIC: "",
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(),
    gender: "",
    phoneNumber: "",
    emailAddress: "",
    address: "",
    password: "",
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const { register } = useContext(AuthContext);

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

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.dateOfBirth;
    setShowDatePicker(Platform.OS === "ios");
    handleInputChange("dateOfBirth", currentDate);
  };

  const handleGenderSelect = (gender) => {
    handleInputChange("gender", gender);
    setShowGenderPicker(false);
  };

  const validateForm = () => {
    if (Object.values(formData).some((field) => field === "")) {
      setError("All fields are required.");
      return false;
    }
    if (!/^\d{10}$/.test(formData.NIC)) {
      setError("NIC must be 10 digits.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
      setError("Invalid email address.");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError("Phone number must be 10 digits.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    const today = new Date();
    const birthDate = new Date(formData.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setError("You must be at least 18 years old to register.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await register(formData);
      if (!result.success) {
        throw new Error(
          result.error || "Registration failed. Please try again."
        );
      }
      navigation.navigate("Login");
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

  const renderInput = (name, placeholder, icon, isSecure = false) => (
    <View style={styles.inputOuterContainer}>
      <Ionicons
        name={icon}
        size={24}
        color="#4E94DE"
        style={styles.inputIcon}
      />
      <TextInput
        placeholder={placeholder}
        onChangeText={(value) => handleInputChange(name, value)}
        value={formData[name]}
        style={styles.input}
        secureTextEntry={isSecure && !isPasswordVisible}
        editable={!isLoading}
      />
      {isSecure && (
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
      )}
    </View>
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
            <Text style={styles.subtitle}>Create your account</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.formContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {renderInput("NIC", "NIC", "card-outline")}
            {renderInput("firstName", "First Name", "person-outline")}
            {renderInput("lastName", "Last Name", "person-outline")}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.inputOuterContainer}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color="#4E94DE"
                style={styles.inputIcon}
              />
              <Text style={styles.input}>
                {formData.dateOfBirth.toDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={formData.dateOfBirth}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
            <TouchableOpacity
              onPress={() => setShowGenderPicker(true)}
              style={styles.inputOuterContainer}
            >
              <Ionicons
                name="male-female-outline"
                size={24}
                color="#4E94DE"
                style={styles.inputIcon}
              />
              <Text style={styles.input}>
                {formData.gender || "Select Gender"}
              </Text>
            </TouchableOpacity>
            {renderInput("phoneNumber", "Phone Number", "call-outline")}
            {renderInput("emailAddress", "Email Address", "mail-outline")}
            {renderInput("address", "Address", "home-outline")}
            {renderInput("password", "Password", "lock-closed-outline", true)}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              onPress={handleRegister}
              style={[
                styles.registerButton,
                isLoading && styles.disabledButton,
              ]}
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
                  <Text style={styles.registerButtonText}>Register</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={[styles.footerContainer, { opacity: fadeAnim }]}
          >
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              disabled={isLoading}
            >
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showGenderPicker}
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              onPress={() => handleGenderSelect("Male")}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleGenderSelect("Female")}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleGenderSelect("Other")}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Other</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowGenderPicker(false)}
              style={[styles.modalButton, styles.cancelButton]}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4E94DE",
    marginBottom: 5,
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
  picker: {
    flex: 1,
    color: "#343A40",
  },
  registerButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
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
    marginTop: 20,
  },
  footerText: {
    color: "#6C757D",
    fontSize: 16,
  },
  loginText: {
    color: "#4E94DE",
    fontWeight: "600",
    marginLeft: 5,
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    backgroundColor: "#4E94DE",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginVertical: 5,
    minWidth: 100,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F3F5",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#4E94DE",
  },
});

export default RegisterScreen;
