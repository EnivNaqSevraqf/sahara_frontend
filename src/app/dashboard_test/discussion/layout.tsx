'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f2e6a',
      light: '#4b5a96',
      dark: '#000d3f',
    },
    secondary: {
      main: '#5c6bc0',
      light: '#8e99f3',
      dark: '#26418f',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Create dark theme by extending the base theme
const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#4b5a96',
      light: '#7987c5',
      dark: '#1f2e6a',
    },
    secondary: {
      main: '#5c6bc0',
      light: '#8e99f3',
      dark: '#26418f',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

export default function DiscussionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // You can implement a theme toggle here if needed
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = prefersDarkMode ? darkTheme : theme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}