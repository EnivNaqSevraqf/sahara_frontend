"use client";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#033076',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
        },
        // Style for contained buttons (variant="contained")
        contained: {
          backgroundColor: '#033076',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#022060',
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(3, 48, 118, 0.12)',
            color: 'rgba(255, 255, 255, 0.7)',
          },
        },
        // Style for outlined buttons (variant="outlined")
        outlined: {
          color: '#033076',
          borderColor: '#033076',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(3, 48, 118, 0.04)',
            borderColor: '#033076',
          },
        },
        // Style for text buttons (variant="text")
        text: {
          color: '#033076',
          '&:hover': {
            backgroundColor: 'rgba(3, 48, 118, 0.04)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#033076',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#033076',
          color: '#FFFFFF',
        },
      },
    },
    // Preserve other component styles...
  },
});

export function MyThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
