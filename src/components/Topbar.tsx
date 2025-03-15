'use client';
import { Stack, Typography } from "@mui/material";
import MuiToolbar from "@mui/material/Toolbar";
import styled from "@mui/material/styles/styled";
import { tabsClasses } from "@mui/material/Tabs";
import AppBar from "@mui/material/AppBar";
import * as React from "react";

const Toolbar = styled(MuiToolbar)({
    width: '100%',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    justifyContent: 'center',
    gap: '12px',
    flexShrink: 0,
    [`& ${tabsClasses.flexContainer}`]: {
      gap: '8px',
      p: '8px',
      pb: 0,
    },
  });

export default function TopBar(){
    return (
        <AppBar
        position="fixed"
        sx={{
          display: { xs: 'auto', md: 'none' },
          boxShadow: 0,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
          top: 'var(--template-frame-height, 0px)',
        }}
      >
        <Toolbar variant="regular">
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              flexGrow: 1,
              width: '100%',
              gap: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'center', mr: 'auto' }}
            >
              {/* <CustomIcon /> */}
              <Typography variant="h1" component="h1" sx={{ color: 'text.primary'}} >
                Dashboard
              </Typography>
            </Stack>
            {/* <ColorModeIconDropdown /> */}
            {/* <MenuButton aria-label="menu" onClick={toggleDrawer(true)}>
              <MenuRoundedIcon />
            </MenuButton> */}
            {/* <SideMenuMobile open={open} toggleDrawer={toggleDrawer} /> */}
          </Stack>
        </Toolbar>
      </AppBar> 
    );    
}