import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const userData = await SecureStore.getItemAsync("user");
      const token = await SecureStore.getItemAsync("token");
      if (userData && token) {
        setUser(JSON.parse(userData));
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error checking user session:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "https://govhub-backend-6375764a4f5c.herokuapp.com/api/customers/login",
        { email, password }
      );
      const { token } = response.data;
      const customerResponse = await axios.get(
        `https://govhub-backend-6375764a4f5c.herokuapp.com/api/customers/email/${email}`
      );
      const userData = customerResponse.data;

      await SecureStore.setItemAsync("user", JSON.stringify(userData));
      await SecureStore.setItemAsync("token", token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("user");
      await SecureStore.deleteItemAsync("token");
      setUser(null);
      delete axios.defaults.headers.common["Authorization"];
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(
        "https://govhub-backend-6375764a4f5c.herokuapp.com/api/customers",
        userData
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
