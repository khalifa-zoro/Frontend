/// <reference types="vite/client" />
import axios from "axios";
import { activateMockAPI } from "./mock-api";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────
// MOCK MODE TOGGLE
// Set VITE_MOCK_API=true in your .env.local file
// to bypass all real API calls during testing.
// Set to false (or remove) to use the real backend.
// ─────────────────────────────────────────────
const MOCK_MODE = import.meta.env.VITE_MOCK_API === "true";

if (MOCK_MODE) {
  activateMockAPI();
}

// Request interceptor - Add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - logout user
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-token");
      // Don't redirect during signup flow
      const isSignupRoute =
        window.location.pathname.includes("profile-completion");
      if (!isSignupRoute) {
        window.location.href = "/";
      }
    }

    let data = error.response?.data;
    let message =
      (typeof data === "string" ? data : undefined) ||
      data?.message ||
      data?.detail ||
      data?.error ||
      error.message ||
      "Something went wrong";
    if (Array.isArray(message)) {
      message = message.join("; ");
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data,
    });
  },
);
