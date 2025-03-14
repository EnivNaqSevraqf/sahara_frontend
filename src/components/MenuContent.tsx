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
const mainListItems = [
    { text: 'Home', icon: <HomeRoundedIcon /> },
    { text: 'Analytics', icon: <AnalyticsRoundedIcon /> },
    { text: 'Clients', icon: <PeopleRoundedIcon /> },
    { text: 'Tasks', icon: <AssignmentRoundedIcon /> },
  ];
  
  const adminListItems = [
    { text: 'Dashboard', icon: <ViewQuilt /> },
    { text: 'Gradeables', icon: <ViewQuilt />},
    { text: 'Courses', icon: <ViewQuilt />},
    { text: 'Users', icon: <ViewQuilt />},
    { text: 'Settings', icon: <ViewQuilt />},
  ];
  
  const secondaryListItems = [
    { text: 'Settings', icon: <SettingsRoundedIcon /> },
    { text: 'About', icon: <InfoRoundedIcon /> },
    { text: 'Feedback', icon: <HelpRoundedIcon /> },
  ];



  type ListItem = {
    text: string;
    icon: React.ReactElement;
  };
  type MenuContentProps = {
    _mainListItems: ListItem[];
    _secondaryListItems: ListItem[];
  };
  
//   export default function MenuContent() {
  export default function MenuContent({ _mainListItems, _secondaryListItems }: MenuContentProps) {
    return (
      <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
        <List dense>
          {adminListItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={NextLink} href="/login" selected={index === 0}>
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
  