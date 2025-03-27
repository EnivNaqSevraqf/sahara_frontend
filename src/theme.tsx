
"use client";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
      // Adjust these to match your brand colors
      primary: {
        main: '#19244C', // Navy color for sidebar background, etc.
      },
      background: {
        default: '#F5F5F5', // Overall page background
        paper: '#FFFFFF',   // Card/paper background
      },
      text: {
        primary: '#000000',
        secondary: '#FFFFFF',
      },
    },
    components: {
      MuiTypography: {
        defaultProps: {
          component: "div", // or "span" based on your need
        },
      },
        MuiButton: {
            styleOverrides: {
            root: {
                // Example: make all buttons navy with white text
                backgroundColor: '#19244C',
                color: '#FFFFFF',
                '&:hover': {
                backgroundColor: '#0F1A3E', // Darker navy on hover
                },
            },
            },
        },
      MuiAppBar: {
        styleOverrides: {
          root: {
            // Example: make top bar white with navy text
            backgroundColor: '#FFFFFF',
            color: '#19244C',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            // Sidebar background color
            backgroundColor: '#19244C',
            // Make text white in the sidebar
            color: '#FFFFFF',
          },
        },
      },
      // You can override more components as needed
    },
  });



// const theme = createTheme({
//     palette: {
//         mode: "light",
//     },
//     components: {
//         MuiDrawer: {
//             styleOverrides: {
//                 paper: {
//                     backgroundColor: "red",
//                 },
//             },
//         }
//     }
//     });

export function MyThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
// export default theme;
