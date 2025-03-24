"use client";
import { useRouter } from "next/navigation";

const doLogIn = (username, token, role) => {
  if (!username || !token || !role) {
    throw new Error("Missing login parameters");
  }
  localStorage.setItem("username", username);
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("isLoggedIn", "true");
};

const isLoggedIn = () => {
  return Boolean(localStorage.getItem("isLoggedIn")) && Boolean(localStorage.getItem("token"));
};

const getToken = () => {
  return localStorage.getItem("token");
};

const getRole = () => {
  return localStorage.getItem("role");
};

const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch (e) {
    return false;
  }
};

//go to login page after logging out
const logOut = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("isLoggedIn");

  window.location.href = "/login";
};

export default {
  doLogIn,
  isLoggedIn,
  getToken,
  getRole,
  isTokenValid,
  logOut
};

