'use client';

import { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import { Send as SendIcon, AttachFile as AttachFileIcon, KeyboardArrowDown } from '@mui/icons-material';

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

export default function DiscussionPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages();
      setupWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedChannel]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/discussions', {
        method: 'POST',
      });
      const data = await response.json();
      setUserData(data);
      if (data.channels.length > 0) {
        setSelectedChannel(data.channels[0]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChannel) return;
    try {
      const response = await fetch(`/discussions/channels/${selectedChannel.id}/messages`);
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupWebSocket = () => {
    if (!selectedChannel || !userData) return;
    
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`ws://localhost:8000/discussions/ws/${selectedChannel.id}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    wsRef.current = ws;
  };
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !userData) return;
  
    try {
      const response = await fetch('/discussions/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          channel_id: selectedChannel.id,
          sender_id: userData.id,
          message_type: 'text',
        }),
      });
  
      // Check if response is ok and is json
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server response was not JSON');
      }
  
      const data = await response.json();
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally add user feedback here
      alert('Failed to send message. Please try again.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChannel || !userData) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result?.toString().split(',')[1];
      
      try {
        await fetch('/discussions/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: 'File Upload',
            channel_id: selectedChannel.id,
            sender_id: userData.id,
            message_type: 'file',
            file_data: base64Data,
            file_name: file.name,
          }),
        });
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
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
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
      {/* Rest of your JSX remains similar but updated with new types and data */}
    </Container>
  );
}