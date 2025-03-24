'use client';
import React, { useState, useEffect, use } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import axios from 'axios';

interface ApiAttachment {
  url: string;
  type: string;
}

interface ContentDetails {
  date?: string;
  time?: string;
  venue?: string;
}

interface AnnouncementContent {
  tags: string[];
  details?: ContentDetails;
  attachments: ApiAttachment[];
  description: string;
}

interface Announcement {
  id: number;
  creator_id: number;
  created_at: string;
  title: string;
  content: AnnouncementContent;
  url_name?: string;
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
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/announcements/${resolvedParams.id}`);
        setAnnouncement(response.data);
      } catch (error) {
        console.error('Error fetching announcement:', error);
        // If server is not available, use mock data
        const mockAnnouncement = {
          id: parseInt(resolvedParams.id),
          creator_id: 1,
          created_at: new Date().toISOString(),
          title: "Test Announcement",
          content: {
            tags: ["general", "important"],
            details: {
              date: "2024-03-25",
              time: "14:00",
              venue: "Main Hall"
            },
            attachments: [
              {
                url: "https://example.com/document.pdf",
                type: "document"
              },
              {
                url: "https://example.com/image.jpg",
                type: "image"
              }
            ],
            description: "This is a detailed test announcement with full content that was not truncated in the list view. It contains more information and details about the announcement that users can read when they click the 'Read More' button."
          }
        };
        setAnnouncement(mockAnnouncement);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/announcement')}
          sx={{ mt: 2 }}
        >
          Back to Announcements
        </Button>
      </Box>
    );
  }

  if (!announcement) {
    return (
      <Box>
        <Typography>Announcement not found</Typography>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/announcement')}
          sx={{ mt: 2 }}
        >
          Back to Announcements
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/announcement')}
        sx={{ mb: 3 }}
      >
        Back to Announcements
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {announcement.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Posted by {announcement.creator_id}
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Posted On"
                value={dayjs(announcement.created_at)}
                readOnly
                sx={{ width: 200 }}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {announcement.content.tags.map((tag, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: 'primary.light',
                color: 'primary.dark'
              }}
            >
              {tag.toUpperCase()}
            </Typography>
          ))}
        </Box>

        {announcement.content.details && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Event Details
            </Typography>
            {announcement.content.details.date && (
              <Typography variant="body1">
                Date: {announcement.content.details.date}
              </Typography>
            )}
            {announcement.content.details.time && (
              <Typography variant="body1">
                Time: {announcement.content.details.time}
              </Typography>
            )}
            {announcement.content.details.venue && (
              <Typography variant="body1">
                Venue: {announcement.content.details.venue}
              </Typography>
            )}
          </Box>
        )}

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {announcement.content.description}
        </Typography>

        {/* Attachments Section */}
        {announcement.content.attachments.length > 0 && (
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
              {announcement.content.attachments.map((attachment, index) => (
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
                  <AttachFileIcon sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0 }} />
                  <Typography 
                    variant="body2" 
                    color="primary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flexGrow: 1
                    }}
                  >
                    {attachment.url.split('/').pop()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
} 