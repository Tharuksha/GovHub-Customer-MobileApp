import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Text,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

const DashboardScreen = ({ navigation }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerHeight = useRef(new Animated.Value(height * 0.3)).current;

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
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

    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://govhub-backend-6375764a4f5c.herokuapp.com/api/departments"
      );
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDepartments().then(() => setRefreshing(false));
  }, []);

  const renderDepartmentItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.departmentCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <TouchableOpacity
          style={styles.departmentContent}
          onPress={() =>
            navigation.navigate("AddTicket", { departmentId: item._id })
          }
        >
          <Ionicons name="business-outline" size={32} color="#4E94DE" />
          <View style={styles.departmentInfo}>
            <Text style={styles.departmentName}>{item.departmentName}</Text>
            <Text style={styles.departmentHours}>{item.operatingHours}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#4E94DE" />
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: headerHeight } } }],
    { useNativeDriver: false }
  );

  const headerHeightInterpolate = headerHeight.interpolate({
    inputRange: [0, height * 0.2],
    outputRange: [height * 0.3, height * 0.1],
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
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Welcome, {user.firstName}!</Text>
        </Animated.View>
      </Animated.View>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Available Departments</Text>
        {departments.map((item, index) =>
          renderDepartmentItem({ item, index })
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate("TicketHistory")}
          style={styles.button}
        >
          <LinearGradient
            colors={["#4E94DE", "#3A7CC0"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>View Appointment History</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={styles.button}>
          <LinearGradient
            colors={["#FF9A8B", "#FF6A88"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.ScrollView>
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
  logo: {
    width: width * 0.2,
    height: width * 0.2,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollViewContent: {
    paddingTop: height * 0.3,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4E94DE",
    marginBottom: 20,
    marginTop: 10,
  },
  departmentCard: {
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
  departmentContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  departmentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  departmentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4E94DE",
  },
  departmentHours: {
    fontSize: 14,
    color: "#6C757D",
    marginTop: 5,
  },
  button: {
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 15,
  },
  gradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DashboardScreen;
