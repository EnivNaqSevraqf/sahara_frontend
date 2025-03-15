import * as React from 'react';
import Stack from '@mui/material/Stack';
import { Breadcrumbs, Button, Typography } from '@mui/material';
// import CustomDatePicker from './CustomDatePicker';
// import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import MenuButton from './MenuButton';
// import ColorModeIconDropdown from '.././theme/ColorModeIconDropdown';
import NotificationsIcon from '@mui/icons-material/Notifications';
// import Search from './Search';

const NotificationsButton = () => {
  return (
    <Button>
      <NotificationsIcon />
    </Button>
  );
}

export default function Header() {
  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'flex', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        bgcolor: 'background.paper',
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        borderColor: 'divider',
        pt: 1.5,
        p: { xs: 1, md: 2 },
      }}
      spacing={2}
    >
        <Breadcrumbs sx = {{p: 1}}>
              <Typography variant="body1">Dashboard</Typography>
        </Breadcrumbs>
      {/* <NavbarBreadcrumbs /> */}
      <Stack direction="row" sx={{ gap: 1 }}>
        {/* <Search /> */}
        {/* <CustomDatePicker /> */}
        {/* <MenuButton showBadge aria-label="Open notifications"> */}
          {/* <NotificationsIcon /> */}
          {/* <NotificationsButton /> */}
        {/* </MenuButton> */}
        <MenuButton showBadge aria-label="Open notifications">
            <NotificationsIcon />
        </MenuButton>
        {/* <ColorModeIconDropdown /> */}
      </Stack>
    </Stack>
  );
}
