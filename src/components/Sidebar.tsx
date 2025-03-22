'use client';
import * as React from 'react';
import styled from '@mui/styled-engine';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import Image from 'next/image';
import { Button, ButtonGroup, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { getUserRole, normalizeRole, setUserRole, type UserRole } from '@/utils/roles';
import { useEffect, useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

// Role icon mapping for visual feedback
const getRoleIcon = (role: string) => {
  const normalizedRole = normalizeRole(role as UserRole);
  
  switch(normalizedRole) {
    case 'admin':
      return <AdminPanelSettingsIcon fontSize="small" />;
    case 'ta':
      return <SchoolIcon fontSize="small" />;
    default:
      return <PersonIcon fontSize="small" />;
  }
};

// Role display name mapping
const getRoleDisplayName = (role: string) => {
  const normalizedRole = normalizeRole(role as UserRole);
  
  switch(normalizedRole) {
    case 'admin':
      return 'Administrator';
    case 'ta':
      return 'Teaching Assistant';
    default:
      return 'Student';
  }
};

export default function SideMenu() {
    const [open, setOpen] = React.useState(true);
    const [userRole, setUserRole] = useState<string>('student');
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    // Get user role on component mount
    useEffect(() => {
      setUserRole(getUserRole());
    }, []);

    const handleRoleChange = (role: UserRole) => {
      setUserRole(role);
      setUserRole(role);
      setAnchorEl(null);
      window.location.reload(); // Refresh to update sidebar with new role
    };

    const toggleDrawer = () => {
        setOpen(!open);
    };
    
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
      setAnchorEl(null);
    };

    return (
      <Drawer
        variant="persistent"
        sx={{
          display: { xs: 'none', md: 'flex' },
          [`& .${drawerClasses.paper}`]: {
            backgroundColor: 'background.paper',
          },
        }}
        anchor='left'
        open={true}
      >
        <Box
          sx={{
            display: 'flex',
            mt: 'calc(var(--template-frame-height, 0px) + 4px)',
            p: 1.5,
            alignContent: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src="/logo_blue_no_bg.svg"
            alt="Sahara Logo"
            width={drawerWidth}
            height={drawerWidth}
            style={{ margin: 'auto' }}
          />
        </Box>
        <Divider />
        <Box
          sx={{
            overflow: 'auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <MenuContent />
        </Box>
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
            alignItems: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Avatar
            sizes="small"
            alt="User Profile"
            src="/static/images/avatar/7.jpg"
            sx={{ width: 36, height: 36 }}
          />
          <Box sx={{ mr: 'auto' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
              Riley Carter
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Current Role">
                {getRoleIcon(userRole)}
              </Tooltip>
              <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                {getRoleDisplayName(userRole)}
              </Typography>
            </Box>
          </Box>
          
          {/* Role switcher for testing purposes */}
          <Tooltip title="Change role (for testing)">
            <IconButton
              onClick={handleClick}
              size="small"
              aria-controls={menuOpen ? 'role-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? 'true' : undefined}
            >
              <ArrowDropDownIcon />
            </IconButton>
          </Tooltip>
          <Menu
            id="role-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'role-button',
            }}
          >
            <MenuItem onClick={() => handleRoleChange('student')}>
              <PersonIcon fontSize="small" sx={{ mr: 1 }} />
              Student
            </MenuItem>
            <MenuItem onClick={() => handleRoleChange('ta')}>
              <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
              TA
            </MenuItem>
            <MenuItem onClick={() => handleRoleChange('admin')}>
              <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1 }} />
              Admin
            </MenuItem>
          </Menu>
        </Stack>
      </Drawer>
    );
}