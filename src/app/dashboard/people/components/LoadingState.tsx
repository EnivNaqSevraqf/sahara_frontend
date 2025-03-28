import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
      <CircularProgress size={24} sx={{ mr: 2 }} />
      <Typography>{message}</Typography>
    </Box>
  );
};

export default LoadingState; 