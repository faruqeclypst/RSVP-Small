import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useFirebase } from '../hooks/useFirebase';

const LoadingAnimation: React.FC = () => {
  const [show, setShow] = useState(true);
  const { loading, operationLoading } = useFirebase();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!loading && !operationLoading) {
      timer = setTimeout(() => {
        setShow(false);
      }, 1000); // 1 second delay
    } else {
      setShow(true);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, operationLoading]);

  if (!show) return null;

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
        backgroundColor: 'rgba(0, 128, 0, 0.9)', // Islamic green background
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          width: '100px',
          height: '100px',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            border: '4px solid #fff',
            borderRadius: '50%',
            animation: 'pulse 2s linear infinite',
          },
          '&::after': {
            content: '"☪"', // Crescent moon symbol
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '40px',
            color: '#fff',
            animation: 'rotate 2s linear infinite',
          },
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(0.8)',
              opacity: 0.8,
            },
            '50%': {
              transform: 'scale(1)',
              opacity: 1,
            },
            '100%': {
              transform: 'scale(0.8)',
              opacity: 0.8,
            },
          },
          '@keyframes rotate': {
            '0%': {
              transform: 'translate(-50%, -50%) rotate(0deg)',
            },
            '100%': {
              transform: 'translate(-50%, -50%) rotate(360deg)',
            },
          },
        }}
      />
    </Box>
  );
};

export default LoadingAnimation;