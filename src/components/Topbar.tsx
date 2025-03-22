'use client';
import { IconButton, Stack, Typography } from "@mui/material";
import MuiToolbar from "@mui/material/Toolbar";
import styled from "@mui/material/styles/styled";
import { tabsClasses } from "@mui/material/Tabs";
import AppBar from "@mui/material/AppBar";
import * as React from "react";
import { usePathname } from "next/navigation";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';

const Toolbar = styled(MuiToolbar)({
  width: '100%',
  padding: '12px',
  display: 'flex',
  flexDirection: 'row',  // Changed to row for better layout
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  flexShrink: 0,
  [`& ${tabsClasses.flexContainer}`]: {
    gap: '8px',
    p: '8px',
    pb: 0,
  },
});

// Helper function to generate page title from pathname
const getPageTitle = (pathname: string): string => {
  // Extract the last part of the path
  const parts = pathname.split('/').filter(Boolean);
  const lastSegment = parts[parts.length - 1] || 'dashboard';
  
  // Convert to title case and replace hyphens/underscores
  return lastSegment
    .replace(/-|_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

export default function TopBar() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: 'auto', md: 'flex' },
        boxShadow: 0,
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        top: 'var(--template-frame-height, 0px)',
        zIndex: 1100,
      }}
    >
      <Toolbar variant="regular">
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            flexGrow: 1,
            gap: 2,
          }}
        >
          <Typography variant="h6" component="h1" sx={{ color: 'text.primary' }}>
            {pageTitle}
          </Typography>
          <NavbarBreadcrumbs />
        </Stack>
          
        {/* Right side actions */}
        <Stack direction="row" spacing={1}>
          <IconButton size="large" color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}