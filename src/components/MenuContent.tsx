'use client';
import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import NextLink from 'next/link';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ForumIcon from '@mui/icons-material/Forum';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import { text } from 'stream/consumers';
import { ViewQuilt } from '@mui/icons-material';
import { forwardRef, useEffect, useState } from 'react';
import Link from '@mui/material/Link';
import { getUserRole, normalizeRole, type UserRole } from '@/utils/roles';

  const adminListItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
    { text: 'Announcements', icon: <AnnouncementIcon />, href: '/announcements' },
    { text: 'Gradeables', icon: <AssignmentRoundedIcon />, href: '/gradeables' },
    { text: 'Form Management', icon: <ViewQuilt />, href: '/forms' },
    { text: 'People', icon: <PeopleIcon />, href: '/people' },
    { text: 'Discussions', icon: <ForumIcon />, href: '/discussions'},
    { text: 'Calendar', icon: <CalendarMonthIcon />, href: '/calendar'},

  ];
  
  const studentListItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
    { text: 'Announcements', icon: <AnnouncementIcon />, href: '/announcements' },
    { text: 'Project', icon: <SchoolIcon />, href: '/project' },
    { text: 'Quizzes', icon: <QuizIcon />, href: '/quizzes' },
    { text: 'Discussions', icon: <ForumIcon />, href: '/discussions'},
    { text: 'Calendar', icon: <CalendarMonthIcon />, href: '/calendar'},
    { text: 'Forms', icon: <ViewQuilt />, href: '/forms'},
  ];
  
  const taListItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
    { text: 'Gradeables', icon: <AssignmentRoundedIcon />, href: '/gradeables' },
    { text: 'Courses', icon: <SchoolIcon />, href: '/courses' },
    { text: 'Users', icon: <PeopleIcon />, href: '/users' },
    { text: 'Calendar', icon: <CalendarMonthIcon />, href: '/calendar'},
    { text: 'Settings', icon: <SettingsRoundedIcon />, href: '/settings'},
  ];
  
  const secondaryListItems = [
    { text: 'Settings', icon: <SettingsRoundedIcon />, href: '/settings' }, 
  ];

const constructItemsList = (role: string) => {
    const normalizedRole = normalizeRole(role as UserRole);
    
    if (normalizedRole === 'admin') {
        return adminListItems;
    } else if (normalizedRole === 'ta') {
        return taListItems;
    } else {
        return studentListItems;
    }
}

  type ListItem = {
    text: string;
    icon: React.ReactElement;
    href: string;
  };
  type MenuContentProps = {
    _mainListItems: ListItem[];
    _secondaryListItems: ListItem[];
  };
  
  export default function MenuContent({ _mainListItems, _secondaryListItems }: MenuContentProps) {
    const [role, setRole] = useState<string>('student');
    const [itemsList, setItemsList] = useState<ListItem[]>(studentListItems);
    
    // Use useEffect to handle localStorage access (client-side only)
    useEffect(() => {
      const userRole = getUserRole();
      setRole(userRole);
      setItemsList(constructItemsList(userRole));
    }, []);

    return (
      <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
        <List dense>
          {itemsList.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={NextLink} href={item.href} selected={index === 0}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <List dense>
          {secondaryListItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}> 
              <ListItemButton component={NextLink} href={item.href}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Stack>
    );
  }

  MenuContent.defaultProps = {
    _mainListItems: studentListItems,
    _secondaryListItems: secondaryListItems,
    };
