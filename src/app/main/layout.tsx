import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/Topbar";
import Box from '@mui/material/Box';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Box sx={{ display: "flex" }}>
    <Sidebar />
    <TopBar/>
    <section>{children}</section> 
    </Box>
    </>
  );
}