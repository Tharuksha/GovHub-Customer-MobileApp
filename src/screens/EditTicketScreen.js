import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Text,
} from "react-native";
import { TextInput, HelperText, Snackbar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_URL = "https://govhub-backend-6375764a4f5c.herokuapp.com";
const { width, height } = Dimensions.get("window");

const EditTicketScreen = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState({
    issueDescription: "",
    notes: "",
    appointmentDate: new Date(),
    appointmentTime: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
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

    fetchTicketData();
  }, []);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/tickets/${ticketId}`);
      const fetchedTicket = response.data;
      setTicket({
        ...fetchedTicket,
        appointmentDate: new Date(fetchedTicket.appointmentDate),
      });
    } catch (error) {
      console.error("Error fetching ticket:", error);
      showSnackbar("Failed to fetch appointment details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    if (ticket.status === "Solved") {
      showSnackbar("Cannot edit a solved ticket.");
      return;
    }
    setTicket({ ...ticket, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (ticket.status === "Solved") {
      showSnackbar("Cannot edit a solved ticket.");
      return;
    }
    const currentDate = selectedDate || ticket.appointmentDate;
    setShowDatePicker(Platform.OS === "ios");
    handleInputChange("appointmentDate", currentDate);
  };

  const validateForm = () => {
    if (ticket.status === "Solved") {
      showSnackbar("Cannot edit a solved ticket.");
      return false;
    }

    let isValid = true;
    let newErrors = {};

    if (!ticket.issueDescription.trim()) {
      newErrors.issueDescription = "Issue description is required";
      isValid = false;
    }

    if (!ticket.notes.trim()) {
      newErrors.notes = "Notes are required";
      isValid = false;
    }

    if (new Date(ticket.appointmentDate) < new Date()) {
      newErrors.appointmentDate = "Appointment date must be in the future";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const updatedTicket = {
        ...ticket,
        appointmentDate: ticket.appointmentDate.toISOString().split("T")[0],
      };
      await axios.put(`${API_URL}/api/tickets/${ticketId}`, updatedTicket);
      showSnackbar("Appointment updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating ticket:", error);
      showSnackbar("Failed to update appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
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

  const renderInput = (
    label,
    value,
    onChangeText,
    error,
    multiline = false,
    editable = true
  ) => (
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
          error={!!error}
          disabled={!editable || ticket.status === "Solved"}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
        />
      </BlurView>
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerTitle}>
            {ticket.status === "Solved"
              ? "View Appointment"
              : "Edit Appointment"}
          </Text>
          <Text style={styles.headerSubtitle}>
            Update your appointment details
          </Text>
        </Animated.View>
      </Animated.View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {renderInput(
          "Issue Description",
          ticket.issueDescription,
          (value) => handleInputChange("issueDescription", value),
          errors.issueDescription
        )}
        {renderInput(
          "Notes",
          ticket.notes,
          (value) => handleInputChange("notes", value),
          errors.notes,
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
              disabled={ticket.status === "Solved"}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color="#4E94DE"
                style={styles.dateIcon}
              />
              <Text style={styles.dateText}>
                Appointment Date: {ticket.appointmentDate.toDateString()}
              </Text>
            </TouchableOpacity>
          </BlurView>
          <HelperText type="error" visible={!!errors.appointmentDate}>
            {errors.appointmentDate}
          </HelperText>
        </Animated.View>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={ticket.appointmentDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
        {renderInput("Status", ticket.status, null, null, false, false)}
        {ticket.status !== "Solved" && (
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
                <Text style={styles.submitButtonText}>
                  {loading ? "Updating..." : "Update Appointment"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <LinearGradient
              colors={["#FF9A8B", "#FF6A88"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Back to History</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
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
  snackbar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default EditTicketScreen;
