import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_BASE_URL = "https://govhub-backend-6375764a4f5c.herokuapp.com/api";
const POLLING_INTERVAL = 300000; // 5 minutes
const { width, height } = Dimensions.get("window");

const TicketHistoryScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerHeight = useRef(new Animated.Value(height * 0.35)).current;

  const fetchTickets = useCallback(
    async (showLoading = true) => {
      if (!user || !user._id) {
        setError("User ID is not available. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        if (showLoading) setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/tickets`);

        if (!Array.isArray(response.data)) {
          throw new Error("API did not return an array of tickets");
        }

        const userTickets = response.data.filter(
          (ticket) => ticket.customerID === user._id
        );

        const sortedTickets = userTickets.sort(
          (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
        );

        setTickets(sortedTickets);
      } catch (err) {
        setError(`Failed to fetch appointments: ${err.message}`);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [user]
  );

  const handleDelete = async (ticketId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}`);
      const ticket = response.data;

      if (ticket.status === "Accepted" || ticket.status === "In Progress") {
        Alert.alert(
          "Cannot delete",
          "Cannot delete an accepted or in-progress appointment."
        );
        return;
      }

      await axios.delete(`${API_BASE_URL}/tickets/${ticketId}`);
      Alert.alert("Success", "Appointment deleted successfully");
      fetchTickets(false);
    } catch (err) {
      Alert.alert("Error", "Error deleting appointment. Please try again.");
    }
  };

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

    fetchTickets();
    const interval = setInterval(() => fetchTickets(false), POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchTickets]);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets().then(() => setRefreshing(false));
  }, [fetchTickets]);

  const renderTicketItem = ({ item, index }) => {
    const canDelete =
      item.status !== "Approved" && item.status !== "In Progress";

    return (
      <Animated.View
        style={[
          styles.ticketCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 50 * (index + 1)],
                }),
              },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <View style={styles.ticketContent}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketTitle}>{item.issueDescription}</Text>
              <Text style={styles.ticketStatus}>{item.status}</Text>
            </View>
            <Text style={styles.ticketDate}>
              {new Date(item.appointmentDate).toLocaleDateString()} at{" "}
              {new Date(item.appointmentDate).toLocaleTimeString()}
            </Text>
            <View style={styles.ticketActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate("ViewAppointment", { ticketId: item._id })
                }
              >
                <Ionicons name="eye-outline" size={24} color="#4E94DE" />
                <Text style={styles.actionText}>View</Text>
              </TouchableOpacity>
              {item.status !== "Approved" && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("EditTicket", { ticketId: item._id })
                  }
                >
                  <Ionicons name="pencil-outline" size={24} color="#4E94DE" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  !canDelete && styles.disabledButton,
                ]}
                onPress={() =>
                  canDelete
                    ? Alert.alert(
                        "Delete Appointment",
                        "Are you sure you want to delete this appointment?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            onPress: () => handleDelete(item._id),
                          },
                        ]
                      )
                    : Alert.alert(
                        "Cannot delete",
                        "Cannot delete an accepted or in-progress appointment."
                      )
                }
                disabled={!canDelete}
              >
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color={canDelete ? "#FF6A88" : "#999"}
                />
                <Text
                  style={[styles.actionText, !canDelete && styles.disabledText]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    );
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
          <Text style={styles.headerTitle}>Appointment History</Text>
          <Text style={styles.headerSubtitle}>
            Your scheduled and past appointments
          </Text>
        </Animated.View>
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Animated.FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={tickets}
        renderItem={renderTicketItem}
        keyExtractor={(item) => item._id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No appointments found.</Text>
          </View>
        )}
      />
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
  list: {
    flex: 1,
    backgroundColor: "transparent",
  },
  listContent: {
    paddingTop: height * 0.35,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  ticketCard: {
    borderRadius: 15,
    marginBottom: 15,
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
  ticketContent: {
    padding: 20,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4E94DE",
    flex: 1,
  },
  ticketStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6C757D",
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ticketDate: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 15,
  },
  ticketActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
    color: "#4E94DE",
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    marginTop: height * 0.35 + 10,
  },
});

export default TicketHistoryScreen;
