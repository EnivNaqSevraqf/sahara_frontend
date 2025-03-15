import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/Topbar";
import Box from '@mui/material/Box';
import Header from "@/components/Header";
import Divider from "@mui/material/Divider";
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Box sx={{ display: "flex" }}>
    <Sidebar />
    {/* <TopBar/> */}
    <Box sx={{ 
        display: "block",
        flexGrow: 1,
        width: "100%",
        overflow: "auto",

    }}>
    <Header/>
    <Divider/>
    <section>{children}</section> 
    </Box>
    </Box>
    </>
  );
}