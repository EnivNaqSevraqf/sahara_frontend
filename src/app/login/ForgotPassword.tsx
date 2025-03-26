import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { TextField, CircularProgress, Alert, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Box } from '@mui/system';
import axios from 'axios';
import { currentConfig } from '@/config';

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
      setMessage({
        type: 'success',
        text: 'A verification code has been sent to your email.'
      });
      setStep(2);
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
            <DialogTitle>Reset password</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '300px' }}>
              <DialogContentText>
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
              />

              

              {message.text && (
                <Alert severity={message.type as 'error' | 'success'}>
                  {message.text}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
              <Button onClick={handleCancel} disabled={loading}>Cancel</Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Sending...' : 'Request Code'}
              </Button>
            </DialogActions>
          </Box>
        );
      
      case 2:
        return (
          <Box component="form" onSubmit={handleVerifyOTP} sx={{ width: '100%' }}>
            <DialogTitle>Verify Code</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '300px' }}>
              <DialogContentText>
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
              />

              {message.text && (
                <Alert severity={message.type as 'error' | 'success'}>
                  {message.text}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
              <Button onClick={() => setStep(1)} disabled={loading}>Back</Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </DialogActions>
          </Box>
        );
      
      case 3:
        return (
          <Box component="form" onSubmit={handleResetPassword} sx={{ width: '100%' }}>
            <DialogTitle>Set New Password</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '300px' }}>
              <DialogContentText>
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
              />

              {message.text && (
                <Alert severity={message.type as 'error' | 'success'}>
                  {message.text}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
              <Button onClick={() => setStep(2)} disabled={loading}>Back</Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
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
        sx: { backgroundImage: 'none', width: '100%', maxWidth: '500px' },
      }}
    >
      {renderStepContent()}
    </Dialog>
  );
}