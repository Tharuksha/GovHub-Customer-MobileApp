import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const ViewAppointmentScreen = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
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
      const ticketResponse = await axios.get(
        `https://govhub-backend-6375764a4f5c.herokuapp.com/api/tickets/${ticketId}`
      );
      setTicket(ticketResponse.data);

      if (ticketResponse.data.departmentID) {
        const departmentResponse = await axios.get(
          `https://govhub-backend-6375764a4f5c.herokuapp.com/api/departments/${ticketResponse.data.departmentID}`
        );
        setDepartment(departmentResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert(
        "Error",
        "Failed to fetch appointment details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDetailItem = (title, value, icon) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIconContainer}>
        <Ionicons name={icon} size={24} color="#4E94DE" />
      </View>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={styles.detailValue}>{value || "N/A"}</Text>
      </View>
    </View>
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: headerHeight } } }],
    { useNativeDriver: false }
  );

  const headerHeightInterpolate = headerHeight.interpolate({
    inputRange: [0, height * 0.2],
    outputRange: [height * 0.35, height * 0.15],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <Ionicons name="timer-outline" size={50} color="#4E94DE" />
        </Animated.View>
        <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
          Loading appointment details...
        </Animated.Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Appointment not found</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Appointment Details</Text>
          <Text style={styles.headerSubtitle}>
            View your appointment information
          </Text>
        </Animated.View>
      </Animated.View>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <BlurView intensity={80} tint="light" style={styles.blurContainer}>
            <View style={styles.cardContent}>
              {renderDetailItem(
                "Issue",
                ticket.issueDescription,
                "alert-circle-outline"
              )}
              {renderDetailItem("Notes", ticket.notes, "document-text-outline")}
              {renderDetailItem(
                "Date",
                new Date(ticket.appointmentDate).toLocaleDateString(),
                "calendar-outline"
              )}
              {renderDetailItem("Time", ticket.appointmentTime, "time-outline")}
              {renderDetailItem(
                "Status",
                ticket.status,
                "information-circle-outline"
              )}
              {renderDetailItem(
                "Department",
                department ? department.departmentName : "Loading...",
                "business-outline"
              )}
              {ticket.staffID &&
                renderDetailItem(
                  "Assigned Staff",
                  ticket.staffID,
                  "person-outline"
                )}
              {ticket.feedback &&
                renderDetailItem(
                  "Feedback",
                  ticket.feedback,
                  "chatbubble-outline"
                )}
            </View>
          </BlurView>
        </Animated.View>
        <Animated.View
          style={[
            styles.backButton,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <LinearGradient
              colors={["#4E94DE", "#3A7CC0"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.gradient}
            >
              <Text style={styles.backButtonText}>Back to History</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
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
  card: {
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  blurContainer: {
    borderRadius: 15,
    overflow: "hidden",
  },
  cardContent: {
    padding: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(78, 148, 222, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4E94DE",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  backButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#FF6A88",
  },
});

export default ViewAppointmentScreen;
