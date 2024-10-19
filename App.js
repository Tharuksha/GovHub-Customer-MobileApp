import "react-native-gesture-handler";
import React, { useContext } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import theme from "./src/utils/theme";

// Import your screen components
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import AddTicketScreen from "./src/screens/AddTicketScreen";
import EditTicketScreen from "./src/screens/EditTicketScreen";
import TicketHistoryScreen from "./src/screens/TicketHistoryScreen";
import ViewAppointmentScreen from "./src/screens/ViewAppointmentScreen";

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    }}
  >
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
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    }}
  >
    <Stack.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AddTicket"
      component={AddTicketScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EditTicket"
      component={EditTicketScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TicketHistory"
      component={TicketHistoryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ViewAppointment"
      component={ViewAppointmentScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const Navigation = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // You can add a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={theme.colors.primary}
          />
          <Navigation />
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
