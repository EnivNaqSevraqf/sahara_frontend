'use client';
import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import NextLink from 'next/link';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import { text } from 'stream/consumers';
import { ViewQuilt } from '@mui/icons-material';
import { forwardRef } from 'react';
import Link from '@mui/material/Link';
// const LinkBehaviour = forwardRef(function LinkBehaviour(props, ref) {
//     return <NextLink ref={ref} {...props} />;
// });


// TODO: Decode token to get user role
const decodeToken = (token: string | null) => {
    if( token === null) {
        return 'student';
    }
    return token; 
}

const mainListItems = [
    { text: 'Home', icon: <HomeRoundedIcon /> },
    { text: 'Analytics', icon: <AnalyticsRoundedIcon /> },
    { text: 'Clients', icon: <PeopleRoundedIcon /> },
    { text: 'Tasks', icon: <AssignmentRoundedIcon /> },
  ];
  
  const adminListItems = [
    { text: 'Dashboard', icon: <ViewQuilt />, href: '/dashboard' },
    { text: 'Announcements', icon: <ViewQuilt />, href: '/announcements' },
    { text: 'Gradeables', icon: <ViewQuilt />, href: '/gradeables' },
    { text: 'Form Management', icon: <ViewQuilt />, href: '/forms' },
    { text: 'People', icon: <ViewQuilt />, href: '/people' },
    { text: 'Discussions', icon: <ViewQuilt />, href: '/discussions'},
    { text: 'Calendar', icon: <ViewQuilt />, href: '/calendar'},

  ];
  const studentListItems = [
    { text: 'Dashboard', icon: <ViewQuilt />, href: '/dashboard' },
    { text: 'Announcements', icon: <ViewQuilt />, href: '/gradeables' },
    { text: 'Project', icon: <ViewQuilt />, href: '/project' },
    { text: 'Quizzes', icon: <ViewQuilt />, href: '/quizzes' }, // TODO: Should quizzes be seperate?
    { text: 'Discussions', icon: <ViewQuilt />, href: '/discussions'}, // TODO: Should this be discussions?
    { text: 'Calendar', icon: <ViewQuilt />, href: '/calendar'},
    { text: 'Forms', icon: <ViewQuilt />, href: '/forms'}, // TODO: Should this be forms?
  ];
  const taListItems = [
    { text: 'Dashboard', icon: <ViewQuilt />, href: '/dashboard' },
    { text: 'Gradeables', icon: <ViewQuilt />, href: '/gradeables' },
    { text: 'Courses', icon: <ViewQuilt />, href: '/courses' },
    { text: 'Users', icon: <ViewQuilt />, href: '/users' },
    { text: 'Settings', icon: <ViewQuilt />, href: '/settings'},
  ];
  
  const secondaryListItems = [
    { text: 'Settings', icon: <SettingsRoundedIcon />, href: '/settings' }, 
  ];

const constructItemsList = (role: string) => {
    if (role === 'admin') {
        return adminListItems;
    } else if (role === 'student') {
        return studentListItems;
    }
    else if (role === 'ta') {
        return taListItems;
    }
    else{
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
    // const token = localStorage.getItem('token');
    // TODO: Fix the above
    const token = "admin";
    const role = decodeToken(token);
    const itemsList = constructItemsList(role);
    console.log("The role I had is role:" + role);
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
              <ListItemButton component={NextLink} href="/">
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
    _mainListItems: mainListItems,
    _secondaryListItems: secondaryListItems,
    };
  