import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingAnimation: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
      }}
    >
      <CircularProgress size={80} thickness={4} />
    </Box>
  );
};

export default LoadingAnimation;