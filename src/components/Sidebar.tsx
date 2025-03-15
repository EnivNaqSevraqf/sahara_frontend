'use client';
import * as React from 'react';
// import { styled } from '@mui/material/styles';
// import styled from '@emotion/styled';
import styled from '@mui/styled-engine';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// import SelectContent from './SelectContent';
import MenuContent from './MenuContent';
import Image from 'next/image';
import { Button } from '@mui/material';
// import CardAlert from './CardAlert';
// import OptionsMenu from './OptionsMenu';

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

export default function SideMenu() {
    const [open, setOpen] = React.useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
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
                    alt="Picture of the author"
                    width={drawerWidth}
                    height={drawerWidth}
                    style={{ margin: 'auto' }}
                    />
              {/* <Box
                  component="img"
                  sx = {{
                    width: '100%',
                    margin: 'auto',
                  }}
                //   sx={{
                //       height: 233,
                //       width: 350,
                //     //   maxHeight: { xs: 233, md: 167 },
                //     //   maxWidth: { xs: 350, md: 250 },
                //   }}
                //   alt="The house from the offer."
                src = "logo_blue_no_bg.svg"
              />  */}
        {/* <SelectContent /> */}
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
        {/* <CardAlert /> */}
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
          alt="Riley Carter"
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
            Riley Carter
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            riley@email.com
          </Typography>
        </Box>
        <Button variant="contained" size="small" onClick={toggleDrawer}>
          Toggle Menu
        </Button>
        {/* <OptionsMenu /> */}
      </Stack>
    </Drawer>
  );
}