'use client';

import EventCalendar from './components/EventCalendar';
import Sidebar from "@/components/Sidebar";
import { Box} from "@mui/material";

export default function CalendarPage() {
  return (
    
    <div className="w-full h-full">
      <Box display="flex">
      <Sidebar />
      <EventCalendar />
      </Box>
    </div>
  );
} 