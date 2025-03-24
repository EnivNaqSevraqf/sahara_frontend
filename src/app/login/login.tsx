"use client";

import { useState , useEffect } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import Auth from "./auth";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ForgotPassword from "./ForgotPassword";
import { TextField, Button, Typography, Box, Link, FormControl, InputLabel, MenuItem, Select, CircularProgress, InputAdornment } from "@mui/material";
import axios from 'axios';

interface Credentials {
  username: string;
  password: string;
  grant_type: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const LoginComponent = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
    grant_type: "password",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const router = useRouter();

  const checkExistingToken = () => {
    const existingToken = localStorage.getItem('token');
    // If token exists, redirect to dashboard
    if (existingToken && Auth.isTokenValid()) {
      console.log("Token exists, redirecting to dashboard");
      router.push("/dashboard_test");
      return true;
    }  
    console.log("No token found");
    return false;
  };

  // Check for existing token on component mount
  useEffect(() => {
    checkExistingToken();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // Create form data with all required fields
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      formData.append('grant_type', 'password'); // Required by OAuth2 password flow

      const response = await axios.post(`${API_BASE_URL}/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 10000,
        validateStatus: (status) => status < 500 // Treat 500 errors differently
      });

      if (response.status === 401) {
        setError("Invalid username or password");
        return;
      }

      if (!response.data?.access_token) {
        throw new Error('Invalid response format - missing access token');
      }

      // Store auth data and redirect
      Auth.doLogIn(credentials.username, response.data.access_token, response.data.role);
      router.push("/dashboard_test");

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
          setError("The server encountered an error. Please try again later.");
          console.error("Server error details:", error.response.data);
        } else if (error.code === 'ECONNABORTED') {
          setError("Request timed out. Please check your connection and try again.");
        } else if (!error.response) {
          setError("Unable to reach the server. Please check your connection.");
        } else {
          setError(error.response?.data?.detail || "Login failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
        console.error("Non-axios error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError("Please fill in all fields");
      return;
    }
    handleLogin();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "600px",
          padding: "40px",
          borderRadius: "30px",
          backgroundColor: "white",
          border: "2px solid #000080",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Image 
            src="/sahara_logo.svg" 
            alt="SAHARA" 
            width={300} 
            height={100} 
            priority
          />
        </Box>
  
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Box 
            sx={{ 
              width: '50px', 
              height: '56px', 
              backgroundColor: '#E8E8E8', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderTopLeftRadius: '4px',
              borderBottomLeftRadius: '4px'
            }}
          >
            <span style={{ fontSize: '20px' }}>📧</span>
          </Box>
          <TextField
          fullWidth
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderTopLeftRadius: '0px',
              borderBottomLeftRadius: '0px',
            },
            '& .MuiInputBase-input': {
              color: '#000', 
    }
  }}
/>

        </Box>
  
        <Box sx={{ display: 'flex', mb: 3 }}>
          <Box 
            sx={{ 
              width: '50px', 
              height: '56px', 
              backgroundColor: '#E8E8E8', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderTopLeftRadius: '4px',
              borderBottomLeftRadius: '4px'
            }}
          >
            <span style={{ fontSize: '20px' }}>🔒</span>
          </Box>
          <TextField
            fullWidth
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderTopLeftRadius: '0px',
                borderBottomLeftRadius: '0px',
              },
              '& .MuiInputBase-input': {
                color: '#000', 
              }
            }}
          />

        </Box>
  
        {error && (
          <Box sx={{ color: "red", mb: 2 }}>
            {error}
          </Box>
        )}
        <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading || !credentials.username || !credentials.password}
        sx={{
          mt: 2,
          backgroundColor: "#000080",
          color: "white",
          borderRadius: "4px",
          padding: "12px 0",
          '&:hover': {
            backgroundColor: "#000060",
          },
          '&:disabled': {
            backgroundColor: "#cccccc",
          }
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
      </Button>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setForgotPasswordOpen(true)} // Proper state update
          sx={{
            color: '#000080',
            borderColor: '#E0E0E0',
            borderRadius: '4px',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#000080',
            }
          }}
        >
         Forgot password?
</Button>
        </Box>
        </Box>
        <ForgotPassword open={forgotPasswordOpen} handleClose={() => setForgotPasswordOpen(false)} />
      
    </Box>
  );
}
export default LoginComponent;