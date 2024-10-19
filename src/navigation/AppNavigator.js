import React, { useContext } from "react";
import { View, TouchableOpacity } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";

// Import screens
//import LoginScreen from "../screens/LoginScreen";
//import RegisterScreen from "../screens/RegisterScreen";
//import DashboardScreen from "../screens/DashboardScreen";
import AddTicketScreen from "../screens/AddTicketScreen";
import EditTicketScreen from "../screens/EditTicketScreen";
import TicketHistoryScreen from "../screens/TicketHistoryScreen";
import ViewAppointmentScreen from "../screens/ViewAppointmentScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();

  const screenOptions = {
    headerBackground: () => (
      <LinearGradient
        colors={["#4E94DE", "#3A7CC0"]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    ),
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold",
    },
    headerLeft: (props) => (
      <TouchableOpacity onPress={props.onPress} style={{ marginLeft: 15 }}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    ),
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {user ? (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AddTicket"
            component={AddTicketScreen}
            options={{ title: "Schedule Appointment" }}
          />
          <Stack.Screen
            name="EditTicket"
            component={EditTicketScreen}
            options={{ title: "Edit Appointment" }}
          />
          <Stack.Screen
            name="TicketHistory"
            component={TicketHistoryScreen}
            options={{ title: "Appointment History" }}
          />
          <Stack.Screen
            name="ViewAppointment"
            component={ViewAppointmentScreen}
            options={{ title: "Appointment Details" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
