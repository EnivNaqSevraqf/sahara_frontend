'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  InputBase,
  IconButton,
  Button,
  MenuItem,
  Menu,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Send as SendIcon, AttachFile as AttachFileIcon, KeyboardArrowDown } from '@mui/icons-material';
import { currentConfig } from '@/config';

interface Channel {
  id: number;
  name: string;
  type: 'global' | 'team' | 'ta-team';
  team_id?: number;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  channel_id: number;
  created_at: string;
  message_type: 'text' | 'file';
  file_name?: string;
}

interface UserData {
  id: number;
  name: string;
  username: string;
  team_id?: number;
  team_name: string;
  is_ta: boolean;
  channels: Channel[];
  role: string;
}

const isSameDay = (date1: string, date2: string) => {
  const d1 = convertToIST(date1);
  const d2 = convertToIST(date2);
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
};

const formatMessageDate = (date: string) => {
  const messageDate = convertToIST(date);
  const today = convertToIST(new Date().toISOString());
  today.setDate(today.getDate() - 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today.toISOString())) {
    return 'Today';
  } else if (isSameDay(date, yesterday.toISOString())) {
    return 'Yesterday';
  }
  return messageDate.toLocaleDateString('en-IN');
};

const convertToIST = (date: string) => {
  const utcDate = new Date(date);
  const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
  return istDate;
};

