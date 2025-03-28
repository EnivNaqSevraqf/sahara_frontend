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
  color = "primary",
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
        backgroundColor: "#033076",
        color: "white",
        fontWeight: 500,
        '&:hover': {
          backgroundColor: "#000060",
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