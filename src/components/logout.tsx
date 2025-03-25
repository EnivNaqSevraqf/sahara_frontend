"use client";

import React from 'react';
import { Button, ButtonProps } from "@mui/material";
import Auth from "../app/login/auth"; // Import the auth utility
import { useRouter } from "next/navigation";

interface LogoutButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  children = "Logout", 
  variant = "contained", 
  color = "primary",  // Changed from error to primary
  ...props 
}) => {
  const router = useRouter();

  const handleLogout = () => {
    Auth.logOut();
  };

  return (
    <Button 
      onClick={handleLogout}
      variant={variant}
      color={color}
      sx={{
        boxShadow: 2,
        backgroundColor: "#000080", // Navy blue to match login button
        color: "white",
        fontWeight: 500,
        minWidth: '100px',
        '&:hover': {
          backgroundColor: "#000060", // Darker navy blue on hover
          boxShadow: 4,
        },
        '&:disabled': {
          backgroundColor: "#cccccc",
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default LogoutButton;