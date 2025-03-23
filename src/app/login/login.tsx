"use client";

import { useState } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import Auth from "./auth";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ForgotPassword from "./ForgotPassword";
import { TextField, Button, Typography, Box, Link, FormControl, InputLabel, MenuItem, Select, CircularProgress, InputAdornment } from "@mui/material";

interface Credentials {
  username: string;
  password: string;
}

const LoginComponent = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        //backend returns access token and role
        Auth.doLogIn(credentials.username, data.access_token, data.role);
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Invalid credentials");
      }
    } catch (error) {
      setError("An error occurred during login");
      console.error(error);
    }

    setLoading(false);
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
          width: "450px",
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
            layout="intrinsic"
            width={300} 
            height={100} 
            
            //priority
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
          placeholder="Email"
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
        disabled={loading}
        sx={{
          mt: 2,
          backgroundColor: "#000080",
          color: "white",
          borderRadius: "4px",
          padding: "10px 0",
          '&:hover': {
            backgroundColor: "#000060",
          }
        }}
      >
        {loading ? <CircularProgress size={24} /> : "Login"}
      </Button>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setForgotPasswordOpen(true)} // ✅ Proper state update
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
        <ForgotPassword open={forgotPasswordOpen} handleClose={() => setForgotPasswordOpen(false)} />
      </Box>
    </Box>
  );
}
export default LoginComponent;  