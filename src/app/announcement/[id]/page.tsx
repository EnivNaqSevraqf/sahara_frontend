'use client';
import React, { useEffect, useState, use } from "react";
import { Box, Typography, Button, Paper, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface Announcement {
  id: number;
  title: string;
  description: {
    content: string;
    author: string;
    priority: string;
    created_at: string;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  }
}

export default function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/get_announcement/${resolvedParams.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setAnnouncement(data);
        } else {
          // If server is not available, use mock data
          const mockAnnouncement = {
            id: parseInt(resolvedParams.id),
            title: "Test Announcement",
            description: {
              content: "This is a detailed test announcement with full content that was not truncated in the list view. It contains more information and details about the announcement that users can read when they click the 'Read More' button.",
              author: "Test User",
              priority: "high",
              created_at: new Date().toISOString(),
              attachments: [
                {
                  name: "document.pdf",
                  url: "https://example.com/document.pdf",
                  type: "application/pdf"
                },
                {
                  name: "image.jpg",
                  url: "https://example.com/image.jpg",
                  type: "image/jpeg"
                },
                {
                  name: "spreadsheet.xlsx",
                  url: "https://example.com/spreadsheet.xlsx",
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
              ]
            }
          };
          setAnnouncement(mockAnnouncement);
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
        // If fetch fails, use mock data
        const mockAnnouncement = {
          id: parseInt(resolvedParams.id),
          title: "Test Announcement",
          description: {
            content: "This is a detailed test announcement with full content that was not truncated in the list view. It contains more information and details about the announcement that users can read when they click the 'Read More' button.",
            author: "Test User",
            priority: "high",
            created_at: new Date().toISOString(),
            attachments: [
              {
                name: "document.pdf",
                url: "https://example.com/document.pdf",
                type: "application/pdf"
              },
              {
                name: "image.jpg",
                url: "http://example.com/image.jpg",
                type: "image/jpeg"
              },
              {
                name: "favicon.ico",
                url: "../../favicon.ico",
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              },
              {
                name: "spreadsheet.xlsx",
                url: "http://example.com/spreadsheet.xlsx",
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              },
              {
                name: "spreadsheet.xlsx",
                url: "http://example.com/spreadsheet.xlsx",
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              },
              {
                name: "spreadsheet.xlsx",
                url: "http://example.com/spreadsheet.xlsx",
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              },
              {
                name: "spreadsheet.xlsx",
                url: "http://example.com/spreadsheet.xlsx",
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              }

            ]
          }
        };
        setAnnouncement(mockAnnouncement);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [resolvedParams.id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <Box display="flex">
        <Sidebar />
        <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex">
        <Sidebar />
        <Box flexGrow={1} p={3}>
          <Typography color="error">{error}</Typography>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/announcement')}
            sx={{ mt: 2 }}
          >
            Back to Announcements
          </Button>
        </Box>
      </Box>
    );
  }

  if (!announcement) {
    return (
      <Box display="flex">
        <Sidebar />
        <Box flexGrow={1} p={3}>
          <Typography>Announcement not found</Typography>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/announcement')}
            sx={{ mt: 2 }}
          >
            Back to Announcements
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/announcement')}
          sx={{ mb: 3 }}
        >
          Back to Announcements
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            {announcement.title}
          </Typography>

          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography 
              variant="body2" 
              color={getPriorityColor(announcement.description.priority)}
              sx={{ 
                px: 2, 
                py: 1, 
                borderRadius: 1, 
                bgcolor: `${getPriorityColor(announcement.description.priority)}.light`,
                color: `${getPriorityColor(announcement.description.priority)}.dark`
              }}
            >
              {announcement.description.priority.toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              By {announcement.description.author}
            </Typography>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Posted On"
              value={dayjs(announcement.description.created_at)}
              readOnly
              sx={{ mb: 3 }}
            />
          </LocalizationProvider>

          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
            {announcement.description.content}
          </Typography>

          {/* Attachments Section */}
          {announcement.description.attachments && announcement.description.attachments.length > 0 && (
            <Box sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Attachments
              </Typography>
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 1.5,
                  mt: 1
                }}
              >
                {announcement.description.attachments.map((attachment, index) => (
                  <Box 
                    key={index}
                    display="flex" 
                    alignItems="center" 
                    gap={1}
                    sx={{ 
                      p: 1.5,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'grey.200',
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => window.open(attachment.url, '_blank')}
                  >
                    <AttachFileIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography 
                      variant="body2" 
                      color="primary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {attachment.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
} 