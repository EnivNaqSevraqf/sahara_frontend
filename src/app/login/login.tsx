"use client";

import { useState , useEffect } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import Auth from "./auth";
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ForgotPassword from "./ForgotPassword";
import { TextField, Button, Typography, Box, Link, FormControl, InputLabel, MenuItem, Select, CircularProgress, InputAdornment } from "@mui/material";
import axios from 'axios';
import { currentConfig } from '@/config';

interface Credentials {
  username: string;
  password: string;
  grant_type: string;
}

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
      router.push("/dashboard");
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

      const response = await axios.post(`${currentConfig.apiBaseUrl}/login`, formData, {
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
      router.push("/dashboard");

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
        background: "linear-gradient(to bottom right, #1e40af, #312e81, #581c87)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background elements similar to landing page */}
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div 
        className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
        style={{
          transform: `translate(${Math.random() * 20}px, ${Math.random() * 20}px)`,
        }}
      ></div>
      <div 
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
        style={{
          transform: `translate(${Math.random() * -20}px, ${Math.random() * -20}px)`,
        }}
      ></div>
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
        style={{
          transform: `translate(${Math.random() * 10}px, ${Math.random() * 10}px)`,
        }}
      ></div>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "500px",
          padding: "40px",
          borderRadius: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ 
            filter: 'brightness(0) invert(1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)',
              filter: 'brightness(0) invert(1)',
            }
          }}>
            <Image 
              src="/sahara_logo.svg" 
              alt="SAHARA" 
              width={300} 
              height={100} 
              priority
            />
          </Box>
        </Box>
  
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Box 
            sx={{ 
              width: '50px', 
              height: '56px', 
              background: "linear-gradient(to bottom right, #3b82f6, #6366f1)",
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderTopLeftRadius: '8px',
              borderBottomLeftRadius: '8px',
              color: "white"
            }}
          >
            <AccountCircleOutlinedIcon sx={{ fontSize: 24 }} />
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
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                },
              },
              '& .MuiInputBase-input': {
                color: '#1e293b', 
              }
            }}
          />
        </Box>
  
        <Box sx={{ display: 'flex', mb: 3 }}>
          <Box 
            sx={{ 
              width: '50px', 
              height: '56px', 
              background: "linear-gradient(to bottom right, #3b82f6, #6366f1)",
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderTopLeftRadius: '8px',
              borderBottomLeftRadius: '8px',
              color: "white"
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 24 }} />
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
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                },
              },
              '& .MuiInputBase-input': {
                color: '#1e293b', 
              }
            }}
          />
        </Box>
  
        {error && (
          <Box sx={{ 
            color: "#ef4444", 
            mb: 2, 
            p: 1, 
            borderRadius: "4px", 
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
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
            mb: 3,
            background: "linear-gradient(to right, #3b82f6, #6366f1)",
            color: "white",
            borderRadius: "8px",
            padding: "12px 0",
            fontWeight: 600,
            '&:hover': {
              background: "linear-gradient(to right, #2563eb, #4f46e5)",
            },
            '&:disabled': {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>
        <Box sx={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          mb: 2,
          mt: 2
        }}>
          <Button
            variant="text"
            onClick={() => setForgotPasswordOpen(true)}
            sx={{
              color: '#93c5fd',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(147, 197, 253, 0.1)',
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