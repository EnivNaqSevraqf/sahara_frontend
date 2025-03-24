'use client';

import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  InputBase,
  IconButton,
  Button,
  List,
  ListItem,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { Send as SendIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';

interface Message {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
}

// Sample channels
const channels = [
  '#team8 + instructor',
  '#team1 + instructor',
  '#team2 + instructor',
  '#team3 + instructor',
  '#general',
  '#announcements'
];

// Sample messages data with proper chronological order (oldest to newest)
const sampleMessages: Message[] = [
  {
    id: '1',
    text: 'The application was crashing due to race conditions in the multi-threaded implementation.',
    user: {
      id: 'user1',
      name: 'User 1',
      avatar: '/avatar1.jpg',
    },
    timestamp: '2:00 PM',  // Oldest message
  },
  {
    id: '2',
    text: 'We need to rewrite the thread management logic.',
    user: {
      id: 'user2',
      name: 'User 2',
      avatar: '/avatar2.jpg',
    },
    timestamp: '2:15 PM',
  },
  {
    id: '3',
    text: 'I will resolve it using proper thread management and synchronization techniques.',
    user: {
      id: 'user3',
      name: 'User 3',
      avatar: '/avatar3.jpg',
    },
    timestamp: '2:30 PM',
  },
  {
    id: '4',
    text: 'I\'ve identified the root cause of the crashes.',
    user: {
      id: 'user3',
      name: 'User 3',
      avatar: '/avatar3.jpg',
    },
    timestamp: '2:35 PM',
  },
  {
    id: '5',
    text: 'The issue seems to be with concurrent access to shared resources.',
    user: {
      id: 'user1',
      name: 'User 1',
      avatar: '/avatar1.jpg',
    },
    timestamp: '2:40 PM',
  },
  {
    id: '6',
    text: 'I think we need to implement proper mutex locks.',
    user: {
      id: 'user2',
      name: 'User 2',
      avatar: '/avatar2.jpg',
    },
    timestamp: '2:45 PM',
  },
  {
    id: '7',
    text: 'Let me check the thread synchronization.',
    user: {
      id: 'user3',
      name: 'User 3',
      avatar: '/avatar3.jpg',
    },
    timestamp: '3:00 PM',
  },
  {
    id: '8',
    text: 'The deadlock issue has been resolved.',
    user: {
      id: 'user1',
      name: 'User 1',
      avatar: '/avatar1.jpg',
    },
    timestamp: '3:15 PM',
  },
  {
    id: '9',
    text: 'I\'ve added proper error handling and logging.',
    user: {
      id: 'user2',
      name: 'User 2',
      avatar: '/avatar2.jpg',
    },
    timestamp: '3:30 PM',
  },
  {
    id: '10',
    text: 'Perfect! The application is now working smoothly.',
    user: {
      id: 'user3',
      name: 'User 3',
      avatar: '/avatar3.jpg',
    },
    timestamp: '3:45 PM',  // Newest message
  },
];

interface DiscussionPageProps {
  initialTitle?: string;
}

export default function DiscussionPage({ initialTitle }: DiscussionPageProps) {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialTitle ? [] : sampleMessages);
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messageContainerRef = useRef<null | HTMLDivElement>(null);

  // Scroll to bottom on initial load and when messages change
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial scroll to bottom
    scrollToBottom();
  }, []);

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const handleChannelClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChannelClose = (channel?: string) => {
    if (channel) {
      setSelectedChannel(channel);
    }
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
      <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 500 }}>
            Discussions
          </Typography>
          <Button
            onClick={handleChannelClick}
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              px: 2,
              py: 1,
              bgcolor: '#fff',
              color: '#1976d2',
              textTransform: 'none',
              '&:hover': { bgcolor: '#f5f5f5' },
              boxShadow: 1,
            }}
          >
            {selectedChannel}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => handleChannelClose()}
            PaperProps={{
              elevation: 2,
              sx: { minWidth: 200 }
            }}
          >
            {channels.map((channel) => (
              <MenuItem 
                key={channel}
                onClick={() => handleChannelClose(channel)}
                selected={channel === selectedChannel}
                sx={{ 
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: '#e3f2fd',
                    '&:hover': { bgcolor: '#e3f2fd' }
                  }
                }}
              >
                {channel}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ mb: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ color: '#1976d2' }}>
            {initialTitle}
          </Typography>
        </Box>
        
        <Box 
          ref={messageContainerRef}
          sx={{ 
            p: 2, 
            bgcolor: '#f8f9fa', 
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#555',
              },
            },
          }}
        >
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  mb: 2,
                  alignItems: 'flex-start',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              >
                <Avatar src={message.user.avatar} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {message.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {message.timestamp}
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {message.text}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>

      <Paper
        component="form"
        sx={{
          p: 2,
          bgcolor: '#fff',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!newMessage.trim()) return;
          
          const newMsg: Message = {
            id: String(messages.length + 1),
            text: newMessage,
            user: {
              id: 'user1',
              name: 'User 1',
              avatar: '/avatar1.jpg',
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          
          setMessages([...messages, newMsg]);
          setNewMessage('');
        }}
      >
        <InputBase
          fullWidth
          placeholder="Type something here...."
          value={newMessage}
          onChange={handleMessageChange}
          sx={{ ml: 1 }}
        />
        <IconButton 
          type="submit"
          color="primary"
          sx={{ 
            bgcolor: '#1976d2',
            color: '#fff',
            '&:hover': { 
              bgcolor: '#1565c0'
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Container>
  );
} 