export default function DiscussionPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentChannelRef = useRef<number | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const connectToChannel = async () => {
      if (!selectedChannel || !userData) return;

      // Clean up existing connection first
      if (wsRef.current) {
        console.log('Closing existing WebSocket connection');
        wsRef.current.onclose = null; // Remove reconnection logic
        wsRef.current.close();
        wsRef.current = null;
      }

      // Clear any pending reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Reset connection states
      setWsConnected(false);
      setIsConnecting(false);
      
      // Update current channel reference and messages
      currentChannelRef.current = selectedChannel.id;
      setMessages([]); // Clear messages when changing channels

      // Fetch messages for the new channel
      await fetchMessages();
      
      // Setup new WebSocket connection
      console.log('Initiating new WebSocket connection for channel:', selectedChannel.id);
      setupWebSocket();
    };

    connectToChannel();

    return () => {
      // Cleanup function
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnecting(false);
      setWsConnected(false);
    };
  }, [selectedChannel?.id, userData]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {}
      const response = await axios.post(`${currentConfig.apiBaseUrl}/discussions/`, 
        payload,
        { headers: {
          'Authorization' : `Bearer ${token}`,
          'accept': 'application/json'
          }
        });
      const data = response.data;
      console.log('Received user data:', data); // Debug log
      setUserData(data);
      if (data.channels && data.channels.length > 0) {
        console.log('Setting initial channel:', data.channels[0]); // Debug log
        setSelectedChannel(data.channels[0]);
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to fetch user data. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChannel) return;
    try {
      setMessagesLoading(true);
      const token = localStorage.getItem('token');
      const payload = {}
      const response = await axios.get(`${currentConfig.apiBaseUrl}/discussions/channels/${selectedChannel.id}/messages`,
        { headers: {
          'Authorization' : `Bearer ${token}`,
          'accept': 'application/json'
          }
        });
      const data = response.data;
      console.log('Received messages:', data); // Debug log
      setMessages(data);
      scrollToBottom();
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to fetch messages. Please try again.',
        severity: 'error'
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const setupWebSocket = () => {
    if (!selectedChannel || !userData) {
      console.log('Missing channel or user data');
      return;
    }

    if (isConnecting) {
      console.log('Connection already in progress');
      return;
    }

    setIsConnecting(true);
    setWsConnected(false); // Ensure we reset connected state before new connection

    try {
      console.log(`Connecting WebSocket to channel ${selectedChannel.id}`);
      const ws = new WebSocket(`${currentConfig.wsBaseUrl}/discussions/ws/${selectedChannel.id}/${localStorage.getItem('token')}`);
      
      ws.onopen = () => {
        // Verify this is still the current channel
        if (currentChannelRef.current !== selectedChannel.id) {
          console.log('Channel changed during connection, closing socket');
          ws.close();
          return;
        }

        console.log(`WebSocket Connected to channel ${selectedChannel.id}`);
        setIsConnecting(false);
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        // Only process messages if this is still the current channel
        if (currentChannelRef.current === selectedChannel.id) {
          try {
            const message = JSON.parse(event.data);
            setMessages(prev => [...prev, message]);
            scrollToBottom();
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for channel ${selectedChannel.id}:`, error);
        setIsConnecting(false);
        setWsConnected(false);
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected from channel ${selectedChannel.id}:`, event.code, event.reason);
        setIsConnecting(false);
        setWsConnected(false);
        
        // Always attempt to reconnect if this is still the current channel
        if (currentChannelRef.current === selectedChannel.id) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!wsConnected) {
              setupWebSocket();
            }
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setIsConnecting(false);
      setWsConnected(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !userData) return;
  
    try {
      const token = localStorage.getItem('token');
      const payload = {
        content: newMessage,
        channel_id: selectedChannel.id,
        sender_id: userData.id,
        message_type: 'text'
      }
      await axios.post(`${currentConfig.apiBaseUrl}/discussions/messages`,
         payload,
         { headers: {
          'Authorization' : `Bearer ${token}`,
          'accept': 'application/json'
          },
        }
      );
      
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to send message. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChannel || !userData) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result?.toString().split(',')[1];
      
      try {
        const token = localStorage.getItem('token');
        const payload = {
          content: file.name,
          channel_id: selectedChannel.id,
          sender_id: userData.id,
          message_type: 'file',
          file_data: base64Data,
          file_name: file.name
        }
        await axios.post(`${currentConfig.apiBaseUrl}/discussions/messages`,
          payload,
          { headers: {
            'Authorization' : `Bearer ${token}`,
            'accept': 'application/json'
            },
        }
      );
      
      } catch (error: any) {
        console.error('Error uploading file:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.detail || 'Failed to upload file. Please try again.',
          severity: 'error'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileDownload = async (fileName: string) => {
    if (!userData) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${currentConfig.apiBaseUrl}/discussions/download/${fileName}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        }
      );

      // Convert base64 to blob
      const binaryData = atob(response.data.file_data);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([bytes]);

      // Create download link
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = response.data.original_filename || fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to download file. Please try again.',
        severity: 'error'
      });
    }
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      // Use smooth scrolling for better user experience
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        py: 2,
        position: 'relative', // Add relative positioning
      }}
    >
      <Box 
        sx={{ 
          position: 'sticky',  // Make header sticky
          top: 0,
          zIndex: 1,
          bgcolor: 'background.default',
          pb: 2
        }}
      >
        <Button
          endIcon={<KeyboardArrowDown />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          variant="contained"
          sx={{ textTransform: 'none' }}
        >
          {selectedChannel?.name || 'Select Channel'}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {userData?.channels && userData.channels.map((channel) => (
            <MenuItem
              key={channel.id}
              onClick={() => {
                setAnchorEl(null);
                if (channel.id !== selectedChannel?.id) {
                  setWsConnected(false);
                  setIsConnecting(false);
                  currentChannelRef.current = channel.id;
                  setSelectedChannel(channel);
                }
              }}
            >
              {channel.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0, // Important for proper scrolling
          position: 'relative'
        }}
      >
        <Paper
          ref={messageContainerRef}
          elevation={3}
          sx={{
            flex: 1,
            mb: 2,
            p: 2,
            overflow: 'auto',
            bgcolor: 'background.paper',
            position: 'relative',
            minHeight: '200px',
          }}
        >
          {messagesLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'background.paper',
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          ) : messages && messages.length > 0 ? (
            <>
              {messages.map((message, index) => {
                const showDateDivider = index === 0 || !isSameDay(messages[index - 1].created_at, message.created_at);
                const isOwnMessage = message.sender_id === userData?.id;
                
                return (
                  <Box key={message.id}>
                    {showDateDivider && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          my: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            backgroundColor: (theme) => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.05)',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            color: 'text.secondary',
                          }}
                        >
                          {formatMessageDate(message.created_at)}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mb: 2,
                        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: isOwnMessage ? 'primary.main' : 'secondary.main',
                          mr: 1,
                          ml: 1,
                        }}
                      >
                        {message.sender_name[0].toUpperCase()}
                      </Avatar>
                      <Paper
                        sx={{
                          p: 1.5, // Reduced padding to make it shorter
                          maxWidth: '85%', // Increased from 70% to make it wider
                          minWidth: '200px', // Added minimum width
                          bgcolor: (theme) => isOwnMessage 
                            ? theme.palette.mode === 'dark'
                              ? 'primary.dark'
                              : 'primary.main'
                            : theme.palette.mode === 'dark'
                              ? '#1f2e6a'
                              : '#1f2e6a',
                          color: '#ffffff',
                          boxShadow: (theme) => theme.palette.mode === 'dark'
                            ? '0 2px 4px rgba(0,0,0,0.2)'
                            : '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', opacity: 0.9, mb: 0.5 }}>
                          {message.sender_name}
                        </Typography>
                        {message.message_type === 'text' ? (
                          <Typography sx={{ opacity: 0.95, lineHeight: 1.4 }}>{message.content}</Typography> // Added lineHeight to make text more compact
                        ) : (
                          <Button
                            variant="text"
                            onClick={() => handleFileDownload(message.file_name || '')}
                            sx={{ 
                              color: '#ffffff',
                              opacity: 0.9,
                              '&:hover': {
                                opacity: 1,
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            📎 {message.file_name}
                          </Button>
                        )}
                        <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
                          {convertToIST(message.created_at).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                );
              })}
            </>
          ) : (
            <Typography align="center" color="text.secondary">
              No messages in this channel
            </Typography>
          )}
        </Paper>

        <Paper
          component="form"
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            bgcolor: 'background.paper',
            position: 'sticky',
            bottom: 0,
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <IconButton
            color="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <AttachFileIcon />
          </IconButton>
          <IconButton
            color="primary"
            sx={{ p: '10px' }}
            onClick={handleSendMessage}
          >
            <SendIcon />
          </IconButton>
        </Paper>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}