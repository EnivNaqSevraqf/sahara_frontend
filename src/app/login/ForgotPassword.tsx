import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { TextField, CircularProgress, Alert, FormControl, InputLabel, MenuItem, Select, Box as MuiBox } from '@mui/material';
import { Box } from '@mui/system';
import axios from 'axios';
import { currentConfig } from '@/config';
import Image from 'next/image';

//user roles based on backend enum
//type UserRole = 'prof' | 'student' | 'ta';

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [step, setStep] = useState(1); // 1: request OTP, 2: verify OTP, 3: set new password

  const handleRequestOTP = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${currentConfig.apiBaseUrl}/request-otp`, { email });
      
      // Check the status returned from the backend
      if (response.data.status === 'user_not_found') {
        setMessage({
          type: 'error',
          text: 'We could not find an account with that email address. Please check your email or register for a new account.'
        });
      } else {
        setMessage({
          type: 'success',
          text: 'A verification code has been sent to your email.'
        });
        setStep(2);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage({
          type: 'error',
          text: error.response?.data?.detail || 'Failed to send verification code'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'An error occurred. Please try again later.'
        });
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${currentConfig.apiBaseUrl}/verify-otp`, { email, otp });
      setMessage({
        type: 'success',
        text: 'Verification successful. Please set your new password.'
      });
      setStep(3);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage({
          type: 'error',
          text: error.response?.data?.detail || 'Invalid verification code'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'An error occurred. Please try again later.'
        });
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match'
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${currentConfig.apiBaseUrl}/reset-password-with-otp`, {
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      setMessage({
        type: 'success',
        text: 'Your password has been reset successfully.'
      });
      setTimeout(() => {
        handleClose();
        resetForm();
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage({
          type: 'error',
          text: error.response?.data?.detail || 'Failed to reset password'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'An error occurred. Please try again later.'
        });
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage({ type: '', text: '' });
    setStep(1);
  };

  const handleCancel = () => {
    resetForm();
    handleClose();
  };

  // Render different forms based on step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Box component="form" onSubmit={handleRequestOTP} sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Image 
                  src="/sahara_logo.svg" 
                  alt="SAHARA" 
                  width={160} 
                  height={50} 
                  priority
                />
              </Box>
            </Box>
            <DialogTitle sx={{ 
              textAlign: 'center', 
              fontWeight: 600, 
              fontSize: '1.3rem',
              color: '#1e293b',
              pb: 0.5,
              pt: 1
            }}>
              Reset Password
            </DialogTitle>
            <DialogContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5, 
              minWidth: '300px',
              pb: 1,
              pt: 1
            }}>
              <DialogContentText sx={{ 
                color: '#64748b', 
                textAlign: 'center',
                fontSize: '0.9rem',
                mb: 0.5
              }}>
                Enter your email address. We'll send you a verification code.
              </DialogContentText>
              
              <TextField
                autoFocus
                required
                margin="dense"
                id="email"
                name="email"
                label="Email address"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />

              {message.text && (
                <Alert 
                  severity={message.type as 'error' | 'success'}
                  sx={{ 
                    borderRadius: '8px',
                    mt: 0.5
                  }}
                >
                  {message.text}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ 
              pb: 2, 
              px: 2,
              justifyContent: 'space-between'
            }}>
              <Button 
                onClick={handleCancel} 
                disabled={loading}
                sx={{ 
                  color: '#64748b',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{
                  background: "linear-gradient(to right, #3b82f6, #6366f1)",
                  color: "white",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontWeight: 600,
                  '&:hover': {
                    background: "linear-gradient(to right, #2563eb, #4f46e5)",
                  },
                  '&:disabled': {
                    backgroundColor: "rgba(0, 0, 0, 0.12)",
                  }
                }}
              >
                {loading ? 'Sending...' : 'Request Code'}
              </Button>
            </DialogActions>
          </Box>
        );
      
      case 2:
        return (
          <Box component="form" onSubmit={handleVerifyOTP} sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Image 
                  src="/sahara_logo.svg" 
                  alt="SAHARA" 
                  width={160} 
                  height={50} 
                  priority
                />
              </Box>
            </Box>
            <DialogTitle sx={{ 
              textAlign: 'center', 
              fontWeight: 600, 
              fontSize: '1.3rem',
              color: '#1e293b',
              pb: 0.5,
              pt: 1
            }}>
              Verify Code
            </DialogTitle>
            <DialogContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5, 
              minWidth: '300px',
              pb: 1,
              pt: 1
            }}>
              <DialogContentText sx={{ 
                color: '#64748b', 
                textAlign: 'center',
                fontSize: '0.9rem',
                mb: 0.5
              }}>
                Enter the verification code sent to your email.
              </DialogContentText>
              
              <TextField
                autoFocus
                required
                margin="dense"
                id="otp"
                name="otp"
                label="Verification Code"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />

              {message.text && (
                <Alert 
                  severity={message.type as 'error' | 'success'}
                  sx={{ 
                    borderRadius: '8px',
                    mt: 0.5
                  }}
                >
                  {message.text}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ 
              pb: 2, 
              px: 2,
              justifyContent: 'space-between'
            }}>
              <Button 
                onClick={() => setStep(1)} 
                disabled={loading}
                sx={{ 
                  color: '#64748b',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{
                  background: "linear-gradient(to right, #3b82f6, #6366f1)",
                  color: "white",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontWeight: 600,
                  '&:hover': {
                    background: "linear-gradient(to right, #2563eb, #4f46e5)",
                  },
                  '&:disabled': {
                    backgroundColor: "rgba(0, 0, 0, 0.12)",
                  }
                }}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </DialogActions>
          </Box>
        );
      
      case 3:
        return (
          <Box component="form" onSubmit={handleResetPassword} sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <Box sx={{ filter: 'brightness(0) invert(1)' }}>
                <Image 
                  src="/sahara_logo.svg" 
                  alt="SAHARA" 
                  width={160} 
                  height={50} 
                  priority
                />
              </Box>
            </Box>
            <DialogTitle sx={{ 
              textAlign: 'center', 
              fontWeight: 600, 
              fontSize: '1.3rem',
              color: '#1e293b',
              pb: 0.5,
              pt: 1
            }}>
              Set New Password
            </DialogTitle>
            <DialogContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5, 
              minWidth: '300px',
              pb: 1,
              pt: 1
            }}>
              <DialogContentText sx={{ 
                color: '#64748b', 
                textAlign: 'center',
                fontSize: '0.9rem',
                mb: 0.5
              }}>
                Please enter and confirm your new password.
              </DialogContentText>
              
              <TextField
                autoFocus
                required
                margin="dense"
                id="new-password"
                name="new-password"
                label="New Password"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />

              <TextField
                required
                margin="dense"
                id="confirm-password"
                name="confirm-password"
                label="Confirm Password"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />

              {message.text && (
                <Alert 
                  severity={message.type as 'error' | 'success'}
                  sx={{ 
                    borderRadius: '8px',
                    mt: 0.5
                  }}
                >
                  {message.text}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ 
              pb: 2, 
              px: 2,
              justifyContent: 'space-between'
            }}>
              <Button 
                onClick={() => setStep(2)} 
                disabled={loading}
                sx={{ 
                  color: '#64748b',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{
                  background: "linear-gradient(to right, #3b82f6, #6366f1)",
                  color: "white",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontWeight: 600,
                  '&:hover': {
                    background: "linear-gradient(to right, #2563eb, #4f46e5)",
                  },
                  '&:disabled': {
                    backgroundColor: "rgba(0, 0, 0, 0.12)",
                  }
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </DialogActions>
          </Box>
        );
      
      default:
        return null;
    }
  };
  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { 
          backgroundImage: 'none', 
          width: '100%', 
          maxWidth: '500px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(to right, #3b82f6, #6366f1)',
          }
        },
      }}
    >
      {renderStepContent()}
    </Dialog>
  );
}