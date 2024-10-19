import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Text,
  Animated,
} from "react-native";
import { TextInput, Snackbar, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_BASE_URL = "https://govhub-backend-6375764a4f5c.herokuapp.com/api";
const { width, height } = Dimensions.get("window");

const AddTicketScreen = ({ route, navigation }) => {
  const { departmentId } = route.params;
  const { user } = useContext(AuthContext);
  const [ticketData, setTicketData] = useState({
    customerID: user?._id,
    issueDescription: "",
    notes: "",
    appointmentDate: new Date(),
    appointmentTime: "",
    departmentID: departmentId,
    status: "Pending",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerHeight = useRef(new Animated.Value(height * 0.35)).current;

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    if (!user || !user._id) {
      setError("User information is not available. Please log in again.");
    }
  }, [user]);

  const handleInputChange = (name, value) => {
    setTicketData({ ...ticketData, [name]: value });
    setError("");
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || ticketData.appointmentDate;
    setShowDatePicker(Platform.OS === "ios");
    handleInputChange("appointmentDate", currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || ticketData.appointmentTime;
    setShowTimePicker(Platform.OS === "ios");
    handleInputChange("appointmentTime", currentTime.toLocaleTimeString());
  };

  const validateForm = () => {
    if (!ticketData.issueDescription.trim()) {
      setError("Please enter an issue description.");
      return false;
    }
    if (!ticketData.appointmentTime) {
      setError("Please select an appointment time.");
      return false;
    }
    if (new Date(ticketData.appointmentDate) < new Date()) {
      setError("Appointment date must be in the future.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/tickets`, ticketData);
      console.log("Ticket created:", response.data);
      setSnackbarMessage("Appointment scheduled successfully!");
      setSnackbarVisible(true);
      setTimeout(() => navigation.navigate("TicketHistory"), 2000);
    } catch (error) {
      console.error("Error creating ticket:", error);
      setError(
        `Failed to schedule appointment: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: headerHeight } } }],
    { useNativeDriver: false }
  );

  const headerHeightInterpolate = headerHeight.interpolate({
    inputRange: [0, height * 0.2],
    outputRange: [height * 0.35, height * 0.15],
    extrapolate: "clamp",
  });

  const renderInput = (label, value, onChangeText, multiline = false) => (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <TextInput
          label={label}
          value={value}
          onChangeText={onChangeText}
          mode="flat"
          style={styles.input}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
        />
      </BlurView>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4E94DE" />
        <Text style={styles.loadingText}>Scheduling appointment...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" />
      <Animated.View
        style={[styles.header, { height: headerHeightInterpolate }]}
      >
        <LinearGradient
          colors={["#4E94DE", "#3A7CC0"]}
          style={StyleSheet.absoluteFillObject}
        />
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headerTitle}>Schedule New Appointment</Text>
          <Text style={styles.headerSubtitle}>Fill in the details below</Text>
        </Animated.View>
      </Animated.View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {renderInput(
          "Issue Description",
          ticketData.issueDescription,
          (value) => handleInputChange("issueDescription", value),
          true
        )}
        {renderInput(
          "Notes (Optional)",
          ticketData.notes,
          (value) => handleInputChange("notes", value),
          true
        )}
        <Animated.View
          style={[
            styles.inputContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <BlurView intensity={80} tint="light" style={styles.blurContainer}>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color="#4E94DE"
                style={styles.dateIcon}
              />
              <Text style={styles.dateText}>
                Date: {ticketData.appointmentDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={ticketData.appointmentDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
        <Animated.View
          style={[
            styles.inputContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <BlurView intensity={80} tint="light" style={styles.blurContainer}>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={styles.dateButton}
            >
              <Ionicons
                name="time-outline"
                size={24}
                color="#4E94DE"
                style={styles.dateIcon}
              />
              <Text style={styles.dateText}>
                Time: {ticketData.appointmentTime || "Not set"}
              </Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
        {showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={
              ticketData.appointmentTime
                ? new Date(`2000-01-01T${ticketData.appointmentTime}`)
                : new Date()
            }
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <LinearGradient
              colors={["#4E94DE", "#3A7CC0"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Schedule Appointment</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
            <LinearGradient
              colors={["#FF9A8B", "#FF6A88"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Back to Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: "Dismiss",
          onPress: () => setSnackbarVisible(false),
        }}
        duration={2000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 10,
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 5,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollViewContent: {
    paddingTop: height * 0.35,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4E94DE",
  },
  inputContainer: {
    marginBottom: 15,
  },
  blurContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },
  input: {
    backgroundColor: "transparent",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    marginTop: 20,
  },
  submitButton: {
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF6A88",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 16,
  },
  snackbar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default AddTicketScreen;
